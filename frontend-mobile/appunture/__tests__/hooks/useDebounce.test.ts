import { renderHook, act } from "@testing-library/react-native";
import { useDebounce, useDebouncedCallback } from "../../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes with default delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    // Update the value
    rerender({ value: "updated" });

    // Value should still be "initial" before delay
    expect(result.current).toBe("initial");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now the value should be updated
    expect(result.current).toBe("updated");
  });

  it("should use custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });

    // At 300ms, should still be "initial"
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // At 500ms, should be "updated"
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    // First change
    rerender({ value: "change1" });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Second change before timer expires
    rerender({ value: "change2" });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Third change
    rerender({ value: "final" });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // Should be the final value
    expect(result.current).toBe("final");
  });

  it("should work with numbers", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it("should work with objects", () => {
    const initialObj = { name: "test" };
    const updatedObj = { name: "updated" };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } }
    );

    rerender({ value: updatedObj });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedObj);
  });

  it("should work with null values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" as string | null } }
    );

    rerender({ value: null });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBeNull();
  });

  it("should cleanup timeout on unmount", () => {
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } }
    );

    rerender({ value: "updated" });
    
    // Unmount before timer expires
    unmount();

    // This should not cause any issues
    act(() => {
      jest.advanceTimersByTime(300);
    });
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should debounce callback execution", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Call the debounced function
    act(() => {
      result.current("arg1");
    });

    // Callback should not be called immediately
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now callback should be called
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("arg1");
  });

  it("should reset timer on rapid calls", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Multiple rapid calls
    act(() => {
      result.current("call1");
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      result.current("call2");
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    act(() => {
      result.current("call3");
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Only the last call should be executed
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("call3");
  });

  it("should use latest callback on update", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const { result, rerender } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 300),
      { initialProps: { callback: callback1 } }
    );

    act(() => {
      result.current("test");
    });

    // Update the callback
    rerender({ callback: callback2 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // The new callback should be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith("test");
  });

  it("should accept multiple arguments", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("arg1", "arg2", 123);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith("arg1", "arg2", 123);
  });

  it("should cleanup timeout on unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current("test");
    });

    // Unmount before timer expires
    unmount();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });

  it("should use custom delay", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current("test");
    });

    // At 300ms, callback should not be called
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();

    // At 500ms, callback should be called
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
