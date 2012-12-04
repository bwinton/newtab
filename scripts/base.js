const WEATHER_URL = 'http://openweathermap.org/data/2.1/find/city?lat={LAT}&lon={LON}&cnt=1&callback=?';

$(function () {
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
      $('#weather img').attr('src', 'http://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png');
      // alert(data.list[0].name + ', ' + (data.list[0].main.temp - 273.15).toFixed(1) + ', ' +
      //      data.list[0].weather[0].main + ', ' +
      //      'http://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png');
    });
    // Get data.list[0].name, data.list[0].main.temp - 273.15,
    //     data.list[0].weather.main, 'http://openweathermap.org/img/w/' + data.list[0].weather.icon
    // {
    //   "message":"Model=GFS-OWM, ",
    //   "cod":"200",
    //   "calctime":" mysql = 0.0038 mongo = 0.0004 center = 0.0142 total=0.0185",
    //   "cnt":1,
    //   "list":[
    //     {
    //       "id":6167865,
    //       "name":"Toronto",
    //       "coord":{
    //         "lon":-79.416298,
    //         "lat":43.700111
    //       },
    //       "distance":2.878,
    //       "main":{
    //         "temp":280.45,
    //         "pressure":1020,
    //         "humidity":87,
    //         "temp_min":278.71,
    //         "temp_max":283.15
    //       },
    //       "dt":1354579685,
    //       "wind":{
    //         "speed":7.7,
    //         "deg":70
    //       },
    //       "clouds":{
    //         "all":90
    //       },
    //       "weather":[
    //         {
    //           "id":804,
    //           "main":"Clouds",
    //           "description":"overcast clouds",
    //           "icon":"04n"
    //         }
    //       ]
    //     }
    //   ]
    // }
  }
});