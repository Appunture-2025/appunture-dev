import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import SearchBar from "../../components/SearchBar";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name, size, color }: { name: string; size: number; color: string }) => null,
}));

describe("SearchBar", () => {
  const defaultProps = {
    value: "",
    onChangeText: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      const { toJSON } = render(<SearchBar {...defaultProps} />);
      
      expect(toJSON()).toBeTruthy();
    });

    it("should render with custom placeholder", () => {
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} placeholder="Search points..." />
      );
      
      expect(getByPlaceholderText("Search points...")).toBeTruthy();
    });

    it("should render with default placeholder", () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      
      expect(getByPlaceholderText("Buscar...")).toBeTruthy();
    });

    it("should render with initial value", () => {
      const { getByDisplayValue } = render(
        <SearchBar {...defaultProps} value="test query" />
      );
      
      expect(getByDisplayValue("test query")).toBeTruthy();
    });
  });

  describe("Input Behavior", () => {
    it("should update local value immediately on text change", () => {
      const { getByPlaceholderText, getByDisplayValue } = render(
        <SearchBar {...defaultProps} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "new text");
      
      expect(getByDisplayValue("new text")).toBeTruthy();
    });

    it("should debounce onChangeText calls", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} debounceDelay={300} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "test");
      
      // onChangeText should not be called immediately
      expect(onChangeText).not.toHaveBeenCalled();
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Now it should be called
      expect(onChangeText).toHaveBeenCalledWith("test");
    });

    it("should call onSubmit when submit is triggered", () => {
      const onSubmit = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onSubmit={onSubmit} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent(input, "submitEditing");
      
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Clear Button", () => {
    it("should show clear button when there is text", () => {
      const { getByPlaceholderText, getByLabelText, getByDisplayValue } = render(
        <SearchBar {...defaultProps} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "some text");
      
      expect(getByDisplayValue("some text")).toBeTruthy();
      expect(getByLabelText("Limpar busca")).toBeTruthy();
    });

    it("should clear text when clear button is pressed", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText, getByLabelText, queryByDisplayValue } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "test text");
      
      const clearButton = getByLabelText("Limpar busca");
      fireEvent.press(clearButton);
      
      expect(onChangeText).toHaveBeenCalledWith("");
    });

    it("should not show clear button when text is empty", () => {
      const { queryByLabelText } = render(<SearchBar {...defaultProps} />);
      
      expect(queryByLabelText("Limpar busca")).toBeNull();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when loading is true", () => {
      const { getByLabelText } = render(
        <SearchBar {...defaultProps} loading={true} />
      );
      
      expect(getByLabelText("Buscando...")).toBeTruthy();
    });

    it("should not show loading indicator when loading is false", () => {
      const { queryByLabelText } = render(
        <SearchBar {...defaultProps} loading={false} />
      );
      
      expect(queryByLabelText("Buscando...")).toBeNull();
    });

    it("should disable input when loading", () => {
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} loading={true} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      expect(input.props.editable).toBe(false);
    });

    it("should not show clear button when loading", () => {
      const { getByPlaceholderText, queryByLabelText } = render(
        <SearchBar {...defaultProps} loading={true} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "test");
      
      expect(queryByLabelText("Limpar busca")).toBeNull();
    });
  });

  describe("Debounce Behavior", () => {
    it("should reset debounce timer on rapid changes", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} debounceDelay={300} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      
      // Type rapidly
      fireEvent.changeText(input, "t");
      act(() => { jest.advanceTimersByTime(100); });
      
      fireEvent.changeText(input, "te");
      act(() => { jest.advanceTimersByTime(100); });
      
      fireEvent.changeText(input, "tes");
      act(() => { jest.advanceTimersByTime(100); });
      
      fireEvent.changeText(input, "test");
      
      // Should not have called onChangeText yet
      expect(onChangeText).not.toHaveBeenCalled();
      
      // Wait for debounce
      act(() => { jest.advanceTimersByTime(300); });
      
      // Should only be called once with final value
      expect(onChangeText).toHaveBeenCalledTimes(1);
      expect(onChangeText).toHaveBeenCalledWith("test");
    });

    it("should use custom debounce delay", () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar {...defaultProps} onChangeText={onChangeText} debounceDelay={500} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "test");
      
      // At 300ms, should not be called
      act(() => { jest.advanceTimersByTime(300); });
      expect(onChangeText).not.toHaveBeenCalled();
      
      // At 500ms, should be called
      act(() => { jest.advanceTimersByTime(200); });
      expect(onChangeText).toHaveBeenCalledWith("test");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label for search input", () => {
      const { getByLabelText } = render(<SearchBar {...defaultProps} />);
      
      expect(getByLabelText("Buscar...")).toBeTruthy();
    });

    it("should have accessible hint for search input", () => {
      const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
      
      const input = getByPlaceholderText("Buscar...");
      expect(input.props.accessibilityHint).toBe("Digite para buscar");
    });

    it("should have accessible label for clear button", () => {
      const { getByPlaceholderText, getByLabelText } = render(
        <SearchBar {...defaultProps} />
      );
      
      const input = getByPlaceholderText("Buscar...");
      fireEvent.changeText(input, "test");
      
      expect(getByLabelText("Limpar busca")).toBeTruthy();
    });
  });

  describe("Value Synchronization", () => {
    it("should sync with external value changes", () => {
      const { rerender, getByDisplayValue } = render(
        <SearchBar {...defaultProps} value="initial" />
      );
      
      rerender(<SearchBar {...defaultProps} value="updated" />);
      
      expect(getByDisplayValue("updated")).toBeTruthy();
    });
  });
});
