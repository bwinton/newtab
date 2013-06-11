/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = 3;
    this.init();

    /*
    Events
     */
  //   $(document).on("keydown", function(e){
  //     switch(e.keyCode){
  //       case 37: /* left */
  //       case 39: /* right */
  //         $("#slider_div").scroll();
  //         break;
  //     }
  //   }.bind(this));
  }

  Customizer.prototype = {
    init: function(){
      this.decorate_panels();
      this.adjust_slider_width();
    },
    
    /* adds extras to panels like header and footer */
    decorate_panels: function(){
      $(".slider_panel").each(function(i, panel){
        $panel = $(panel);
        /* add footers */
        $('<div class="panel_footer">').appendTo(panel);
        /* add headers */
        $panel.append(generate_header);
        // $('<div class="panel_header">').appendTo(panel);

      })
    },

    /* adjusts the overall width of the slider to accomidate all panels */
    adjust_slider_width: function(){
      var panel_width = 480;
      var panel_margin = 20;
      var width = 10 + this.panels * (panel_width + panel_margin);
      $('#slider_div').css('width', width+'px');
    }

  };

  /* helpers */

  function generate_header(){
    return $('<div class="panel_header">')
    .append($('<img class="search_engine_logo">')
      .attr('src','../images/SearchEngines/google_larger.png')
    )
    .append($('<input class="search_box">')
      .attr('disabled',true)
    )
    .append($('<input type="submit" class="search_button">')
      .attr('value','Search')

    )
    // .append(searh)
  }


  /* run */
  $(function(){
    new Customizer();
  });
})();