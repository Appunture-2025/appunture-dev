/**
 * E2E tests for offline sync functionality
 * Tests offline→online scenarios, queue processing, and conflict resolution
 */

import { databaseService } from '../../services/database';
import { apiService } from '../../services/api';
import { connectivityService } from '../../services/connectivity';
import { useSyncStore } from '../../stores/syncStore';
import type { SyncOperation } from '../../types/database';

// Mock the dependencies
jest.mock('../../services/database', () => require('../../services/__mocks__/database'));
jest.mock('../../services/api');
jest.mock('../../services/connectivity');
jest.mock('../../services/firebase');
jest.mock('../../config/firebaseConfig');
jest.mock('../../services/storage', () => ({
  storeLastSync: jest.fn(),
  getLastSync: jest.fn(),
}));
jest.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      user: { id: 'test-user-123' },
    })),
  },
}));

describe('Offline Sync E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSyncStore.setState({
      isOnline: true,
      lastSync: undefined,
      syncInProgress: false,
      autoSync: true,
      pendingOperations: 0,
      pendingImages: 0,
      queueProcessing: false,
      failedOperations: [],
      notificationMessage: null,
    });
  });

  describe('Scenario 1: Add favorite offline → come online → verify sync', () => {
    it('should queue favorite operation when offline and sync when online', async () => {
      const store = useSyncStore.getState();

      // Step 1: Go offline
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(false);
      await store.checkConnection();
      expect(useSyncStore.getState().isOnline).toBe(false);

      // Step 2: Create favorite operation in queue
      const favoriteOperation: SyncOperation = {
        id: 'fav-1',
        entity_type: 'favorite',
        operation: 'UPSERT',
        data: JSON.stringify({
          userId: 'test-user-123',
          pointId: 'point-1',
          action: 'ADD',
          timestamp: new Date().toISOString(),
        }),
        timestamp: Date.now(),
        retry_count: 0,
        status: 'pending',
        created_at: Date.now(),
      };

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([favoriteOperation]);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(1);

      await store.refreshPendingOperations();
      expect(useSyncStore.getState().pendingOperations).toBe(1);

      // Step 3: Come back online
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock).mockResolvedValue({});
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.checkConnection();
      expect(useSyncStore.getState().isOnline).toBe(true);

      // Step 4: Process sync queue
      await store.processSyncQueue();

      // Step 5: Verify API was called
      expect(apiService.getFavorites).toHaveBeenCalled();
      expect(apiService.addFavorite).toHaveBeenCalledWith('point-1');
      expect(databaseService.setFavoriteStatus).toHaveBeenCalledWith({
        pointId: 'point-1',
        userId: 'test-user-123',
        isFavorite: true,
        synced: true,
      });
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith('fav-1');
    });
  });

  describe('Scenario 2: Create point offline → come online → verify on server', () => {
    it('should create point locally and sync to server when online', async () => {
      const store = useSyncStore.getState();

      // Step 1: Offline - queue point creation
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(false);
      await store.checkConnection();

      const pointOperation: SyncOperation = {
        id: 'point-create-1',
        entity_type: 'point',
        operation: 'CREATE',
        data: JSON.stringify({
          point: {
            code: 'LI4',
            name: 'Hegu',
            meridian: 'Intestino Grosso',
            location: 'Dorso da mão',
            functions: 'Elimina vento',
            indications: 'Cefaleia, rinite',
          },
          localId: 'temp-local-id-1',
          timestamp: new Date().toISOString(),
        }),
        timestamp: Date.now(),
        retry_count: 0,
        status: 'pending',
        created_at: Date.now(),
      };

      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([pointOperation]);

      // Step 2: Come online
      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (apiService.createPoint as jest.Mock).mockResolvedValue({
        point: {
          id: 'server-point-id',
          code: 'LI4',
          name: 'Hegu',
          meridian: 'Intestino Grosso',
          location: 'Dorso da mão',
          functions: 'Elimina vento',
          indications: 'Cefaleia, rinite',
        },
      });
      (databaseService.deletePointById as jest.Mock).mockResolvedValue(undefined);
      (databaseService.upsertPoint as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markPointSynced as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.checkConnection();
      await store.processSyncQueue();

      // Step 3: Verify point was created on server
      expect(apiService.createPoint).toHaveBeenCalled();
      expect(databaseService.deletePointById).toHaveBeenCalledWith('temp-local-id-1');
      expect(databaseService.upsertPoint).toHaveBeenCalled();
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith('point-create-1');
    });
  });

  describe('Scenario 3: Conflict resolution - edit on app and web', () => {
    it('should resolve conflict using last-write-wins strategy', async () => {
      const store = useSyncStore.getState();

      // Local update with newer timestamp
      const localTimestamp = new Date('2025-11-12T15:00:00Z').toISOString();
      const remoteTimestamp = new Date('2025-11-12T14:00:00Z').toISOString();

      const updateOperation: SyncOperation = {
        id: 'point-update-1',
        entity_type: 'point',
        operation: 'UPDATE',
        data: JSON.stringify({
          point: {
            id: 'existing-point-id',
            name: 'Hegu (Updated Locally)',
          },
          timestamp: localTimestamp,
        }),
        timestamp: Date.parse(localTimestamp),
        retry_count: 0,
        status: 'pending',
        created_at: Date.now(),
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([updateOperation]);
      
      // Remote version has older timestamp
      (apiService.getPoint as jest.Mock).mockResolvedValue({
        point: {
          id: 'existing-point-id',
          name: 'Hegu (Old Remote)',
          updatedAt: remoteTimestamp,
        },
      });

      // Local should win
      (apiService.updatePoint as jest.Mock).mockResolvedValue({
        point: {
          id: 'existing-point-id',
          name: 'Hegu (Updated Locally)',
          updatedAt: localTimestamp,
        },
      });
      (databaseService.upsertPoint as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markPointSynced as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      // Verify local version was pushed to server
      expect(apiService.getPoint).toHaveBeenCalledWith('existing-point-id');
      expect(apiService.updatePoint).toHaveBeenCalledWith(
        'existing-point-id',
        expect.objectContaining({
          id: 'existing-point-id',
          name: 'Hegu (Updated Locally)',
        })
      );
    });

    it('should use remote version when remote is newer', async () => {
      const store = useSyncStore.getState();

      // Local update with older timestamp
      const localTimestamp = new Date('2025-11-12T14:00:00Z').toISOString();
      const remoteTimestamp = new Date('2025-11-12T15:00:00Z').toISOString();

      const updateOperation: SyncOperation = {
        id: 'point-update-2',
        entity_type: 'point',
        operation: 'UPDATE',
        data: JSON.stringify({
          point: {
            id: 'existing-point-id-2',
            name: 'Old Local Update',
          },
          timestamp: localTimestamp,
        }),
        timestamp: Date.parse(localTimestamp),
        retry_count: 0,
        status: 'pending',
        created_at: Date.now(),
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([updateOperation]);
      
      // Remote version has newer timestamp
      (apiService.getPoint as jest.Mock).mockResolvedValue({
        point: {
          id: 'existing-point-id-2',
          name: 'Newer Remote Update',
          updatedAt: remoteTimestamp,
        },
      });

      (databaseService.upsertPoint as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markPointSynced as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      // Verify remote version was used (updatePoint should NOT be called)
      expect(apiService.getPoint).toHaveBeenCalledWith('existing-point-id-2');
      expect(apiService.updatePoint).not.toHaveBeenCalled();
      expect(databaseService.upsertPoint).toHaveBeenCalled();
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith('point-update-2');
    });
  });

  describe('Exponential Backoff Retry', () => {
    it('should apply exponential backoff delays between retries', async () => {
      const store = useSyncStore.getState();

      const failedOperation: SyncOperation = {
        id: 'retry-test-1',
        entity_type: 'favorite',
        operation: 'UPSERT',
        data: JSON.stringify({
          userId: 'test-user-123',
          pointId: 'point-1',
          action: 'ADD',
        }),
        timestamp: Date.now() - 10000, // 10 seconds ago
        retry_count: 2, // Already tried twice
        status: 'retry',
        created_at: Date.now() - 10000,
        last_attempt: Date.now() - 5000, // Last attempt 5 seconds ago
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([failedOperation]);

      // Exponential backoff for retry_count=2: 1000 * 2^2 = 4000ms
      // Since last_attempt was 5 seconds ago, it should proceed
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock).mockResolvedValue({});
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      expect(databaseService.markOperationInProgress).toHaveBeenCalledWith('retry-test-1');
      expect(apiService.addFavorite).toHaveBeenCalled();
    });

    it('should skip operation if backoff delay has not elapsed', async () => {
      const store = useSyncStore.getState();

      const recentFailedOperation: SyncOperation = {
        id: 'retry-test-2',
        entity_type: 'favorite',
        operation: 'UPSERT',
        data: JSON.stringify({
          userId: 'test-user-123',
          pointId: 'point-2',
          action: 'ADD',
        }),
        timestamp: Date.now(),
        retry_count: 3, // Backoff: 1000 * 2^3 = 8000ms
        status: 'retry',
        created_at: Date.now(),
        last_attempt: Date.now() - 2000, // Only 2 seconds ago
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([recentFailedOperation]);

      await store.processSyncQueue();

      // Should not process because backoff delay hasn't elapsed
      expect(databaseService.markOperationInProgress).not.toHaveBeenCalled();
      expect(apiService.addFavorite).not.toHaveBeenCalled();
    });

    it('should mark operation as failed after MAX_RETRIES attempts', async () => {
      const store = useSyncStore.getState();

      const maxRetriesOperation: SyncOperation = {
        id: 'max-retry-test',
        entity_type: 'favorite',
        operation: 'UPSERT',
        data: JSON.stringify({
          userId: 'test-user-123',
          pointId: 'point-3',
          action: 'ADD',
        }),
        timestamp: Date.now() - 60000,
        retry_count: 4, // One more attempt before MAX_RETRIES (5)
        status: 'retry',
        created_at: Date.now() - 60000,
        last_attempt: Date.now() - 20000,
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([maxRetriesOperation]);
      (apiService.getFavorites as jest.Mock).mockRejectedValue(new Error('Network error'));
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationFailed as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      expect(databaseService.markOperationFailed).toHaveBeenCalledWith(
        'max-retry-test',
        'Network error'
      );
    });
  });

  describe('Queue Processing with Multiple Operations', () => {
    it('should process multiple operations in order', async () => {
      const store = useSyncStore.getState();

      const operations: SyncOperation[] = [
        {
          id: 'op-1',
          entity_type: 'favorite',
          operation: 'UPSERT',
          data: JSON.stringify({
            userId: 'test-user-123',
            pointId: 'point-1',
            action: 'ADD',
          }),
          timestamp: 1000,
          retry_count: 0,
          status: 'pending',
          created_at: 1000,
        },
        {
          id: 'op-2',
          entity_type: 'note',
          operation: 'CREATE',
          data: JSON.stringify({
            noteId: 1,
            pointId: 'point-1',
            content: 'Test note',
            userId: 'test-user-123',
            action: 'CREATE',
          }),
          timestamp: 2000,
          retry_count: 0,
          status: 'pending',
          created_at: 2000,
        },
      ];

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (apiService.healthCheck as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock).mockResolvedValue({});
      (apiService.createNote as jest.Mock).mockResolvedValue({ note: { id: 'note-1' } });
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markNoteSynced as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      expect(databaseService.markOperationCompleted).toHaveBeenCalledTimes(2);
      expect(databaseService.markOperationCompleted).toHaveBeenNthCalledWith(1, 'op-1');
      expect(databaseService.markOperationCompleted).toHaveBeenNthCalledWith(2, 'op-2');
    });

    it('should continue processing even if one operation fails', async () => {
      const store = useSyncStore.getState();

      const operations: SyncOperation[] = [
        {
          id: 'op-fail',
          entity_type: 'favorite',
          operation: 'UPSERT',
          data: JSON.stringify({
            userId: 'test-user-123',
            pointId: 'point-fail',
            action: 'ADD',
          }),
          timestamp: 1000,
          retry_count: 0,
          status: 'pending',
          created_at: 1000,
        },
        {
          id: 'op-success',
          entity_type: 'favorite',
          operation: 'UPSERT',
          data: JSON.stringify({
            userId: 'test-user-123',
            pointId: 'point-success',
            action: 'ADD',
          }),
          timestamp: 2000,
          retry_count: 0,
          status: 'pending',
          created_at: 2000,
        },
      ];

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue(operations);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({});
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationFailed as jest.Mock).mockResolvedValue(undefined);

      await store.processSyncQueue();

      expect(databaseService.markOperationFailed).toHaveBeenCalledWith('op-fail', 'Failed');
      expect(databaseService.markOperationCompleted).toHaveBeenCalledWith('op-success');
    });
  });

  describe('Notification Messages', () => {
    it('should set notification message after successful sync', async () => {
      const store = useSyncStore.getState();

      const operation: SyncOperation = {
        id: 'notify-test',
        entity_type: 'favorite',
        operation: 'UPSERT',
        data: JSON.stringify({
          userId: 'test-user-123',
          pointId: 'point-1',
          action: 'ADD',
        }),
        timestamp: Date.now(),
        retry_count: 0,
        status: 'pending',
        created_at: Date.now(),
      };

      (connectivityService.isOnline as jest.Mock).mockResolvedValue(true);
      (databaseService.getQueuedOperations as jest.Mock).mockResolvedValue([operation]);
      (apiService.getFavorites as jest.Mock).mockResolvedValue({ points: [] });
      (apiService.addFavorite as jest.Mock).mockResolvedValue({});
      (databaseService.setFavoriteStatus as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationInProgress as jest.Mock).mockResolvedValue(undefined);
      (databaseService.markOperationCompleted as jest.Mock).mockResolvedValue(undefined);
      (databaseService.countPendingOperations as jest.Mock).mockResolvedValue(0);
      (databaseService.countPendingImages as jest.Mock).mockResolvedValue(0);
      (databaseService.getFailedOperations as jest.Mock).mockResolvedValue([]);

      await store.processSyncQueue();

      const state = useSyncStore.getState();
      expect(state.notificationMessage).toBe('1 operação sincronizada');
    });
  });
});
