function run(){
  console.log('yooo');
  return get_app_display();
}

/* asks the backend for the information
that the app is going to display */
function get_app_display(){
  var img = "https://assets.mozillalabs.com/Brands-Logos/Firefox/logo-only/firefox_logo-only_RGB.png";

  var arr = [];
  for(var x=0; x< 10; x++){
    arr.push({
      title: "this is text",
      subtitle: "this is the subtext to the line",
      image: img,
      link: "http://www.google.com"
    });
  }
  return arr;
}

exports.run = run;