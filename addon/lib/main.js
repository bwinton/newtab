/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

"use strict";

var start = Date.now();
var timeStamp = function timeStamp(message) {
  console.log("BW - " + message + ": " + (Date.now() - start));
};
timeStamp("Starting");

const {all, defer, resolve} = require('sdk/core/promise');
var file = require('sdk/io/file');
// var Geolocation = require('geolocation').Geolocation;
var getMostRecentBrowserWindow = require('sdk/window/utils').getMostRecentBrowserWindow;
var History = require('./history').History;
var isFirefox = require('sdk/system/xul-app').is('Firefox');
var prefs = require('sdk/preferences/service');
var SyncTabs = require('./synctabs').SyncTabs;
var simpleprefs = require('sdk/simple-prefs');
var storage = require('sdk/simple-storage').storage;
var unload = require('sdk/system/unload');
var url = require('sdk/net/url');
var self = require('sdk/self');
// I think we don't need data…
var data = self.data;
var system = require('sdk/system');
var query_app = require('./apps_loader').query_app;

const PREF_TELEMETRY_ENABLED = "toolkit.telemetry.enabled";
const {Cc, Ci, Cu} = require('chrome');
var {Services} = Cu.import('resource://gre/modules/Services.jsm');

timeStamp("Imported");

/* the location of the html content */
/* this value is string replaced grunt during
the deployment process to match the remote location */
var content_url = 'http://localhost:3456';

/* given a worker, creates a function
which emits messages to the front end */
var emitter_maker = function (worker) {
  return function (type, data) {
    worker.port.emit('emit', {'type': type, 'data': data});
  };
};

/*
HELPERS
 */

/* gets the directory of the addon */
function pwd() {
  var currDir = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Ci.nsIDirectoryServiceProvider)
                .getFile("CurWorkD", {}).path;
  return currDir + '/addon';
}

/* returns a lits of all available apps for use
in the customizer */
function get_available_apps() {
  let apps = {};
  let apps_dir = pwd() + '/data/apps';
  file.list(apps_dir).forEach(function (app_id) {
    let json_path = file.join(apps_dir, app_id, 'settings.json');
    let app = JSON.parse(file.read(json_path));
    apps[app_id] = app;
  });
  return apps;
}

function send_available_apps(worker) {
  let apps = get_available_apps();
  let emit = emitter_maker(worker);
  emit('available_apps', apps);
}

/* this takes in a JSON object representing the layout
   of the apps on the newtab page and stores it as a js
   object using simplestorage */
var set_layout = function (json) {
  timeStamp("Setting layout!!!");
  var data = JSON.parse(json);
  let apps = get_available_apps();
  var layout = [];
  data.forEach(function (data_page) {
    var page = [];
    data_page.forEach(function (data_app) {
      page.push({
        'id': data_app.id,
        'size': data_app.size
      });
    });
    layout.push(page);
  });
  storage.apps_layout = layout;
};

/* this gets the data that is stored in simplestorage
   that describes how the newtab apps should be layed out */
var get_layout = function () {
  var layout = storage.apps_layout || [];
  layout = JSON.parse(JSON.stringify(layout));
  return layout;
};

/* gets the apps layout data from storage
   then gets the data for each app anc combines
   the the two to be sent to the front end */
function get_apps_data() {
  var deferred = defer();
  var promises = [];
  var layout = get_layout();
  var available_apps = get_available_apps();
  layout.forEach(function (page) {
    page.forEach(function (app) {
      var app_data = available_apps[app.id];
      for (var attrname in app_data) { app[attrname] = app_data[attrname]; }
      [app.valid, app.contents] = query_app(app.id);
      promises.push(app.contents);
      app.contents.then(function (result) {
        app.contents = result;
      });
    });
  });
  all(promises).then(function (result) {
    deferred.resolve(layout);
  });
  return deferred.promise;
}

/* determines if this is being run with
cfx run */
// function cfx_ran(){
//   return system.pathFor("ProfD").indexOf('.mozrunner') > 0;
// }


// if (!Geolocation.allowed) {
//   Geolocation.allowed = true;
// }
/* set prototype 4 as default */
simpleprefs.prefs.version = 4;

if (isFirefox) {

  timeStamp("isFirefox");
  // Import the page-mod API
  var pageMod = require('sdk/page-mod');

  var pageInitted = function pageInitted(worker) {
    timeStamp("Got Page Initted!");
    var emit = emitter_maker(worker);
    if (storage.links) {
      emit('tabs', storage.links);
    }
    if (storage.sites) {
      emit('sites', storage.sites);
    }
    if (storage.readinglist) {
      emit('readinglist', storage.readinglist);
    }
    if (storage.bookmarklist) {
      emit('bookmarklist', storage.bookmarklist);
    }
    if (storage.historylist) {
      emit('historylist', storage.historylist);
    }
    /* emit newtab layout */
    var apps_data = get_apps_data();
    apps_data.then(function (result) {
      emit('apps', result);
      timeStamp("apps_layout Data Emitted");
    });


    // emit('geolocation', {
    //   'coords': {
    //     'latitude': Geolocation.coords.latitude,
    //     'longitude': Geolocation.coords.longitude
    //   }
    // });
    timeStamp("Saved Data Emitted");

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

    emit('search', {
      'defaultEngine': makeEngine(Services.search.defaultEngine),
      'engines': Services.search.getVisibleEngines().map(function (engine) {
        return makeEngine(engine);
      })
    });
    timeStamp("Search Emitted");

    History.get(function (data) {
      emit('historylist', data);
      timeStamp("History Emitted");
    });

    SyncTabs.init(function (type, links) {
      if (type === 'tabs') {
        emit('tabs', links);
        storage.links = links;
      } else if (type === 'bookmarks') {
        emit('bookmarklist', links);
        storage.bookmarklist = links;

        var readinglist = [];
        for each (let record in links) {
          if (record.parent === 'Reading List') {
            readinglist.push(record);
          }
        }
        emit('readinglist', readinglist);
        storage.readinglist = readinglist;
      }
      timeStamp("SyncTabs Emitted " + type);
    });
  };

  var workerFunction = function (worker) {
    timeStamp("In Worker Function");
    start = Date.now();
    worker.port.on('tpemit', function (data) {
      timeStamp("tpemit got data!!! " + data.type);
      switch (data.type) {
        
      case 'initialized':
        pageInitted(worker);
        break;
        
      case 'searchChanged':
        Services.search.currentEngine = Services.search.getEngineByName(data.detail.name);
        break;
        
        // case 'page-switch':
        //   console.log(data.detail);
        //   worker.Page.contentURL = data.detail;
        //   break;
        
      case 'telemetry':
        if (data.detail.type === 'sure') {
          prefs.set(PREF_TELEMETRY_ENABLED, true);
        } else if (data.detail.type === 'no') {
          prefs.set(PREF_TELEMETRY_ENABLED, false);
        } else if (data.detail.type === 'undo') {
          prefs.reset(PREF_TELEMETRY_ENABLED);
        }
        break;
      }

    });
  };

  var configWorkerFunction = function (worker) {
    timeStamp("In Config Worker Function");
    start = Date.now();
    worker.port.on('tpemit', function (data) {
      timeStamp("tpemit got data!!! " + data.type);
      switch (data.type) {
        
      case 'initialized':
        send_available_apps(worker);
        break;


      case 'customizer-data':
        set_layout(data.detail);
        break;
      }

    });
  };


  pageMod.PageMod({
    include: 'about:home',
    contentScriptWhen: 'ready',
    attachTo: ["top", "existing"],
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });
  pageMod.PageMod({
    include: 'about:newtab',
    contentScriptWhen: 'ready',
    attachTo: ["top", "existing"],
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });
  pageMod.PageMod({
    include: 'about:newtab-config',
    contentScriptWhen: 'ready',
    attachTo: ["top", "existing"],
    contentScriptFile: data.url('content.js'),
    onAttach: configWorkerFunction
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
    url.readURI(content_url + '/main/index.html')
      .then(function success(value) {
        response.end(value);
      }, function failure(reason) {
        var rv = '<h1>Error!!!</h1><p>' + reason + '</p>';
        response.end(rv);
      });
  };

  var newtab_config_override = function newtab_config_override(request, response) {
    response.contentType = 'text/html';
    url.readURI(content_url + '/customizer/index.html')
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
  exports.newtab_config = protocol.about('newtab-config', {
    onRequest: newtab_config_override
  });

} else {
  // Do some Fennec- (or Thunderbird-, or SeaMonkey-) specific stuff here.
  console.log('In Fennec!!! Skipping for now…');
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
  exports.newtab_config.register(); // start listening
  unload.when(function () {
    exports.home.unregister(); // stop listening
    exports.newtab.unregister(); // stop listening
  });
};