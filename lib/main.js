/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true*/

/*global self:true, addon:true */

"use strict";

var data = require('self').data;
var simpleprefs = require('simple-prefs');
var isFirefox = require('sdk/system/xul-app').is('Firefox');
var unload = require('sdk/system/unload');
var url = require('sdk/net/url');

if (isFirefox) {
  // Do some Firefox-specific stuff here.
  var prefs = require('preferences-service');
  var protocol = require('./jetpack-protocol/index');

  // Reset the prefs so that our stuff shows up.
  var homepage_pref = 'browser.startup.homepage';
  var homepage = prefs.get(homepage_pref);
  prefs.reset(homepage_pref);
  unload.when(function firefox_unload() {
    prefs.set(homepage_pref, homepage);
  });

  exports.home = protocol.about('home', {
    onRequest: function (request, response) {
      response.contentType = 'text/html';
      url.readURI('http://people.mozilla.com/~bwinton/newtab/' +
                  simpleprefs.prefs.version + '/index.html')
        .then(function success(value) {
          response.end(value);
        }, function failure(reason) {
          // var rv = data.load(simpleprefs.prefs.version + '/index.html');
          var rv = '<h1>Error!!!</h1><p>' + reason + '</p>';
          response.end(rv);
        });
    }
  });

  exports.newtab = protocol.about('newtab', {
    onRequest: function (request, response) {
      console.log('>>> ', request.uri + ' -> ' + data.url('index.html'));
      response.contentType = 'text/html';
      var rv = data.load(simpleprefs.prefs.version + '/index.html');
      response.end(rv);
    }
  });
} else {
  // Do some Fennec- (or Thunderbird-, or SeaMonkey-) specific stuff here.
  console.log('In Fennec!!!  Skipping for now…');
  exports.home = {
    register: function fennec_home_register() {},
    unregister: function fennec_home_unregister() {}
  };
  exports.newtab = {
    register: function fennec_newtab_register() {},
    unregister: function fennec_newtab_unregister() {}
  };
}


exports.main = function (options, callbacks) {
  exports.home.register(); // start listening
  exports.newtab.register(); // start listening
  unload.when(function () {
    dump("Unloading!!!!");
    exports.home.unregister(); // stop listening
    exports.newtab.unregister(); // stop listening
  });
};
