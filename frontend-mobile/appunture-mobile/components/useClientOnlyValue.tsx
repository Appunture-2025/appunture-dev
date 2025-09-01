import { Platform } from 'react-native';

/**
 * You can use this to provide client-only values.
 * For example, when you want to disable server rendering for native apps.
 */
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  if (Platform.OS === 'web') {
    return server;
  }
  return client;
}
