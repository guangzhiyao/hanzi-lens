// Web Worker for Hanzi Lookup WASM recognition
var initialized = false;

self.onmessage = function(e) {
  var data = e.data;

  if (data.type === 'init') {
    try {
      importScripts(data.wasmJsUri);
      wasm_bindgen(data.wasmUri).then(function() {
        initialized = true;
        self.postMessage({ type: 'ready' });
      }).catch(function(err) {
        console.error('[hanzi-worker] WASM load error:', err);
        self.postMessage({ type: 'error', message: 'WASM load failed: ' + (err.message || err) });
      });
    } catch (err) {
      console.error('[hanzi-worker] importScripts error:', err);
      self.postMessage({ type: 'error', message: 'importScripts failed: ' + (err.message || err) });
    }
  } else if (data.type === 'lookup') {
    if (!initialized) {
      self.postMessage({ type: 'error', message: 'WASM not initialized yet' });
      return;
    }
    try {
      var json = wasm_bindgen.lookup(data.strokes, data.limit || 8);
      var matches = JSON.parse(json);
      self.postMessage({ type: 'result', matches: matches });
    } catch (err) {
      console.error('[hanzi-worker] lookup error:', err);
      self.postMessage({ type: 'error', message: 'lookup failed: ' + (err.message || err) });
    }
  }
};

self.onerror = function(err) {
  console.error('[hanzi-worker] unhandled error:', err);
};
