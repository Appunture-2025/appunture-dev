// Patch para import.meta antes de qualquer importação
(function() {
  if (typeof window !== 'undefined') {
    // Define import.meta no escopo global
    window.importMeta = window.importMeta || {
      env: 'development',
      url: window.location.href
    };
    
    // Para casos onde import.meta é usado diretamente
    if (!window.import) {
      window.import = {};
    }
    if (!window.import.meta) {
      window.import.meta = window.importMeta;
    }
  }
})();
