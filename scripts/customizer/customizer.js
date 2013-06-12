/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = 0;
    this.init();

    /*
    Events
     */

  /* prevent dragging certain elements on panels */
  $('.panel_header, .panel_footer').on('dragstart', prevent_drag);
  $('#new_panel_button').click(function(){
    this.create_panel();
  }.bind(this));


  }

  Customizer.prototype = {
    init: function(){
      this.create_panel();
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

      });
    },

    /* adjusts the overall width of the slider to accomidate all panels */
    adjust_slider_width: function(){
      var panel_width = 480;
      var panel_margin = 20;
      var width = 110 + 10 + this.panels * (panel_width + panel_margin);
      $('#slider_div').css('width', width+'px');
    },

    create_panel: function(){
      this.panels++;
      this.adjust_slider_width();
      
      var $new_panel = $("#templates .panel_wrapper").clone(true, true);
      
      /* set panel number */
      $new_panel.find('.panel_number').html("Panel "+this.panels)

      $("#new_panel_button").before($new_panel);
    }

  };

  /* helpers */

  function prevent_drag(e){
    e.preventDefault();
  }


  /* run */
  $(function(){
    new Customizer();
  });
})();