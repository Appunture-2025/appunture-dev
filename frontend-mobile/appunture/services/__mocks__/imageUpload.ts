/**
 * Mock for imageUpload service
 */

export const mockUploadResult = {
  url: "https://storage.example.com/profile_123.jpg",
  thumbnailUrl: "https://storage.example.com/profile_123_thumb.jpg",
  fileName: "profile_123.jpg",
};

export const requestMediaLibraryPermission = jest.fn().mockResolvedValue(true);
export const requestCameraPermission = jest.fn().mockResolvedValue(true);

export const pickImage = jest
  .fn()
  .mockResolvedValue("file:///path/to/image.jpg");
export const takePhoto = jest
  .fn()
  .mockResolvedValue("file:///path/to/photo.jpg");

export const compressImage = jest
  .fn()
  .mockImplementation(async (uri: string) => uri);

export const createImageFormData = jest
  .fn()
  .mockImplementation((uri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "test.jpg",
    } as any);
    return formData;
  });

export const uploadProfileImage = jest.fn().mockResolvedValue(mockUploadResult);

export const useImagePicker = jest.fn().mockReturnValue({
  pickFromGallery: pickImage,
  takeWithCamera: takePhoto,
});
