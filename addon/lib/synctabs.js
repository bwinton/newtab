/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cu } = require("chrome");
Cu.import("resource://services-sync/main.js", this);
Cu.import("resource://gre/modules/Services.jsm", this);

let SyncTabs = {
  _tabsList: [],
  _bookmarksList: [],

  init: function (callback) {
    Services.obs.addObserver(this, "weave:service:login:finish", false);
    Services.obs.addObserver(this, "weave:engine:sync:finish", false);
    this._callback = callback;
    this.buildList(true);
  },

  uninit: function () {
    Services.obs.removeObserver(this, "weave:service:login:finish");
    Services.obs.removeObserver(this, "weave:engine:sync:finish");
  },

  buildList: function(force) {
    if (!Weave.Service.isLoggedIn || !this._refetchData(force))
      return;
    this._generateTabList();
    this._generateBookmarkList();
  },

  _refetchData: function(force) {
    if (!force) {
      // Don't bother refetching tabs if we already did so recently
      let lastFetch = 0;
      try {
        lastFetch = Services.prefs.getIntPref("services.sync.lastTabFetch");
      }
      catch (e) { /* Just use the default value of 0 */ }
      let now = Math.floor(Date.now() / 1000);
      if (now - lastFetch < 30)
        return false;
    }
 
    // if Clients hasn't synced yet this session, need to sync it as well
    if (Weave.Service.clientsEngine && Weave.Service.clientsEngine.lastSync == 0)
      Weave.Service.clientsEngine.sync();
 
    // Force a sync only for the tabs and bookmarks engines
    if (Weave.Service.engineManager) {
      let tabsEngine = Weave.Service.engineManager.get("tabs");
      tabsEngine.lastModified = null;
      tabsEngine.sync();
      let bookmarkEngine = Weave.Service.engineManager.get("bookmarks");
      bookmarkEngine.lastModified = null;
      bookmarkEngine.sync();
      Services.prefs.setIntPref("services.sync.lastTabFetch",
                                Math.floor(Date.now() / 1000));
    }

    return true;
  },

  _generateTabList: function() {
    let tabsEngine = Weave.Service.engineManager.get("tabs");
    let list = [];

    let allClients = tabsEngine.getAllClients();

    for (let guid in allClients) {
      let client = allClients[guid];
      // Create the client node, but don't add it in-case we don't show any tabs
      let appendClient = true;
      let seenURLs = {};
      var i = 0;
      client.tabs.forEach(function ({title, urlHistory, icon}) {
        let url = urlHistory[0];
        if (tabsEngine.locallyOpenTabMatchesURL(url) || url in seenURLs)
          return;

        seenURLs[url] = null;

        if (appendClient) {
          let attrs = {
            type: "client",
            clientName: client.clientName,
            class: Weave.Service.clientsEngine.isMobile(client.id) ? "mobile" : "desktop"
          };
          list.push(attrs);
          appendClient = false;
          i = 0;
        }
        let attrs = {
          type: "tab",
          title: title || url,
          url: url,
          icon: Weave.Utils.getIcon(icon)
        }
        i += 1;
        if (i <= 15) {
          list.push(attrs);          
        }
      }, this);
    }
    this._tabsList = list;
    // Call callback here!!!
    if (this._callback) {
      this._callback('tabs', this._tabsList);
    }
  },

  _generateBookmarkList: function() {
    let bookmarksEngine = Weave.Service.engineManager.get("bookmarks");
    let list = [];

    let ids = Object.keys(bookmarksEngine._store.getAllIDs());
    for each (let id in ids) {
      let record = bookmarksEngine._store.createRecord(id, "bookmarks");
      let len = record.toString().length;
      let attrs = {
        type: "tab",
        title: record.title || record.bmkUri,
        url: record.bmkUri,
        parent: record.parentName
      };
      list.push(attrs);
      //dump("BW: " + id + ", len = " + len + ", " + record.title + " << " + record.parentName + "\n");
    }
    this._bookmarksList = list;
    // Call callback here!!!
    if (this._callback) {
      this._callback('bookmarks', this._bookmarksList);
    }
  },
  observe: function(subject, topic, data) {
    switch (topic) {
      case "weave:service:login:finish":
        this.buildList(true);
        break;
      case "weave:engine:sync:finish":
        if (subject == "tabs")
          this._generateTabList();
        if (subject == "bookmarks")
          this._generateBookmarkList();
        break;
    }
  },
};

exports.SyncTabs = SyncTabs;