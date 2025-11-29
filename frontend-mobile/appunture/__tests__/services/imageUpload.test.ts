/**
 * Tests for imageUpload service
 */

import * as ImagePicker from "expo-image-picker";
import { PermissionStatus } from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  requestMediaLibraryPermission,
  requestCameraPermission,
  pickImage,
  takePhoto,
  compressImage,
  createImageFormData,
  uploadProfileImage,
  useImagePicker,
} from "../../services/imageUpload";

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
  PermissionStatus: {
    GRANTED: "granted",
    DENIED: "denied",
    UNDETERMINED: "undetermined",
  },
}));

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg" },
}));

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockImageManipulator = ImageManipulator as jest.Mocked<
  typeof ImageManipulator
>;

describe("imageUpload service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestMediaLibraryPermission", () => {
    it("should return true when permission is granted", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });

      const result = await requestMediaLibraryPermission();

      expect(result).toBe(true);
      expect(
        mockImagePicker.requestMediaLibraryPermissionsAsync
      ).toHaveBeenCalled();
    });

    it("should return false when permission is denied", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.DENIED,
        canAskAgain: true,
        granted: false,
        expires: "never",
      });

      const result = await requestMediaLibraryPermission();

      expect(result).toBe(false);
    });

    it("should return false when permission request fails", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockRejectedValue(
        new Error("Failed")
      );

      const result = await requestMediaLibraryPermission();

      expect(result).toBe(false);
    });
  });

  describe("requestCameraPermission", () => {
    it("should return true when permission is granted", async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });

      const result = await requestCameraPermission();

      expect(result).toBe(true);
      expect(mockImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it("should return false when permission is denied", async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.DENIED,
        canAskAgain: true,
        granted: false,
        expires: "never",
      });

      const result = await requestCameraPermission();

      expect(result).toBe(false);
    });
  });

  describe("pickImage", () => {
    it("should return image URI when image is picked", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///path/to/image.jpg" }],
      } as any);

      const result = await pickImage();

      expect(result).toBe("file:///path/to/image.jpg");
      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    });

    it("should return null when image pick is cancelled", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      } as any);

      const result = await pickImage();

      expect(result).toBeNull();
    });

    it("should throw error when permission is denied", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.DENIED,
        canAskAgain: true,
        granted: false,
        expires: "never",
      });

      await expect(pickImage()).rejects.toThrow(
        "Permissão de acesso à galeria negada"
      );
    });

    it("should use custom options when provided", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///path/to/image.jpg" }],
      } as any);

      await pickImage({ quality: 0.5, aspect: [4, 3] });

      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
    });
  });

  describe("takePhoto", () => {
    it("should return photo URI when photo is taken", async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///path/to/photo.jpg" }],
      } as any);

      const result = await takePhoto();

      expect(result).toBe("file:///path/to/photo.jpg");
    });

    it("should return null when photo capture is cancelled", async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: true,
        assets: [],
      } as any);

      const result = await takePhoto();

      expect(result).toBeNull();
    });

    it("should throw error when camera permission is denied", async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.DENIED,
        canAskAgain: true,
        granted: false,
        expires: "never",
      });

      await expect(takePhoto()).rejects.toThrow("Permissão de câmera negada");
    });
  });

  describe("compressImage", () => {
    it("should compress image with default settings", async () => {
      const inputUri = "file:///path/to/image.jpg";
      const outputUri = "file:///path/to/compressed.jpg";

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: outputUri,
        width: 500,
        height: 500,
      });

      const result = await compressImage(inputUri);

      expect(result).toBe(outputUri);
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        inputUri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
    });

    it("should use custom size and quality", async () => {
      const inputUri = "file:///path/to/image.jpg";

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: "file:///output.jpg",
        width: 800,
        height: 800,
      });

      await compressImage(inputUri, 800, 0.9);

      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        inputUri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
    });

    it("should throw error when compression fails", async () => {
      mockImageManipulator.manipulateAsync.mockRejectedValue(
        new Error("Compression failed")
      );

      await expect(compressImage("file:///test.jpg")).rejects.toThrow(
        "Falha ao processar imagem"
      );
    });
  });

  describe("createImageFormData", () => {
    it("should create FormData with correct fields", () => {
      const uri = "file:///path/to/image.jpg";
      const formData = createImageFormData(uri);

      expect(formData).toBeInstanceOf(FormData);
    });

    it("should use custom field name and type", () => {
      const uri = "file:///path/to/image.jpg";
      const formData = createImageFormData(uri, "avatar", "user-photo");

      expect(formData).toBeInstanceOf(FormData);
    });
  });

  describe("uploadProfileImage", () => {
    it("should compress and upload image", async () => {
      const inputUri = "file:///path/to/image.jpg";
      const compressedUri = "file:///path/to/compressed.jpg";
      const uploadResult = {
        url: "https://storage.example.com/profile.jpg",
        thumbnailUrl: "https://storage.example.com/profile_thumb.jpg",
      };

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: compressedUri,
        width: 500,
        height: 500,
      });

      const mockUploadFn = jest.fn().mockResolvedValue(uploadResult);
      const mockOnProgress = jest.fn();

      const result = await uploadProfileImage(
        inputUri,
        mockUploadFn,
        mockOnProgress
      );

      expect(result).toEqual(uploadResult);
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalled();
      expect(mockUploadFn).toHaveBeenCalled();
    });

    it("should propagate upload errors", async () => {
      const inputUri = "file:///path/to/image.jpg";

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: "file:///compressed.jpg",
        width: 500,
        height: 500,
      });

      const mockUploadFn = jest
        .fn()
        .mockRejectedValue(new Error("Upload failed"));

      await expect(uploadProfileImage(inputUri, mockUploadFn)).rejects.toThrow(
        "Upload failed"
      );
    });
  });

  describe("useImagePicker", () => {
    it("should return picker functions", () => {
      const picker = useImagePicker();

      expect(picker).toHaveProperty("pickFromGallery");
      expect(picker).toHaveProperty("takeWithCamera");
      expect(typeof picker.pickFromGallery).toBe("function");
      expect(typeof picker.takeWithCamera).toBe("function");
    });

    it("should pass options to picker functions", async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: PermissionStatus.GRANTED,
        canAskAgain: true,
        granted: true,
        expires: "never",
      });
      mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///test.jpg" }],
      } as any);

      const picker = useImagePicker({ quality: 0.5 });
      await picker.pickFromGallery();

      expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
        expect.objectContaining({ quality: 0.5 })
      );
    });
  });
});
