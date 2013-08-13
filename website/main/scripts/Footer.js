/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
strict:true, undef:true, curly:true, browser:true, moz:true,
indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
globalstrict:true, nomen:false, newcap:true */

/*global interesting:false */

"use strict";

;(function () {
  var Footer = function () {

    /* go to customizer on click */
    $('#settings').on('click', function (e) {
      // e.preventDefault();
      // e.stopPropagation();
      // document.location.href = 'about:newtab-config';
      interesting('page-switch', 'newtab-config');
    });
  };

  /* export */
  window.Footer = Footer;

})();