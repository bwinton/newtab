;(function(){
  var Footer = function(){

    /* go to customizer on click */
    $('#settings').on('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      // document.location.href = 'about:newtab-config';
      interesting('page-switch', 'newtab-config');
    });
  };

  /* Send a message to the add-on. */
  function interesting (type, detail) {
    var event = new CustomEvent('tpemit', {'detail': {'type': type, 'detail': detail}});
    document.dispatchEvent(event);
  }

  /* export */
  window.Footer = Footer;

})();