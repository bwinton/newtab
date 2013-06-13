/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = 0;
    this.apps={};

    this.init();

    /*
    Events
     */
    
  $("button.add_app").click(function(){
    alert("add app");
  });
    
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
      this.populate_apps_list(available_apps);

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

    /* creates a new app in the list of available apps */
    create_app: function(app_data){
      console.log("creating app");
      var $new_app = $("#templates .app_banner").clone(true, true);

      /* fill in app details */
      var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, itaque, magnam, accusamus.";
      
      $new_app.find(".app_icon").attr('src', '../4/newtab_apps/Recently_Bookmarked/logo.png');
      // $new_app.find(".app_icon").attr('src', 'http://www.google.com/images/srpr/logo4w.png');
      
      $new_app.find(".app_title").html("The Name of an App");
      $new_app.find(".app_description").html(lorem);

      $("#apps_list").append($new_app);

      /* add data to Customizier */
      var app_data_copy = JSON.parse(JSON.stringify(app_data));
      this.apps[app_data.id] = {
        size: 1,
        original_data: app_data_copy
      }
    },

    /* adds a list of apps to the the list of available apps */
    populate_apps_list: function(apps_list){
      $(apps_list).each(function(i, app){
        this.create_app(app);
      }.bind(this));
    },

    /* adds an app to the new tab page */
    add_app: function(app_id){
      var app = this.apps[app_id];

      /* hide app_banner */
      // $(".app_banner")

      /* find first panel with room for new app or create one */
      var panel_found = false;
      $(this.panels).each(function(i, panel){
        if(panel.size<3){
          panel.add(app);
        }
      });
      if(panel_found) return;
      else{
        this.create_panel();
        this.panels[this.panels.length-1].add_app(app);
      }
    }


  };

  /* helpers */

  function prevent_drag(e){
    e.preventDefault();
  }


  /*
  helper classes
   */
  
  /* for keeping track of the data
  in each panel */
  function Panel(){
    this.size = 0; 
  }

  Panel.prototype = {

    add_app: function(app){
      app.panel = this;

      /* create new app_container */
      var $new_app_container = null;
      this.$apps_container.append($new_app_container)

    },

    remove_app: function(id){

    }
  };

    var available_apps =
    [
      {id: "recently_closed", name: "Recently Closed"},
      {id: "recently_bookmarked", name: "Recently Bookmarked"},
      {id: "read_it_later", name: "Read It Later"}
      // {id: "top_sites", name: "Top Sites", min_width: 3}
    ]



  /* run */
  $(function(){
    new Customizer();
  });
})();