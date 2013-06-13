/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = [];
    this.apps={};

    this.init();

    /*
    Events
     */
    
  $("button.add_app").click(function(e){
    $target = $(e.target);
    var $app_banner = $target.parent().parent();
    var app_id = $.data($app_banner.get(0), 'app_id');
    $app_banner.hide();
    this.add_app(app_id);
  }.bind(this));

  $("#new_panel_button")
  .on('mouseenter',function(e){
    $(e.target).attr('src', '../images/big_plus_shadow.png');
  })
  .on('mouseleave click',function(e){
    $(e.target).attr('src', '../images/big_plus.png');
  })

    
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
      // this.create_panel();
      // this.create_panel();
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
      var width = 110 + 10 + this.panels.length * (panel_width + panel_margin);
      $('#slider_div').css('width', width+'px');
    },

    create_panel: function(){

      var $new_panel = $("#templates .panel_wrapper").clone(true, true);
      this.panels.push(new Panel($new_panel));

      /* set panel number */
      $new_panel.find('.panel_number').html("Panel "+this.panels.length);

      $("#new_panel_button").before($new_panel);
      this.adjust_slider_width();
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

      /* set jquery data of app_id onto the banner */
      $.data($new_app.get(0), "app_id", app_data.id);

      $("#apps_list").append($new_app);

      /* add data to Customizier */
      var app_data_copy = JSON.parse(JSON.stringify(app_data));
      this.apps[app_data.id] = {
        original_data: app_data_copy
      };
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
        if(panel.room_for_app(app)){
          panel.add_app(app);
          panel_found = true;
          return false;
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
  function Panel($panel){
    this.$panel = $panel;
    this.$app_group = $panel.find(".app_group");
    this.size = 1;
    this.apps = [];
  }

  Panel.prototype = {

    add_app: function(app){
      app.panel = this;

      // this.resize_apps();
      // app.size = (app.original_data.max_size || 6-this.get_size());

      /* create new app_container */
      var $new_app_container = $("#templates>.app_container").clone(true, true);
      $new_app_container.addClass('app_'+app.size);
      this.$app_group.append($new_app_container);

      app.$el = $new_app_container;

      this.apps.push(app);
      console.log("app:");
      console.log(app);

      this.resize_apps();

    },

    remove_app: function(id){

    },

    resize_apps: function(){
      var remaining_size = 6;
      var non_fixed_apps = 0;
      
      /* walk through apps once looking for apps that have a fixed size
      and subtract that from the remaining size */

      $.each(this.apps, function(i, app){
        if(app.fixed_size) remaining_size-= app.size;
        else non_fixed_apps++;
      });
      console.log("non_fixed_apps: ", non_fixed_apps);
      /* distribute remaining size evenly among other apps */
      $.each(this.apps, function(i, app){
          console.log("resizing");
          app.$el.removeClass('app_1 app_2 app_3 app_6');
          app.size = remaining_size/non_fixed_apps;
          app.$el.addClass('app_'+app.size);
        

      // maintain all locked apps
      // want to make all apps as big as possible

      });
    },

    get_size: function(){
      var total = 0;
      $.each(this.apps, function(i, app){
        total+=app.size;
      });
      return total;
    },

    room_for_app: function(app){
      if(this.apps.length === 0) return true;
      var app_size = (app.original_data.min_width || 1);

      /* check if room exists */
      // if(this.get_size() + app_size <= 3) return true;

      /* check if we can resize apps that are already on the panel */
      if(this.apps.length > 2) return false;
      var can_make_room = false;
      $.each(this.apps, function(i, app){
        console.log("app.size: ", app.size);
        if(!app.size_locked && (app.original_data.min_width || 1) < app.size ){
          can_make_room = true;
        }
      });
      console.log("make room: ", can_make_room);
      return can_make_room;
    }
  };

    var available_apps =
    [
      {id: "recently_closed", name: "Recently Closed"},
      {id: "recently_bookmarked", name: "Recently Bookmarked"},
      {id: "read_it_later", name: "Read It Later"},
      {id: "top_sites", name: "Top Sites", min_width: 3}
    ];



  /* run */
  $(function(){
    new Customizer();
  });
})();