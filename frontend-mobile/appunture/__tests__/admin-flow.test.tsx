import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AdminLayout from "../app/admin/_layout";
import ProfileScreen from "../app/(tabs)/profile";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "expo-router";

// Mock expo-router
jest.mock("expo-router", () => {
  const React = require("react");
  const Stack = ({ children }: { children: React.ReactNode }) =>
    React.createElement("View", { testID: "stack" }, children);
  Stack.Screen = () => null;
  return {
    useRouter: jest.fn(),
    Stack: Stack,
  };
});

// Mock authStore
jest.mock("../stores/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock syncStore
jest.mock("../stores/syncStore", () => ({
  useSyncStore: jest.fn(() => ({
    isOnline: true,
    lastSync: null,
    pendingOperations: 0,
    pendingImages: 0,
  })),
}));

describe("Admin Flow", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe("AdminLayout", () => {
    it("redirects non-admin users to tabs", () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { role: "USER" },
      });

      render(<AdminLayout />);

      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");
    });

    it("renders stack for admin users", () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { role: "ADMIN" },
      });

      const { toJSON } = render(<AdminLayout />);

      // Since Stack is mocked to return null children or similar, we check if replace was NOT called
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe("ProfileScreen", () => {
    it("shows Admin Panel button for admin users", () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { role: "ADMIN", name: "Admin User", email: "admin@test.com" },
        logout: jest.fn(),
      });

      const { getByText } = render(<ProfileScreen />);

      expect(getByText("Painel Admin")).toBeTruthy();
    });

    it("hides Admin Panel button for non-admin users", () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { role: "USER", name: "Regular User", email: "user@test.com" },
        logout: jest.fn(),
      });

      const { queryByText } = render(<ProfileScreen />);

      expect(queryByText("Painel Admin")).toBeNull();
    });

    it("navigates to admin panel when button is pressed", () => {
      (useAuthStore as unknown as jest.Mock).mockReturnValue({
        user: { role: "ADMIN", name: "Admin User", email: "admin@test.com" },
        logout: jest.fn(),
      });

      const { getByText } = render(<ProfileScreen />);
      const adminButton = getByText("Painel Admin");

      fireEvent.press(adminButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin");
    });
  });
});
