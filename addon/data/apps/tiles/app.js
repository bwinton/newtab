/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

/*global chrome:false, file:false, base64:false, defer:false */

"use strict";
const {Cu, Cc, Ci} = chrome;

var {NewTabUtils} = Cu.import('resource://gre/modules/NewTabUtils.jsm');
var {PageThumbsStorage} = Cu.import('resource://gre/modules/PageThumbs.jsm');

/* queries the browser's history */
function get() {
  var deferred = defer();

  NewTabUtils.links.populateCache(function () {
    var sites = NewTabUtils.links.getLinks();
    // We're only showing 9 tabs…
    sites.length = 9;
    for each (let site in sites) {
      var path = PageThumbsStorage.getFilePathForURL(site.url);
      if (file.exists(path)) {
        var contents = 'data:image/png;base64,' + base64.encode(file.read(path, 'b'));
        site.img = contents;
      }
    }
    deferred.resolve(sites);
  });

  return deferred.promise;
}

function run() {
  var data = get();
  return data;
}

exports.run = run;