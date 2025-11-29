import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Text, View, Button } from "react-native";
import {
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
} from "../../components/ErrorBoundary";

// Component that throws an error
const ThrowingComponent = ({
  shouldThrow = true,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <Text testID="success">Success</Text>;
};

// Component that triggers error imperatively
const ImperativeErrorComponent = () => {
  const { handleError } = useErrorHandler();

  return (
    <Button
      testID="trigger-error"
      title="Trigger Error"
      onPress={() => handleError(new Error("Imperative error"))}
    />
  );
};

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("ErrorBoundary", () => {
  describe("Error catching", () => {
    it("renders children when no error occurs", () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByTestId("success")).toBeTruthy();
    });

    it("catches errors thrown by children", () => {
      const { queryByTestId, getByText } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(queryByTestId("success")).toBeNull();
      // ErrorBoundary shows "Algo deu errado" text when error occurs
      expect(getByText("Algo deu errado")).toBeTruthy();
    });

    it("displays error message when error occurs", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText("Algo deu errado")).toBeTruthy();
    });
  });

  describe("Fallback UI", () => {
    it("renders default fallback when no custom fallback provided", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      // Check that the default error screen texts are visible
      expect(getByText("Algo deu errado")).toBeTruthy();
    });

    it("renders custom fallback function when provided", () => {
      const customFallback = (error: Error, reset: () => void) => (
        <Text testID="custom-fallback">Custom: {error.message}</Text>
      );

      const { getByTestId } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(getByTestId("custom-fallback")).toBeTruthy();
    });

    it("passes error to custom fallback function", () => {
      const customFallback = (error: Error, reset: () => void) => (
        <Text testID="custom-fallback">{error.message}</Text>
      );

      const { getByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(getByText("Test error")).toBeTruthy();
    });
  });

  describe("Error callbacks", () => {
    it("calls onError callback when error occurs", () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it("receives correct error object in callback", () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const [error] = onError.mock.calls[0];
      expect(error.message).toBe("Test error");
    });
  });

  describe("Reset functionality", () => {
    it("shows retry button in default fallback", () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(getByText("Tentar Novamente")).toBeTruthy();
    });
  });
});

describe("withErrorBoundary HOC", () => {
  it("wraps component with error boundary", () => {
    const WrappedComponent = withErrorBoundary(() => (
      <ThrowingComponent shouldThrow={false} />
    ));

    const { getByTestId } = render(<WrappedComponent />);
    expect(getByTestId("success")).toBeTruthy();
  });

  it("catches errors in wrapped component", () => {
    const WrappedComponent = withErrorBoundary(() => <ThrowingComponent />);

    const { getByText } = render(<WrappedComponent />);
    expect(getByText("Algo deu errado")).toBeTruthy();
  });

  it("accepts custom error boundary options", () => {
    const customFallback = (error: Error, reset: () => void) => (
      <Text testID="custom">Custom</Text>
    );

    const WrappedComponent = withErrorBoundary(() => <ThrowingComponent />, {
      fallback: customFallback,
    });

    const { getByTestId } = render(<WrappedComponent />);
    expect(getByTestId("custom")).toBeTruthy();
  });
});

describe("useErrorHandler hook", () => {
  it("throws error when handleError is called", () => {
    const TestComponent = () => {
      const { handleError } = useErrorHandler();
      React.useEffect(() => {
        handleError(new Error("Hook error"));
      }, [handleError]);
      return <Text>Should not render</Text>;
    };

    const { getByText } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(getByText("Algo deu errado")).toBeTruthy();
  });

  it("can be triggered by user interaction", async () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ImperativeErrorComponent />
      </ErrorBoundary>
    );

    fireEvent.press(getByTestId("trigger-error"));

    await waitFor(() => {
      expect(getByText("Algo deu errado")).toBeTruthy();
    });
  });

  it("returns handleError and resetError functions", () => {
    const TestComponent = () => {
      const { handleError, resetError } = useErrorHandler();

      expect(typeof handleError).toBe("function");
      expect(typeof resetError).toBe("function");

      return <Text testID="test">Test</Text>;
    };

    const { getByTestId } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(getByTestId("test")).toBeTruthy();
  });
});
