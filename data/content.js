document.addEventListener('tpemit', function(e) {
  self.port.emit('tpemit', e.detail);
  return true;
});


self.port.on('sites', function(sites) {
  document.defaultView.postMessage({'type':'sites', 'sites': sites}, '*');
});

self.port.on('tabs', function(tabs) {
  document.defaultView.postMessage({'type':'tabs', 'tabs': tabs}, '*');
});

self.port.on('geolocation', function(position) {
  document.defaultView.postMessage({'type':'geolocation', 'position': position}, '*');
});
