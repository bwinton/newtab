/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = [];
    this.apps={};
    this.data={};

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
    .on('mousedown',function(e){
      $(e.target).attr('src', '../images/big_plus.png');
    })
    .on('mouseup',function(e){
      $(e.target).attr('src', '../images/big_plus_shadow.png');
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
    $('.panel_header, .panel_footer, #new_panel_button').on('dragstart', prevent_drag);
    $('#new_panel_button').click(function(){
      this.create_panel();
    }.bind(this));

    /* app settings panel popup */
    $(".app_container")
    .on('mouseenter',function(e){
      var $target = $(e.target);
      var t = setTimeout(function() {
        this.show_app_settings($(e.target));
      }.bind(this), 1000);
      $target.data('timeout', t);
    }.bind(this))
    .on('mouseleave',function(e){
      $target = $(e.target).closest(".app_container");
      clearTimeout($target.data('timeout'));
    }.bind(this));



  }

  Customizer.prototype = {
    init: function(){
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
    },

    show_app_settings: function($app_container){
      if(!$app_container.hasClass('app_container')) return;
      var $settings_panel = $("#templates .app_settings_panel").clone(true, true).html();
      var app_id = $app_container.data('app_id');
      var app = this.apps[app_id];

      this.data.saved_app_contents = $app_container.html();
      $app_container.html($settings_panel);
      $app_container.addClass("settings_panel");

      var $dropdown = $app_container.find(".size_selector");

      /* setup app size dropdown */
      $dropdown.find('option').filter(function(){
        console.log("app.size: ", app.size)
        console.log("this.val: ", $(this).val())
        return $(this).val() === ""+app.size;
      }).attr('selected', true);

      /* setup close button */
      $app_container.find("button.cancel_app_changes").click(function(e){
        this.hide_app_settings($app_container);
      }.bind(this));

      /* setup save button */
      $app_container.find("button.save_app_changes").click(function(e){
        var new_size = $dropdown.val();
        // alert(new_size);

        if(new_size > 0) this.change_app_size($app_container, new_size);
        this.hide_app_settings($app_container);
      }.bind(this));

      /* setup remove_app button */
      $app_container.find("button.remove_app").click(function(e){
        this.hide_app_settings($app_container);
      }.bind(this));

    },

    hide_app_settings: function($app_container){
      console.log("exiting");
      console.log($app_container);
      var saved_html = this.data.saved_app_contents;
      if(!saved_html){
        return;
      }
      $app_container.html(saved_html);
      $app_container.removeClass("settings_panel");
      delete(this.data.saved_app_contents);
    },

    change_app_size: function($app_container, size){
      var app_id = $app_container.data('app_id');
      var app = this.apps[app_id];

      app.size = size;
      app.fixed_size = true;

      $app_container.removeClass('app_2 app_3 app_4 app_6');
      $app_container.addClass('app_'+size);
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
      console.log(app)
      app.panel = this;

      // this.resize_apps();
      // app.size = (app.original_data.max_size || 6-this.get_size());

      /* create new app_container */
      var $new_app_container = $("#templates>.app_container").clone(true, true);
      this.$app_group.append($new_app_container);

      app.$el = $new_app_container;

      $new_app_container.data('app_id', app.original_data.id);

      this.apps.push(app);

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
          if(app.fixed_size) return;
          console.log("resizing");
          app.$el.removeClass('app_2 app_3 app_4 app_6');
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
        if(!app.fixed_size && (app.original_data.min_width || 1) < app.size ){
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