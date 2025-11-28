/**
 * Unit tests for syncStore
 * Tests exponential backoff, image sync, conflict resolution, and queue processing
 */

import { databaseService } from '../../services/database';
import { apiService } from '../../services/api';
import { connectivityService } from '../../services/connectivity';
import { mediaStorageService } from '../../services/storage';

// Mock the dependencies
jest.mock('../../services/database', () => require('../../services/__mocks__/database'));
jest.mock('../../services/api');
jest.mock('../../services/connectivity');
jest.mock('../../services/firebase');
jest.mock('../../config/firebaseConfig');
jest.mock('../../services/storage', () => ({
  storeLastSync: jest.fn(),
  getLastSync: jest.fn(),
  mediaStorageService: {
    uploadImage: jest.fn(),
    pickImage: jest.fn(),
    takePicture: jest.fn(),
    compressImage: jest.fn(),
    uploadMultipleImages: jest.fn(),
  },
}));
jest.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      user: { id: 'test-user-123' },
    })),
  },
}));

// Import after mocks
import { useSyncStore } from '../../stores/syncStore';
import { storeLastSync, getLastSync } from '../../services/storage';

describe('syncStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useSyncStore.setState({
      isOnline: true,
      lastSync: undefined,
      syncInProgress: false,
      autoSync: true,
      pendingOperations: 0,
      queueProcessing: false,
      pendingImages: 0,
    });
  });

  describe('checkConnection', () => {
    it('should return true when online and API is reachable', async () => {
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);

      const result = await useSyncStore.getState().checkConnection();

      expect(result).toBe(true);
      expect(useSyncStore.getState().isOnline).toBe(true);
    });

    it('should return false when offline', async () => {
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(false);

      const result = await useSyncStore.getState().checkConnection();

      expect(result).toBe(false);
      expect(useSyncStore.getState().isOnline).toBe(false);
    });

    it('should return false when API health check fails', async () => {
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await useSyncStore.getState().checkConnection();

      expect(result).toBe(false);
      expect(useSyncStore.getState().isOnline).toBe(false);
    });
  });

  describe('exponential backoff', () => {
    it('should skip operations that are in backoff period', async () => {
      const now = Date.now();
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({ userId: 'user1', pointId: 'point1', action: 'ADD' }),
          status: 'retry' as const,
          retry_count: 2, // Should have 4 second backoff (1 * 2^2)
          last_attempt: now - 2000, // Only 2 seconds ago
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(1);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      // Should not mark operation in progress because backoff not elapsed
      expect(databaseService.markOperationInProgress).not.toHaveBeenCalled();
    });

    it('should process operations after backoff period expires', async () => {
      const now = Date.now();
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({ userId: 'user1', pointId: 'point1', action: 'ADD' }),
          status: 'retry' as const,
          retry_count: 2,
          last_attempt: now - 5000, // 5 seconds ago, backoff is 4s
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (apiService.addFavorite as jest.Mock).mockResolvedValue({ success: true });
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.isFavorite as jest.Mock).mockResolvedValue(false);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      expect(databaseService.markOperationInProgress).toHaveBeenCalledWith(1);
      expect(apiService.addFavorite).toHaveBeenCalledWith('point1');
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith(1);
    });
  });

  describe('conflict resolution', () => {
    it('should use local version when local timestamp is newer', async () => {
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({
            userId: 'user1',
            pointId: 'point1',
            action: 'ADD',
            timestamp: '2024-01-02T00:00:00Z',
            remoteTimestamp: '2024-01-01T00:00:00Z',
          }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock).mockResolvedValue({ success: true });
      (databaseService.isFavorite as jest.Mock).mockResolvedValue(true);
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      // Should proceed with local version (add favorite)
      expect(apiService.addFavorite).toHaveBeenCalledWith('point1');
    });

    it('should use remote version when remote timestamp is newer and states differ', async () => {
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({
            userId: 'user1',
            pointId: 'point1',
            action: 'ADD',
            timestamp: '2024-01-01T00:00:00Z',
            remoteTimestamp: '2024-01-02T00:00:00Z',
          }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({
        points: [], // Remote doesn't have it as favorite
      });
      (databaseService.isFavorite as jest.Mock).mockResolvedValue(true); // Local has it
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      // Should use remote version (not favorite) and update local to match
      expect(apiService.addFavorite).not.toHaveBeenCalled();
      expect(databaseService.setFavoriteStatus).toHaveBeenCalledWith({
        pointId: 'point1',
        userId: 'user1',
        isFavorite: false, // Updated to match remote
        synced: true,
      });
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith(1);
    });
  });

  describe('syncImages', () => {
    it('should upload image and associate with point when storage upload is enabled', async () => {
      const imageOps = [
        {
          id: 1,
          point_id: 'point1',
          image_uri: 'file:///image.jpg',
          payload: JSON.stringify({ pointId: 'point1', imageUri: 'file:///image.jpg' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      const uploadedUrl = 'https://storage.example.com/uploaded-image.jpg';
      
      (databaseService.getPendingImages as jest.Mock).mockResolvedValue(imageOps);
      (databaseService.markImageSyncInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markImageSyncCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);
      (mediaStorageService.uploadImage as jest.Mock).mockResolvedValue(uploadedUrl);
      (apiService.addImageToPoint as jest.Mock).mockResolvedValue({ point: { id: 'point1' } });

      await useSyncStore.getState().syncImages();

      expect(databaseService.markImageSyncInProgress).toHaveBeenCalledWith(1);
      expect(mediaStorageService.uploadImage).toHaveBeenCalledWith('file:///image.jpg');
      expect(apiService.addImageToPoint).toHaveBeenCalledWith('point1', uploadedUrl);
      expect(databaseService.markImageSyncCompleted).toHaveBeenCalledWith(1);
    });

    it('should process pending images with backoff', async () => {
      const now = Date.now();
      const imageOps = [
        {
          id: 1,
          point_id: 'point1',
          image_uri: 'file:///image.jpg',
          payload: JSON.stringify({ pointId: 'point1', imageUri: 'file:///image.jpg' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getPendingImages as jest.Mock).mockResolvedValue(imageOps);
      (databaseService.markImageSyncInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markImageSyncCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);
      (mediaStorageService.uploadImage as jest.Mock).mockResolvedValue('https://example.com/img.jpg');
      (apiService.addImageToPoint as jest.Mock).mockResolvedValue({ point: { id: 'point1' } });

      await useSyncStore.getState().syncImages();

      expect(databaseService.markImageSyncInProgress).toHaveBeenCalledWith(1);
      expect(databaseService.markImageSyncCompleted).toHaveBeenCalledWith(1);
    });

    it('should skip image sync when user is not authenticated', async () => {
      const { useAuthStore } = require('../../stores/authStore');
      useAuthStore.getState.mockReturnValueOnce({ user: null });

      (databaseService.getPendingImages as jest.Mock).mockResolvedValue([]);

      await useSyncStore.getState().syncImages();

      expect(databaseService.getPendingImages).not.toHaveBeenCalled();
    });

    it('should handle image sync failures with retry', async () => {
      const imageOps = [
        {
          id: 1,
          point_id: 'point1',
          image_uri: 'file:///image.jpg',
          payload: JSON.stringify({ pointId: 'point1', imageUri: 'file:///image.jpg' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getPendingImages as jest.Mock).mockResolvedValue(imageOps);
      (databaseService.markImageSyncInProgress as jest.Mock).mockResolvedValue(undefined);
      (mediaStorageService.uploadImage as jest.Mock).mockRejectedValueOnce(
        new Error('upload failed')
      );
      (databaseService.markImageSyncFailed as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(1);

      await useSyncStore.getState().syncImages();

      expect(databaseService.markImageSyncFailed).toHaveBeenCalledWith(1);
    });

    it('should still mark as completed when addImageToPoint fails but upload succeeds', async () => {
      const imageOps = [
        {
          id: 1,
          point_id: 'point1',
          image_uri: 'file:///image.jpg',
          payload: JSON.stringify({ pointId: 'point1', imageUri: 'file:///image.jpg' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      const uploadedUrl = 'https://storage.example.com/uploaded-image.jpg';
      
      (databaseService.getPendingImages as jest.Mock).mockResolvedValue(imageOps);
      (databaseService.markImageSyncInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markImageSyncCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);
      (mediaStorageService.uploadImage as jest.Mock).mockResolvedValue(uploadedUrl);
      (apiService.addImageToPoint as jest.Mock).mockRejectedValue(new Error('Point not found'));

      await useSyncStore.getState().syncImages();

      // Should still mark as completed because upload succeeded
      expect(databaseService.markImageSyncCompleted).toHaveBeenCalledWith(1);
      expect(databaseService.markImageSyncFailed).not.toHaveBeenCalled();
    });

    it('should mark images without imageUri as failed', async () => {
      const imageOps = [
        {
          id: 1,
          point_id: 'point1',
          image_uri: '',
          payload: JSON.stringify({ pointId: 'point1' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getPendingImages as jest.Mock).mockResolvedValue(imageOps);
      (databaseService.markImageSyncInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markImageSyncFailed as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().syncImages();

      expect(mediaStorageService.uploadImage).not.toHaveBeenCalled();
      expect(databaseService.markImageSyncFailed).toHaveBeenCalledWith(1);
    });
  });

  describe('syncAll', () => {
    it('should sync all data types including images', async () => {
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (apiService.getPoints as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.getSymptoms as jest.Mock).mockResolvedValue({ symptoms: [] });
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (databaseService.upsertPoints as jest.Mock).mockResolvedValue(undefined);
      (databaseService.removePointsNotIn as jest.Mock).mockResolvedValue(undefined);
      (databaseService.upsertSymptoms as jest.Mock).mockResolvedValue(undefined);
      (databaseService.replaceFavorites as jest.Mock).mockResolvedValue(undefined);
      (databaseService.updateSyncStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([]);
      (databaseService.getPendingImages as jest.Mock).mockResolvedValue([]);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);
      (storeLastSync as jest.Mock).mockResolvedValue(undefined);

      await useSyncStore.getState().syncAll();

      expect(apiService.getPoints).toHaveBeenCalled();
      expect(apiService.getSymptoms).toHaveBeenCalled();
      expect(apiService.getFavorites).toHaveBeenCalled();
      expect(databaseService.getPendingImages).toHaveBeenCalled();
      expect(storeLastSync).toHaveBeenCalled();
    });

    it('should throw error when offline', async () => {
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(false);

      await expect(useSyncStore.getState().syncAll()).rejects.toThrow(
        'Sem conexão com a internet'
      );
    });
  });

  describe('refreshPendingOperations', () => {
    it('should update pending counts for operations and images', async () => {
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(5);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(3);

      await useSyncStore.getState().refreshPendingOperations();

      expect(useSyncStore.getState().pendingOperations).toBe(5);
      expect(useSyncStore.getState().pendingImages).toBe(3);
    });

    it('should handle errors gracefully', async () => {
      (databaseService.countPendingOperations as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      await useSyncStore.getState().refreshPendingOperations();

      // Should not throw, just log error
      expect(useSyncStore.getState().pendingOperations).toBe(0);
    });
  });

  describe('processSyncQueue', () => {
    it('should not process when already processing', async () => {
      useSyncStore.setState({ queueProcessing: true });

      await useSyncStore.getState().processSyncQueue();

      expect(databaseService.getQueuedOperations).not.toHaveBeenCalled();
    });

    it('should not process when offline', async () => {
      useSyncStore.setState({ isOnline: false });

      await useSyncStore.getState().processSyncQueue();

      expect(databaseService.getQueuedOperations).not.toHaveBeenCalled();
    });

    it('should process ADD favorite operation', async () => {
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({ userId: 'user1', pointId: 'point1', action: 'ADD' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (apiService.addFavorite as jest.Mock).mockResolvedValue({ success: true });
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.isFavorite as jest.Mock).mockResolvedValue(false);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      expect(apiService.addFavorite).toHaveBeenCalledWith('point1');
      expect(databaseService.setFavoriteStatus).toHaveBeenCalledWith({
        pointId: 'point1',
        userId: 'user1',
        isFavorite: true,
        synced: true,
      });
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith(1);
    });

    it('should process REMOVE favorite operation', async () => {
      const operations = [
        {
          id: 1,
          entity_type: 'favorite',
          data: JSON.stringify({ userId: 'user1', pointId: 'point1', action: 'REMOVE' }),
          status: 'pending' as const,
          retry_count: 0,
          created_at: new Date().toISOString(),
        },
      ];

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
        (apiService.removeFavorite as jest.Mock).mockResolvedValue({ success: true });
        (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [{ id: 'point1' }] });
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.isFavorite as jest.Mock).mockResolvedValue(false);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);

      await useSyncStore.getState().processSyncQueue();

      expect(apiService.removeFavorite).toHaveBeenCalledWith('point1');
      expect(databaseService.setFavoriteStatus).toHaveBeenCalledWith({
        pointId: 'point1',
        userId: 'user1',
        isFavorite: false,
        synced: true,
      });
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith(1);
    });
  });
});
