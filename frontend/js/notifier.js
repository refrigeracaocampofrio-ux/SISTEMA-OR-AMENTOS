// Global notification helpers
(function(){
  function safeLog(){ try { console.log.apply(console, arguments); } catch(_) {} }
  if (typeof window.showNotification !== 'function') {
    window.showNotification = function(message, type){
      if (typeof window.mostrarToast === 'function') {
        return window.mostrarToast(message, type || 'info');
      }
      safeLog('[notify]', type || 'info', message);
      try { alert(message); } catch(_) {}
    };
  }
  if (typeof window.mostrarToast !== 'function') {
    window.mostrarToast = function(message, type){
      safeLog('[toast]', type || 'info', message);
      try { alert(message); } catch(_) {}
    };
  }
})();
