/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(){
    this.panels = [];
    this.apps={};
    this.data={};

    /* should always be in the order that apps
    exist on the newtab page */
    this.data.added_apps = [];

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

    /*
    main functions
     */
    
    /* adds an app to newtab page */
    add_app: function(app){

    },

    /* moves an app to a new spot on newtab page */
    move_app: function(app, new_index){

    },

    /* removes an app from newtab page */
    remove_app: function(app){

    },

    /* resizes an app on newtab page */
    resize_app: function(app, new_size){

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

    /* finds a spot for the given app in the
    array of apps and adds the app */
    insert_app_into_array: function(){

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
      var panel = new Panel(this, $new_panel);
      this.panels.push(panel);

      /* set panel number */
      $new_panel.find('.panel_number').html("Panel "+this.panels.length);

      $("#new_panel_button").before($new_panel);
      this.adjust_slider_width();

      return panel;
    },

    /* creates a new app in the list of available apps */
    create_app: function(app_data){
      console.log("creating app");
      var $new_app = $("#templates .app_banner").clone(true, true);

      /* fill in app details */
      var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, itaque, magnam, accusamus.";
      
      $new_app.find(".app_icon").attr('src', '../4/newtab_apps/Recently_Bookmarked/logo.png');
      // $new_app.find(".app_icon").attr('src', 'http://www.google.com/images/srpr/logo4w.png');
      
      $new_app.find(".app_title").html(app_data.id);
      $new_app.find(".app_description").html(lorem);

      /* set jquery data of app_id onto the banner */
      $.data($new_app.get(0), "app_id", app_data.id);

      $("#apps_list").append($new_app);

      /* add data to Customizier */
      var app_data_copy = JSON.parse(JSON.stringify(app_data));
      this.apps[app_data.id] = {
        original_data: app_data_copy,
        $banner: $new_app
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

      var panel = this.find_or_create_panel(app);

      panel.add_app(app);
    },

    find_or_create_panel: function(app){
      /* try to find a panel with room for the app on it */
      var return_panel;
      $(this.panels).each(function(i, panel){
        if(panel.room_for_app(app)){
          return_panel = panel;
          return false;
        }
      });
      if(return_panel) return return_panel;

      /* no panel found so create one */
      else{
        return this.create_panel();
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
        var new_size = parseInt($dropdown.val());
        // alert(new_size);

        if(new_size > 0) this.resize_app($app_container, new_size);
        this.hide_app_settings($app_container);
      }.bind(this));

      /* setup remove_app button */
      $app_container.find("button.remove_app").click(function(e){
        var app_id = $app_container.data('app_id');
        var app = this.apps[app_id];
        app.panel.remove_app(app);
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

    resize_app: function($app_container, size){
      var app_id = $app_container.data('app_id');
      var app = this.apps[app_id];

      app.size = size;
      app.fixed_size = true;

      $app_container.removeClass('app_2 app_3 app_4 app_6');
      $app_container.addClass('app_'+size);

      this.reinsert_all_apps()
    },

    /* temporarily removes an app from its panel so that
    it can be reinserted after a previous app is resized */
    temp_remove_app: function(app){
      /* remove app from panel */
      app.$el.remove();
      app.panel.apps.splice(app.panel.apps.indexOf(app), 1);
      delete app.panel;

      /* remove panel from app */
      delete app.panel;
      /* if size isn't fixed, remove size */
      if(!app.fixed_size) delete app.size;
    },

    /* reinserts an app that was removed temporarily for
    for resizing purposes */
    reinstert_app: function(app){
      /* find the correct panel for the app */
      var panel = this.find_or_create_panel(app);

      /* insert the app into the panel */
      panel.$app_group.append(app.$el);

      panel.apps.push(app);

      panel.resize_apps();
    },

    /* temorarily removes and then reinserts all apps that are
    currently on the newtab */
    reinsert_all_apps: function(){
      /* generate a list of all apps that are on newtab
      and save them in order */
      var apps_removed = [];
      $.each(this.apps, function(i, app){
        /* get only the apps that are on panels */
        if(app.panel){
          apps_removed.push(app);
          this.temp_remove_app(app);
        }
      }.bind(this));

      // alert("apps removed: "+apps_removed.length);

      $.each(apps_removed, function(i, app){
        this.reinstert_app(app);
      }.bind(this));
    }


  };

  function App(data){
    this.id = data.id;
    this.name = data.name;
    this.min_size = data.min_size;
    this.max_size = data.max_size;

    this.init();
  }

  App.prototype = {
    init: function(){

    }
  }

  /* helpers */

  function prevent_drag(e){
    e.preventDefault();
  }

  var available_apps =
  [
    {id: "recently_closed", name: "Recently Closed"},
    {id: "recently_bookmarked", name: "Recently Bookmarked"},
    {id: "read_it_later", name: "Read It Later"},
    {id: "top_sites", name: "Top Sites", min_size: 3}
  ];



  /* run */
  $(function(){
    new Customizer();
  });
})();