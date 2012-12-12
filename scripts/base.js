const WEATHER_URL = 'http://openweathermap.org/data/2.1/find/city?lat={LAT}&lon={LON}&cnt=1&callback=?';

let Cu = Components.utils;
let Ci = Components.interfaces;

Cu.import("resource:///modules/NewTabUtils.jsm");

$(function () {

  $('history').add('site').click(function(e) {
    var url = $(this).attr('url');
    if (url)
      window.location = url;
  });

  NewTabUtils.links.populateCache(function () {
    //We can get the links here.
    var links = NewTabUtils.links.getLinks();
    var container = $('#topsites').empty();
    for (var i = 0; i < 9; i++) {
      if (i < links.length) {
        container.append($('<site url="' + links[i].url+ '">' + links[i].title + '</site>'));
      } else {
        container.append($('<site></site>'));
      }
    }
  });


  loadSnippets();
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);

  function locationError(error){
    alert("Bbbbbb!");
    switch(error.code) {
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
   
  function showError(msg){
    weatherDiv.addClass('error').text(msg);
  }

  function locationSuccess(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    $('#weather img').attr('src', '');
    $('#weather .temperature').text('Getting weather for…');
    $('#weather .city').text(lat.toFixed(2)+', '+lon.toFixed(1));
    $.getJSON(WEATHER_URL.replace('{LAT}',position.coords.latitude)
                         .replace('{LON}',position.coords.longitude), function (data) {
      $('#weather .temperature').text((data.list[0].main.temp - 273.15).toFixed(1) + "ºC");
      $('#weather .city').text(data.list[0].name);
      $('#weather img').attr('src', 'http://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png')
                       .attr('title', data.list[0].weather[0].description);
    });
  }
});