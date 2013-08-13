/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

/*global interesting:false, Header:false, Footer:false, Slider:false */

"use strict";

;(function () {
  // We need to dispatch this or our window won't get hooked up!
  document.dispatchEvent(new CustomEvent('document-element-inserted'));

  /* Send a message to the add-on. */
  window.interesting = function interesting(type, detail) {
    var event = new CustomEvent('tpemit', {'detail': {'type': type, 'detail': detail}});
    console.log("BW - emit message: ", type, detail);
    document.dispatchEvent(event);
  };


  var NewTab = function () {

    this.submods = {
      panels: []
    };
    this.data = {};

    this.init();

  };

  NewTab.prototype.init = function () {
    /* setup header and footer */
    this.submods.header = new Header();
    this.submods.footer = new Footer();

    /* listen for the apps_layout event */
    window.addEventListener('message', function (event) {
      var data = event.data;
      console.log('data: ');
      console.log(data);
      if (data.type === 'apps') {
        this.submods.slider = new Slider(this, data.data);
      }
    });
    /* emit init event */
    interesting('initialized');
  };


  /* run */
  $(function () {
    new NewTab();
  });

})();