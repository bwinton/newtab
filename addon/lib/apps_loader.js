/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

/*global chrome:true */

"use strict";

const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
const data = require('sdk/self').data;
const defer = require('sdk/core/promise').defer;
const file = require('sdk/io/file');
const chrome = require('chrome');

/**
 * requires: an app's id
 * description: will find the app's app.js
 * file and run it to get back the list
 * of items the app wants to display
 */
function query_app(id) {
  console.log('query: ' + id);

  var code = data.url('apps/' + id + '/app.js');
  console.log(code);
  var scope = sandbox(null, {sandboxPrototype:
    {chrome: chrome, console: console, defer: defer, require: require, exports: {}}
  });

  var result;
  var success = true;
  try {
    load(scope, code);
    result = evaluate(scope, 'exports.run()');
  }
  catch (e) {
    console.error('error getting app data from ' + id);
    console.error(e);
    result = [];
    success = false;
  }

  return [success, result];
}

exports.query_app = query_app;
