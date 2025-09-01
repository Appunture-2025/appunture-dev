// Polyfill para import.meta em navegadores
if (typeof window !== 'undefined' && !window.importMeta) {
  window.importMeta = {
    env: process.env.NODE_ENV || 'development',
    url: window.location.href,
  };
}

// Para módulos que usam import.meta
if (typeof global !== 'undefined' && !global.importMeta) {
  global.importMeta = {
    env: process.env.NODE_ENV || 'development',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };
}
