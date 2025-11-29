# Prompt – Remover Console.logs de Produção

## Contexto

- ~20+ ocorrências de `console.log`, `console.warn`, `console.error` em código de produção
- Logs devem ser condicionais (apenas em `__DEV__`)
- Arquivos principais: `syncStore.ts`, `storage.ts`, `api.ts`

## Objetivo

Criar um logger condicional e substituir todos os console.\* por ele.

## Implementação

### 1. Criar Logger Utility

Criar `frontend-mobile/appunture/utils/logger.ts`:

```typescript
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

// Loggers especializados
export const syncLogger = logger.createChild("[Sync]");
export const authLogger = logger.createChild("[Auth]");
export const apiLogger = logger.createChild("[API]");
export const storageLogger = logger.createChild("[Storage]");

export default logger;
```

### 2. Atualizar syncStore.ts

```typescript
// Adicionar import
import { syncLogger as logger } from "../utils/logger";

// Substituir todos os console.warn por logger.warn
// Exemplo:
// ANTES:
console.warn(`Não foi possível recuperar ponto remoto ${pointData.id}`, error);
// DEPOIS:
logger.warn(`Não foi possível recuperar ponto remoto ${pointData.id}`, error);

// ANTES:
console.error("Erro ao processar fila após reconexão", error);
// DEPOIS:
logger.error("Erro ao processar fila após reconexão", error);
```

### 3. Atualizar storage.ts

```typescript
import { storageLogger as logger } from "../utils/logger";

// ANTES:
console.error("Error storing token:", error);
// DEPOIS:
logger.error("Error storing token:", error);
```

### 4. Atualizar api.ts

```typescript
import { apiLogger as logger } from "../utils/logger";

// ANTES:
console.warn("Failed to retrieve Firebase ID token", error);
// DEPOIS:
logger.warn("Failed to retrieve Firebase ID token", error);
```

### 5. Lista de substituições

| Arquivo      | Linha | De            | Para                |
| ------------ | ----- | ------------- | ------------------- |
| syncStore.ts | 226   | console.warn  | syncLogger.warn     |
| syncStore.ts | 290   | console.warn  | syncLogger.warn     |
| syncStore.ts | 355   | console.warn  | syncLogger.warn     |
| syncStore.ts | 381   | console.warn  | syncLogger.warn     |
| syncStore.ts | 427   | console.warn  | syncLogger.warn     |
| syncStore.ts | 583   | console.warn  | syncLogger.warn     |
| syncStore.ts | 593   | console.warn  | syncLogger.warn     |
| syncStore.ts | 606   | console.warn  | syncLogger.warn     |
| syncStore.ts | 617   | console.warn  | syncLogger.warn     |
| syncStore.ts | 671   | console.warn  | syncLogger.warn     |
| syncStore.ts | 700   | console.warn  | syncLogger.warn     |
| syncStore.ts | 773   | console.error | syncLogger.error    |
| storage.ts   | 16    | console.error | storageLogger.error |
| storage.ts   | 25    | console.error | storageLogger.error |
| storage.ts   | 34    | console.error | storageLogger.error |
| storage.ts   | 43    | console.error | storageLogger.error |
| storage.ts   | 53    | console.error | storageLogger.error |
| storage.ts   | 62    | console.error | storageLogger.error |
| storage.ts   | 71    | console.error | storageLogger.error |
| api.ts       | 49    | console.warn  | apiLogger.warn      |

### 6. Criar teste

```typescript
// __tests__/utils/logger.test.ts
import { logger, syncLogger } from "../../utils/logger";

describe("Logger", () => {
  const originalDev = __DEV__;

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
  });

  it("should log in development mode", () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, "warn").mockImplementation();

    logger.warn("test message");

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should not log in production mode", () => {
    (global as any).__DEV__ = false;
    const prodLogger = new Logger({ enabled: false });
    const spy = jest.spyOn(console, "warn").mockImplementation();

    prodLogger.warn("test message");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should include prefix in child logger", () => {
    expect(syncLogger).toBeDefined();
  });
});
```

## Critérios de Aceitação

- [ ] `utils/logger.ts` criado com Logger class
- [ ] Todos os `console.*` substituídos por logger.\*
- [ ] Logs aparecem apenas quando `__DEV__ === true`
- [ ] Logs incluem timestamp e prefixo do módulo
- [ ] Testes passam
- [ ] App funciona sem erros em modo release

## Verificação

```bash
# Buscar console.* restantes (exceto em node_modules, tests, mocks)
grep -r "console\." frontend-mobile/appunture --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=__tests__ --exclude-dir=__mocks__
```

## Rollback

Se algo quebrar, reverter para console.\* original.
