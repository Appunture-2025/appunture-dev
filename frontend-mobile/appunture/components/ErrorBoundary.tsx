/**
 * Error Boundary Component
 *
 * React Error Boundary for catching and handling runtime errors
 * in the component tree. Provides user-friendly error screens
 * and error reporting capabilities.
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Optional custom fallback component
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Whether to show detailed error info (for development)
   */
  showDetails?: boolean;

  /**
   * Custom title for the error screen
   */
  errorTitle?: string;

  /**
   * Custom message for the error screen
   */
  errorMessage?: string;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  /**
   * Reset the error state to retry rendering
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { children, fallback, showDetails, errorTitle, errorMessage } =
      this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError && error) {
      // If a custom fallback is provided, use it
      if (fallback) {
        if (typeof fallback === "function") {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Default error UI
      return (
        <ErrorScreen
          error={error}
          errorInfo={errorInfo}
          onRetry={this.resetError}
          showDetails={showDetails ?? __DEV__}
          title={errorTitle}
          message={errorMessage}
        />
      );
    }

    return children;
  }
}

/**
 * Props for ErrorScreen component
 */
interface ErrorScreenProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onRetry?: () => void;
  showDetails?: boolean;
  title?: string;
  message?: string;
}

/**
 * Default error screen UI
 */
function ErrorScreen({
  error,
  errorInfo,
  onRetry,
  showDetails = false,
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Por favor, tente novamente.",
}: ErrorScreenProps) {
  const [showStack, setShowStack] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={80} color={COLORS.error} />
        </View>

        {/* Error Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Error Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Error Name (in dev mode) */}
        {showDetails && (
          <Text style={styles.errorName}>
            {error.name}: {error.message}
          </Text>
        )}

        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            accessibilityHint="Tenta recarregar o conteúdo que apresentou erro"
          >
            <Ionicons name="refresh" size={20} color={COLORS.surface} />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}

        {/* Show Stack Trace Toggle (in dev mode) */}
        {showDetails && errorInfo && (
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={() => setShowStack(!showStack)}
            accessibilityRole="button"
            accessibilityLabel={showStack ? "Ocultar detalhes do erro" : "Mostrar detalhes do erro"}
            accessibilityState={{ expanded: showStack }}
          >
            <Ionicons
              name={showStack ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.detailsToggleText}>
              {showStack ? "Ocultar detalhes" : "Mostrar detalhes"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Stack Trace */}
        {showDetails && showStack && errorInfo && (
          <ScrollView style={styles.stackContainer}>
            <Text style={styles.stackTitle}>Component Stack:</Text>
            <Text style={styles.stackText}>{errorInfo.componentStack}</Text>
            <Text style={styles.stackTitle}>Error Stack:</Text>
            <Text style={styles.stackText}>{error.stack}</Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

/**
 * Hook to wrap a component with error handling
 * Useful for async operations
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    console.error("useErrorHandler caught:", err);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Re-throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  errorName: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.surface,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  detailsToggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  stackContainer: {
    marginTop: 16,
    maxHeight: 300,
    width: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  stackText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 12,
  },
});

export default ErrorBoundary;
