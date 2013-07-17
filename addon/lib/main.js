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
// var Geolocation = require('geolocation').Geolocation;
var getMostRecentBrowserWindow = require('window/utils').getMostRecentBrowserWindow;
var History = require('./history').History;
var isFirefox = require('sdk/system/xul-app').is('Firefox');
var prefs = require('preferences-service');
var SyncTabs = require('./synctabs').SyncTabs;
var simpleprefs = require('simple-prefs');
var storage = require('simple-storage').storage;
var unload = require('sdk/system/unload');
var url = require('sdk/net/url');
var self = require('self');
var system = require('system');
var query_app = require('./apps_loader').query_app;

const PREF_TELEMETRY_ENABLED = "toolkit.telemetry.enabled";
const {Cu} = require('chrome');
Cu.import("resource://gre/modules/Services.jsm", this);
Cu.import('resource://gre/modules/NewTabUtils.jsm', this);
Cu.import('resource://gre/modules/PageThumbs.jsm', this);
timeStamp("Imported");

/* the location of the html content */
/* this value is string replaced grunt during
the deployment process to match the remote location */
const content_url = 'http://localhost:3456'

/* given a worker, creates a function
which emits messages to the front end */
var emitter_maker = function(worker){
  return function (type, data) {
    worker.port.emit('emit', {type:type, data:data});
  }
};

// if (!Geolocation.allowed) {
//   Geolocation.allowed = true;
// }
/* set prototype 4 as default */
simpleprefs.prefs.version = 4;

if (isFirefox) {

  // Import the page-mod API
  var pageMod = require('page-mod');

  var pageInitted = function pageInitted(worker) {
    var emit = emitter_maker(worker);
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
    /* emit newtab layout */
    emit('apps', get_apps_data())
    // emit("apps", storage.apps_layout || {});
    timeStamp("apps_layout Data Emitted");


    // worker.port.emit('geolocation', {
    //   coords: {
    //     latitude: Geolocation.coords.latitude,
    //     longitude: Geolocation.coords.longitude
    //   }
    // });
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

  /* this takes in a JSON object representing the layout
of the apps on the newtab page and stores it as a js
object using simplestorage */
  var set_layout = function(json){
    var data = JSON.parse(json);
    storage.apps_layout = data;
  }

  /* this gets the data that is stored in simplestorage
that describes how the newtab apps should be layed out */
  var get_layout = function(){
    return storage.apps_layout;
  }

  var workerFunction = function (worker) {
    timeStamp("In Worker Function");
    start = Date.now();
    worker.port.on('tpemit', function (data) {
      timeStamp("tpemit got data!!! " + data.type);
      switch(data.type){
        
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
      switch(data.type){
        
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
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });
  pageMod.PageMod({
    include: 'about:newtab',
    contentScriptWhen: 'ready',
    contentScriptFile: data.url('content.js'),
    onAttach: workerFunction
  });
  pageMod.PageMod({
    include: 'about:newtab-config',
    contentScriptWhen: 'ready',
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
    url.readURI(content_url + '/newtab/index.html')
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

/*
HELPERS
 */
/* gets the apps layout data from storage
then gets the data for each app anc combines
the the two to be sent to the front end */
function get_apps_data(){
  var layout = storage.apps_layout || [];
  layout.forEach(function(page){
    page.forEach(function(app){
      console.log(JSON.stringify(app));
      [app.valid, app.contents] = query_app(app.id);
    });
  });
  return layout;
}

function send_available_apps(worker){
  let apps = get_available_apps();
  let emit = emitter_maker(worker);
  emit('available_apps', apps);
}

/* returns a lits of all available apps for use
in the customizer */
function get_available_apps(){
  let apps = [];
  let apps_dir = pwd()+'/data/apps';
  file.list(apps_dir).forEach(function(app_id){
    let json_path = file.join(apps_dir, app_id, 'settings.json');
    let app = JSON.parse(file.read(json_path));
    apps.push(app);  
  });
  return apps;
}

/* gets the directory of the addon */
function pwd(){
  var {Cc, Ci} = require("chrome");
  var currDir = Cc["@mozilla.org/file/directory_service;1"]
                .getService(Ci.nsIDirectoryServiceProvider)
                .getFile("CurWorkD", {}).path;
  return currDir+'/addon'  
}
/* determines if this is being run with
cfx run */
// function cfx_ran(){
//   return system.pathFor("ProfD").indexOf('.mozrunner') > 0;
// }


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