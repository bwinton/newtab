;(function(){
    var Footer = function(){

      /* Load the snippets. */
      // loadSnippets();
      /* 
      EVENTS
      */
       /* Handle the telemetry snippet. */
      // $('#snippets').on('click', 'span[class^="telemetry-button-"]', function (event) {
      //   event.preventDefault();
      //   var type = $(this).attr('class').slice(17);
      //   var current = $(this).parents('div[class^="telemetry-note-"]').attr('class').slice(15);
      //   $(this).parents('div[class^="telemetry-note-"]').toggle();
      //   if (type === 'sure') {
      //     $('.telemetry-note-2').toggle();
      //     $('#telemetry-icon-1').hide();
      //     $('#telemetry-icon-2').show();
      //     localStorage['telemetry-prompted'] = 'sure';
      //   } else if (type === 'no') {
      //     $('.telemetry-note-3').toggle();
      //     $('#telemetry-icon-1').show();
      //     $('#telemetry-icon-2').hide();
      //     localStorage['telemetry-prompted'] = 'no';
      //   } else if (type === 'maybe') {
      //     $(this).parents('div[class^="telemetry-note-"]').toggle();
      //     window.open('https://www.mozilla.org/en-US/legal/privacy/firefox.html#telemetry');
      //   } else if (type === 'undo') {
      //     $('.telemetry-note-1').toggle();
      //     $('#telemetry-icon-1').show();
      //     $('#telemetry-icon-2').hide();
      //     delete localStorage['telemetry-prompted'];
      //   }

      //   interesting('telemetry', {'type': type, 'current': current});
      // });

    };

    /* export */
    window.Footer = Footer;

})();