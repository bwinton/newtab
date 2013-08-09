/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

/*global chrome:true */

"use strict";
const {Cu, Cc, Ci} = chrome;

/* queries the browser's history */
function get() {
  var historyService = Cc['@mozilla.org/browser/nav-history-service;1']
                         .getService(Ci.nsINavHistoryService);
  var query = historyService.getNewQuery();
  var options = historyService.getNewQueryOptions();
  options.sortingMode = options.SORT_BY_DATE_DESCENDING;
  options.maxResults = 30;

  // execute the query
  var result = historyService.executeQuery(query, options);

  // iterate over the results
  result.root.containerOpen = true;
  var count = result.root.childCount;
  var data = [];
  for (var i = 0; i < count; i++) {
    var node = result.root.getChild(i);
    // do something with the node properties...
    var title = node.title || node.uri;
    var url = node.uri;
    // var visited = node.accessCount;
    // var lastVisitedTimeInMicrosecs = node.time;
    var iconURI = node.icon; // is null if no favicon available
    if (iconURI) {
      iconURI = iconURI.substring(iconURI.indexOf('favicon:') + 8);
    }
    data.push({title: title, link: url, image: iconURI});
  }
  // callback(data);
  result.root.containerOpen = false;
  return data;
}

function run() {
  var data = get();
  return data;
}

exports.run = run;