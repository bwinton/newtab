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
    
  /* scroll left or right */

  $(document).on('keydown',function(e){
    $div = $("#slider_container")
    switch(e.keyCode){
      case(39): /* right */
        $div.scrollTo("+=480px", "easeOutElastic");
        console.log("right");
        break;
      case(37): /* left */
        console.log("left");
        $div.scrollTo("-=480px", "easeOutElastic");
        break;
    }
  }.bind(this))

  /* prevent dragging certain elements on panels */
  $('.panel_header, .panel_footer').on('dragstart', prevent_drag);
  $('#new_panel_button').click(function(){
    this.create_panel();
  }.bind(this));


  }

  Customizer.prototype = {
    init: function(){
      this.create_panel();
      this.create_panel();
      this.create_panel();
      this.create_app();
      this.create_app();

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
      $new_panel.find('.panel_number').html("Panel "+this.panels);

      $("#new_panel_button").before($new_panel);
    },

    create_app: function(){
      console.log("creating app");
      var $new_app = $("#templates .app_banner").clone(true, true);

      /* fill in app details */
      var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, itaque, magnam, accusamus.";
      
      $new_app.find(".app_icon").attr('src', '../4/newtab_apps/Recently_Bookmarked/logo.png');
      // $new_app.find(".app_icon").attr('src', 'http://www.google.com/images/srpr/logo4w.png');
      
      $new_app.find(".app_title").html("The Name of an App");
      $new_app.find(".app_description").html(lorem);

      $("#apps_list").append($new_app);
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