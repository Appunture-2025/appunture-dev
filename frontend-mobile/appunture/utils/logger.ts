/**
 * Logger condicional que só exibe logs em desenvolvimento.
 * Em produção, os logs são silenciados para evitar vazamento de informações
 * e melhorar performance.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  enabled?: boolean;
  prefix?: string;
}

class Logger {
  private enabled: boolean;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.enabled = options.enabled ?? __DEV__;
    this.prefix = options.prefix ?? "[Appunture]";
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: any[]
  ): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const formattedMessage = `${
      this.prefix
    } [${level.toUpperCase()}] ${timestamp}: ${message}`;

    switch (level) {
      case "debug":
        console.log(formattedMessage, ...args);
        break;
      case "info":
        console.info(formattedMessage, ...args);
        break;
      case "warn":
        console.warn(formattedMessage, ...args);
        break;
      case "error":
        console.error(formattedMessage, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage("debug", message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage("info", message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage("warn", message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage("error", message, ...args);
  }

  // Para módulos específicos
  createChild(prefix: string): Logger {
    return new Logger({
      enabled: this.enabled,
      prefix: `${this.prefix}${prefix}`,
    });
  }
}

// Instância global
export const logger = new Logger();

// Factory function para criar loggers
export function createLogger(prefix: string): Logger {
  return logger.createChild(`[${prefix}]`);
}

// Loggers especializados
export const syncLogger = createLogger("Sync");
export const authLogger = createLogger("Auth");
export const apiLogger = createLogger("API");
export const storageLogger = createLogger("Storage");
export const cacheLogger = createLogger("Cache");

export { Logger };
export default logger;
