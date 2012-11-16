/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true*/

/*global self:true, addon:true */

"use strict";

var isFirefox = require('sdk/system/xul-app').is('Firefox');

if (isFirefox) {
  // Do some Firefox-specific stuff here.
} else {
  // Do some Fennec- (or Thunderbird-, or SeaMonkey-) specific stuff here.
}

var protocol = require('./jetpack-protocol/index');

exports.home = protocol.about('home', {
  onRequest: function (request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '));
    response.contentType = 'text/html';
    response.end('<h1>Jedi is an awsome dude with a lightsaber!!</h1>');
    console.log('<<<', JSON.stringify(response, '', '  '));
  }
});

exports.newtab = protocol.about('newtab', {
  onRequest: function (request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '));
    response.contentType = 'text/html';
    response.end('<h1>Jedi is an awsome dude with a lightsaber!!</h1>');
    console.log('<<<', JSON.stringify(response, '', '  '));
  }
});

exports.main = function (options, callbacks) {
  // Main code goes here.
  exports.home.register(); // start listening
  exports.newtab.register(); // start listening
  require('sdk/system/unload').when(function () {
    exports.home.unregister(); // stop listening
    exports.newtab.unregister(); // stop listening
  });
};
