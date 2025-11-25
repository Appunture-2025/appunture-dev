import { act } from "@testing-library/react-native";
import { useAuthStore } from "../../stores/authStore";
import { apiService } from "../../services/api";
import { firebaseAuth } from "../../services/firebase";

// Mock dependencies
jest.mock("../../services/api");
jest.mock("../../services/firebase");
jest.mock("@react-native-async-storage/async-storage", () =>
  require("../../__mocks__/async-storage")
);

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBeFalsy();
    expect(state.isLoading).toBeFalsy();
  });

  it("should handle login success", async () => {
    const mockUser = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
    };
    const mockToken = "mock-token";

    (apiService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });

    await act(async () => {
      await useAuthStore
        .getState()
        .login({ email: "test@example.com", password: "password" });
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBeTruthy();
  });

  it("should handle login failure", async () => {
    const errorMessage = "Invalid credentials";
    (apiService.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      try {
        await useAuthStore
          .getState()
          .login({ email: "test@example.com", password: "wrong" });
      } catch (e) {
        // Expected error
      }
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBeFalsy();
  });

  it("should handle logout", async () => {
    // Setup logged in state
    useAuthStore.setState({
      user: { id: "123", name: "User", email: "u@e.com", role: "USER" },
      token: "token",
      isAuthenticated: true,
    });

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBeFalsy();
  });

  it("should update profile", async () => {
    useAuthStore.setState({
      user: { id: "123", name: "Old Name", email: "u@e.com", role: "USER" },
      isAuthenticated: true,
    });

    const newProfile = { name: "New Name", profession: "Acupuncturist" };
    (apiService.updateProfile as jest.Mock).mockResolvedValue({
      ...useAuthStore.getState().user!,
      ...newProfile,
    });

    await act(async () => {
      await useAuthStore.getState().updateProfile(newProfile);
    });

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe("New Name");
    expect(state.user?.profession).toBe("Acupuncturist");
  });
});
