import { ExclamationCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface ErrorStateProps {
  /** Error message to display */
  message?: string;
  /** Callback to retry the failed operation */
  onRetry?: () => void;
  /** Custom title */
  title?: string;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Error state component for displaying API/query errors
 * Used with React Query when queries fail
 */
export function ErrorState({
  message = "Não foi possível carregar os dados. Por favor, tente novamente.",
  onRetry,
  title = "Erro ao carregar",
  showRetry = true,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
        <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}

/**
 * Smaller inline error component for use within cards/sections
 */
export function InlineError({
  message = "Erro ao carregar",
  onRetry,
}: Pick<ErrorStateProps, "message" | "onRetry">) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-md">
      <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export default ErrorState;
