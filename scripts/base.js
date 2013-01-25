/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true,
  strict:true, undef:true, curly:true, browser:true, es5:true,
  indent:2, maxerr:50, devel:true, node:true, boss:true, white:true,
  globalstrict:true, nomen:false, newcap:true, esnext:true */

/*global loadSnippets:true, CustomEvent: true */

"use strict";

const WEATHER_URL = 'http://openweathermap.org/data/2.1/find/city?lat={LAT}&lon={LON}&cnt=1&callback=?';

$(function () {

  /* When we click on things in the middle, open them up in this window. */
  $('#middle').on('click', 'history, site', function site_click(e) {
    var url = $(this).attr('url');
    if (url) {
      window.location = url;
    }
  });

  /* Handle the search form. */
  $("#searchForm").submit(function onSearchSubmit(aEvent) {
    let searchTerms = document.getElementById("searchText").value;
    let searchURL = document.documentElement.getAttribute("searchEngineURL");
    if (searchURL && searchTerms.length > 0) {
      const SEARCH_TOKENS = {
        "_searchTerms_": encodeURIComponent(searchTerms)
      };
      for (let key in SEARCH_TOKENS) {
        searchURL = searchURL.replace(key, SEARCH_TOKENS[key]);
      }
      window.location.href = searchURL;
    }
    aEvent.preventDefault();
  });


  /* Handle the list of recently-viewed sites. */
  var addSites = function addSites(links) {
    //We can get the links here.
    var container = $('#topsites');
    container.children().not("h3").remove();
    for (var i = 0; i < 9; i++) {
      var site = '<site></site>';
      if (i < links.length) {
        site = '<site url="';
        site += links[i].url;
        if (links[i].img) {
          site += '" img="' + links[i].img;
        }
        site += '">' + links[i].title + '</site>';
      }
      container.append($(site));
    }
  };

  /* Add the default list of sites. */
  addSites([
    {url: 'http://www.weatheroffice.gc.ca/city/pages/on-143_metric_e.html',
     title: 'Toronto, Ontario - 7 Day Forecast',
     img: 'aboutpixels'},
    {url: 'https://bugzilla.mozilla.org/request.cgi?action=queue&requestee=bwinton@mozilla.com',
     title: 'Request Queue',
     img: 'chromaticpixel'},
    {url: 'https://people.mozilla.com/~bwinton/australis/customization/mac/',
     title: 'Home',
     img: 'firefox'},
    {url: 'https://mail.mozilla.com/zimbra/#1',
     title: 'Zimbra: Inbox',
     img: 'isitmfbt'},
    {url: 'http://www.hulu.com/',
     title: 'Hulu',
     img: 'hulu'},
  ]);

  /* Handle the list of tabs from other computers. */
  var addOtherTabs = function addOtherTabs(links) {
    var container = $('#tabsList > .scrollingContainer');
    container.children().remove();
    for (var i = 0; i < links.length; i++) {
      var site = '<history url="';
      site += links[i].url;
      if (links[i].img) {
        site += '" img="' + links[i].img;
      }
      site += '">' + links[i].title + '</history>';
      container.append($(site));
    }
  };

  /* Add the default list of tabs. */
  addOtherTabs([
    {url: 'https://www.dropbox.com/', title: 'Dropbox',
     img: 'https://www.dropbox.com/static/images/favicon-vfl7PByQm.ico'},
    {url: 'http://yelp.com/', title: 'Yelp'},
    {url: 'http://amazon.com/', title: 'Amazon'},
    {url: 'http://www.npr.org/', title: 'NPR'},
  ]);


  /* Load the snippets. */
  loadSnippets();


  /* Handle the weather */
  function locationError(error) {
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
    $.getJSON(WEATHER_URL.replace('{LAT}', lat).replace('{LON}', lon), function (data) {
      var city = data.list[0];
      $('#weather .temperature').text((city.main.temp - 273.15).toFixed(1) + "ºC");
      $('#weather .city').text(city.name);
      $('#weather img').attr('src', 'http://openweathermap.org/img/w/' + city.weather[0].icon + '.png')
                       .attr('title', city.weather[0].description);
    });
  }

  /* Load the default weather. */
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);


  /* Send a message to the add-on. */
  var interesting = function (data) {
    var event = new CustomEvent('tpemit', {'detail': data});
    document.dispatchEvent(event);
  };

  /* Receive a message from the add-on. */
  window.addEventListener('message', function (event) {
    var data = event.data;
    if (data.type === 'sites') {
      addSites(data.sites);
    } else if (data.type === 'tabs') {
      addOtherTabs(data.tabs);
    } else if (data.type === 'geolocation') {
      locationSuccess(data.position);
    }
  }, false);

  /* And let the add-on know that we're done initializing. */
  interesting('initialized');
});