/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true*/

/*global self:true, addon:true, protocol:true, NewTabUtils:true, Services:true */

"use strict";

var start = Date.now();
var timeStamp = function timeStamp(message) {
  console.log("BW - " + message + ": " + (Date.now() - start));
};
timeStamp("Starting");

var base64 = require('sdk/base64');
var data = require('self').data;
var file = require('sdk/io/file');
var Geolocation = require('geolocation').Geolocation;
var getMostRecentBrowserWindow = require('window/utils').getMostRecentBrowserWindow;
var History = require('./history').History;
var isFirefox = require('sdk/system/xul-app').is('Firefox');
var prefs = require('preferences-service');
var SyncTabs = require('./synctabs').SyncTabs;
var simpleprefs = require('simple-prefs');
var storage = require('simple-storage').storage;
var unload = require('sdk/system/unload');
var url = require('sdk/net/url');

const PREF_TELEMETRY_ENABLED = "toolkit.telemetry.enabled";
const {Cu} = require('chrome');
Cu.import("resource://gre/modules/Services.jsm", this);
Cu.import('resource://gre/modules/NewTabUtils.jsm', this);
Cu.import('resource://gre/modules/PageThumbs.jsm', this);
timeStamp("Imported");

if (!Geolocation.allowed) {
  Geolocation.allowed = true;
}

if (isFirefox) {

  // Import the page-mod API
  var pageMod = require('page-mod');

  var pageInitted = function pageInitted(worker) {
    if (storage.links) {
      worker.port.emit('tabs', storage.links);
    }
    if (storage.sites) {
      worker.port.emit('sites', storage.sites);
    }
    if (storage.readinglist) {
      worker.port.emit('readinglist', storage.readinglist);
    }
    if (storage.bookmarklist) {
      worker.port.emit('bookmarklist', storage.bookmarklist);
    }
    if (storage.historylist) {
      worker.port.emit('historylist', storage.historylist);
    }

    worker.port.emit('geolocation', {
      coords: {
        latitude: Geolocation.coords.latitude,
        longitude: Geolocation.coords.longitude
      }
    });
    timeStamp("Saved Data Emitted");

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

      worker.port.emit('sites', sites);
      storage.sites = sites;
      timeStamp("Sites Emitted");
    });

    var makeEngine = function makeEngine(engine) {
      var getEngineImage = function getEngineImage(name) {
        return name.replace(/([a-zA-Z]*).*/, function (match, name) {
          return name.toLowerCase();
        });
      };
      var submission = engine.getSubmission('_searchTerms_', null, 'homepage');
      if (submission.postData) {
        throw new Error("Home page does not support POST search engines.");
      }
      return Object.freeze({
        'name': engine.name,
        'image': getEngineImage(engine.name),
        'searchURL': submission.uri.spec
      });
    };

    worker.port.emit('search', makeEngine(Services.search.defaultEngine),
      Services.search.getVisibleEngines().map(function (engine) {
        return makeEngine(engine);
      })
    );
    timeStamp("Search Emitted");

    History.get(function (data) {
      worker.port.emit('historylist', data);
      timeStamp("History Emitted");
    });

    SyncTabs.init(function (type, links) {
      if (type === 'tabs') {
        worker.port.emit('tabs', links);
        storage.links = links;
      } else if (type === 'bookmarks') {
        worker.port.emit('bookmarklist', links);
        storage.bookmarklist = links;

        var readinglist = [];
        for each (let record in links) {
          if (record.parent === 'Reading List') {
            readinglist.push(record);
          }
        }
        worker.port.emit('readinglist', readinglist);
        storage.readinglist = readinglist;
      }
      timeStamp("SyncTabs Emitted " + type);
    });
  };

  var workerFunction = function (worker) {
    timeStamp("In Worker Function");
    start = Date.now();
    worker.port.on('tpemit', function (data) {
      timeStamp("tpemit got data!!!  " + data.type);
      if (data.type === 'initialized') {
        pageInitted(worker);
      } else if (data.type === 'searchChanged') {
        Services.search.currentEngine = Services.search.getEngineByName(data.detail.name);
      } else if (data.type === 'telemetry') {
        if (data.detail.type === 'sure') {
          prefs.set(PREF_TELEMETRY_ENABLED, true);
        } else if (data.detail.type === 'no') {
          prefs.set(PREF_TELEMETRY_ENABLED, false);
        } else if (data.detail.type === 'undo') {
          prefs.reset(PREF_TELEMETRY_ENABLED);
        }
      }
    });
  };


  pageMod.PageMod({
    include: 'about:home',
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });
  pageMod.PageMod({
    include: 'about:newtab',
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });

  // Do some Firefox-specific stuff here.
  var protocol = require('./jetpack-protocol/index');

  var init = function firefox_init() {
    // Reset the prefs so that our stuff shows up.
    var setAndResetPref = function setAndResetPref(prefname, value) {
      var pref = prefs.get(prefname);
      if (value === undefined) {
        prefs.reset(prefname);
      } else {
        prefs.set(prefname, value);
      }
      unload.when(function firefox_unload() {
        prefs.set(prefname, pref);
      });
    };
    setAndResetPref('browser.startup.homepage');
    setAndResetPref('layout.css.flexbox.enabled', true);
  };

  var home_override = function home_override(request, response) {
    response.contentType = 'text/html';
    url.readURI('http://people.mozilla.com/~bwinton/newtab/' +
                simpleprefs.prefs.version + '/index.html')
      .then(function success(value) {
        response.end(value);
      }, function failure(reason) {
        var rv = '<h1>Error!!!</h1><p>' + reason + '</p>';
        response.end(rv);
      });
  };

  exports.home = protocol.about('home', {
    onRequest: home_override
  });
  exports.newtab = protocol.about('newtab', {
    onRequest: home_override
  });

} else {
  // Do some Fennec- (or Thunderbird-, or SeaMonkey-) specific stuff here.
  console.log('In Fennec!!!  Skipping for now…');
  var init = function fennec_init() {};
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
  init();
  exports.home.register(); // start listening
  exports.newtab.register(); // start listening
  unload.when(function () {
    exports.home.unregister(); // stop listening
    exports.newtab.unregister(); // stop listening
  });
};