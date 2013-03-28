/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true*/

/*global self:true, addon:true, protocol:true, NewTabUtils:true */

"use strict";

document.addEventListener('tpemit', function (e) {
  self.port.emit('tpemit', e.detail);
  return true;
});


self.port.on('sites', function (sites) {
  document.defaultView.postMessage({'type': 'sites', 'sites': sites}, '*');
});

self.port.on('tabs', function (tabs) {
  document.defaultView.postMessage({'type': 'tabs', 'tabs': tabs}, '*');
});

self.port.on('readinglist', function (list) {
  document.defaultView.postMessage({'type': 'readinglist', 'list': list}, '*');
});

self.port.on('bookmarklist', function (list) {
  document.defaultView.postMessage({'type': 'bookmarklist', 'list': list}, '*');
});

self.port.on('historylist', function (list) {
  document.defaultView.postMessage({'type': 'historylist', 'list': list}, '*');
});

self.port.on('geolocation', function (position) {
  document.defaultView.postMessage({'type': 'geolocation', 'position': position}, '*');
});

self.port.on('search', function (defaultEngine, engines) {
  document.defaultView.postMessage({'type': 'search', 'defaultEngine': defaultEngine, 'engines': engines}, '*');
});

