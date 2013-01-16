/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext:true */

/*global addon:true, Components:true, NewTabUtils:true, loadSnippets:true, dump:true,
         CustomEvent: true, RemoteTabViewer: true */

"use strict";

const WEATHER_URL = 'http://openweathermap.org/data/2.1/find/city?lat={LAT}&lon={LON}&cnt=1&callback=?';

var interesting = function (data) {
  var event = new CustomEvent('tpemit', {'detail': data});
  document.dispatchEvent(event);
};

$(function () {

  $('#middle').on('click', 'history, site', function site_click(e) {
    var url = $(this).attr('url');
    if (url) {
      window.location = url;
    }
  });

  try {
    Components.utils.import("resource:///modules/NewTabUtils.jsm");

    NewTabUtils.links.populateCache(function () {
      //We can get the links here.
      var links = NewTabUtils.links.getLinks();
      var container = $('#topsites');
      container.children().not("h3").remove();
      for (var i = 0; i < 9; i++) {
        if (i < links.length) {
          container.append($('<site url="' + links[i].url + '">' + links[i].title + '</site>'));
        } else {
          container.append($('<site></site>'));
        }
      }
    });

  } catch (e) {
    // Yeah, no links for us.  Just use the defaults, then.
    console.log("No previous links for you.");
  }

  loadSnippets();

  function locationError(error) {
    alert("Bbbbbb!");
    switch (error.code) {
    case error.TIMEOUT:
      showError('A timeout occured! Please try again!');
      break;
    case error.POSITION_UNAVAILABLE:
      showError('We can’t detect your location. Sorry!');
      break;
    case error.PERMISSION_DENIED:
      showError('Please allow geolocation access for this to work.');
      break;
    case error.UNKNOWN_ERROR:
      showError('An unknown error occured!');
      break;
    }
  }
   
  function showError(msg) {
    $('#weather').addClass('error').text(msg);
  }

  function locationSuccess(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    $('#weather img').attr('src', '');
    $('#weather .temperature').text('Getting weather for…');
    $('#weather .city').text(lat.toFixed(2) + ', ' + lon.toFixed(1));
    $.getJSON(WEATHER_URL.replace('{LAT}', position.coords.latitude)
                         .replace('{LON}', position.coords.longitude), function (data) {
      $('#weather .temperature').text((data.list[0].main.temp - 273.15).toFixed(1) + "ºC");
      $('#weather .city').text(data.list[0].name);
      $('#weather img').attr('src', 'http://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png')
                       .attr('title', data.list[0].weather[0].description);
    });
  }

  interesting({"message": "Got something!"});
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

  if (!RemoteTabViewer) {
    console.log("No remote tabs for you.");
    return;
  }

  var SyncTabs = function SyncTabs() {
  };

  SyncTabs.prototype = RemoteTabViewer;

  SyncTabs.prototype.createItem = function SyncTabs_createItem(attrs) {
    var item;
    if (attrs["type"] === "tab") {
      item = '<history type="' + attrs.type + '" ' +
                      'url="' + attrs.url + '" ' +
                      'img="' + attrs.img + '"' +
                      '>' + attrs.text + '</history>';
    } else {
      item = '<h3>' + attrs.text + '</h3>';
    }
    return $(item);
  };

  SyncTabs.prototype._generateTabList = function SyncTabs_generateTabList() {
    let engine = Weave.Service.engineManager.get("tabs");
    let $list = $(this._tabsList).children(".scrollingContainer");
    // clear out existing richlistitems
    $list.empty();
    for (let [guid, client] in Iterator(engine.getAllClients())) {
      // Create the client node, but don't add it in-case we don't show any tabs
      let appendClient = true;
      let seenURLs = {};
      client.tabs.forEach(function({title, urlHistory, icon}) {
        let url = urlHistory[0];
        if (engine.locallyOpenTabMatchesURL(url) || url in seenURLs)
          return;
        seenURLs[url] = null;
        if (appendClient) {
          let clientEnt = this.createItem({
            type: "client",
            class: Weave.Service.clientsEngine.isMobile(client.id) ? "mobile" : "desktop",
            text: client.clientName
          });
          $list.append(clientEnt);
          appendClient = false;
          clientEnt.disabled = true;
        }
        let tab = this.createItem({
          type: "tab",
          url: url,
          img: Weave.Utils.getIcon(icon),
          text: title || url
        });
        $list.append(tab);
      }, this);
    }
    alert("Building list " + force + ", " + this._tabsList);
  };

  var syncTabs = new SyncTabs();
  syncTabs.init();
});