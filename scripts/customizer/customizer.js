/**
 * This is the code for the settings configuration tool for the #4 prototype
 */

;(function(){

  function Customizer(apps_data){
    this.data={
      apps: [],
      added_apps: [],
      panels: []
    };

    this.init(apps_data);

    /*
    Events
     */


    /* scroll left or right */

    $(document).on('keydown',function(e){
      $div = $("#slider_container");
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
    }.bind(this));

    /* prevent dragging certain elements on panels */
    $('.panel_header, .panel_footer, #new_panel_button').on('dragstart', prevent_drag);

    /* install clickjack */
    $(document).click(function(e){
      this.clickjack(e);
    }.bind(this));

    /* handle dragging on to dropzone */
    $('#app_dropzone')
      .on('dragover', function(e){
        e.preventDefault();

        return false;
      })
      .on('dragenter', function(e){
        return false;
      })
      .on('drop', function(e){
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();
        var app_id = e.originalEvent.dataTransfer.getData('Text');
        var app;
        $.each(this.data.apps, function(i, a){
          if(a.id === app_id) app=a;
        });

        app.$app_container.css('opacity', '1.0');
        this.remove_app(app);

        return false;

      }.bind(this))
    ;

  }

  Customizer.prototype = {
    init: function(apps_data){
      /* populate apps list */
      $.each(apps_data, function(i, app_data){
        this.create_app(app_data);
      }.bind(this));

      this.render_panels();
      $('#app_dropzone').hide();

    },

    /*
    handler functions
    (setup data to call main functions)
     */

    /*
    main functions
     */

    /* adds an app to newtab page */
    add_app: function(app){
      this.insert_app(app);
      this.optimize_array();
      this.render_panels();
    },

    /* moves an app to a new spot on newtab page */
    move_app: function(app, new_index){
      this.remove_app(app, true);
      this.insert_app_at_index(app, new_index);
      this.optimize_array();
      this.render_panels();
    },

    /* removes an app from newtab page. 
    if keep_size then doesn't delete the
    apps size if fixed size is also true*/
    remove_app: function(app, keep_size){
      app.set_not_active();
      $('#app_dropzone').hide();
      this.remove_app_from_active_apps(app);
      this.optimize_array();
      this.render_panels();
      if(keep_size){
        
      }
      else{
        app.show_banner();
      }
    },

    /* resizes an app on newtab page */
    resize_app: function(app, new_size){
      app.size = new_size();
      app.fixed_size = true;
      this.optimize_array();
      this.render_panels();
    },

    /* creates a new app and adds it to Customizer's
    list of all apps */
    create_app: function(data){
      var app = new App(this, data);
      this.data.apps.push(app);
    },


    /*
    secondary functions
     */

    /* renders the Customizer's array of apps
    into a series of panels */
    render_panels: function(){
      /* clear panels that are currently in dom */
      $("#slider_div>.panel_wrapper").remove();
      this.data.panels = [];

      /* always create at least one panel, even if it's empty */
      if(this.data.added_apps.length === 0) this.render_panel();
      else{
        var panels = this.generate_app_groups();

        $.each(panels, function(i, panel){
          this.render_panel.apply(this, panel.apps);
        }.bind(this));
      }

    },

    /* takes any number of apps and renders a panel from them */
    render_panel: function(){
      console.log(arguments)
      /* create panel */
      var $panel = $("#templates .panel_wrapper").clone(true, true);
      /* add to list of panels */
      this.data.panels.push($panel);
      /* set panel number */
      $panel.find('.panel_number').html("Panel "+this.data.panels.length);

      var $app_group = $panel.find('.app_group');

      /* add apps to panel */
      $.each(arguments, function(i, app){
        var $app_container = app.$app_container;
        $app_container.removeClass('app_2 app_3 app_4 app_6');
        console.log(app.size);
        $app_container.addClass('app_'+ app.size);

        $app_group.append($app_container);

        /* add id to app_container */
        $app_container.data('app_id',app.id);

        /* setup active mode on click */
        $app_container.click(function(e){
          app.set_active();
          e.stopPropagation();
        });

        /* handle dragging */
        $app_container
          .on('dragstart', function(e){
             app.set_active();
             console.log("dragstart");
             
             e.originalEvent.dataTransfer.setData('Text', app.id);
             $app_container.css('opacity', '0.4');
             this.data.dragging_app = app;
          }.bind(this))
          .on('dragend', function(e){
             console.log("dragend");

             $app_container.css('opacity', '1.0');
             $(e.target).removeClass('drag_over');

             delete this.data.dragging_app;
          }.bind(this))
          .on('dragover', function(e){
            e.preventDefault();

            return false;
          }.bind(this))
          .on('dragenter', function(e){
            /* make sure that we're dragging ono a different panel */
            if(e.target === this.data.dragging_app.$app_container.get(0)) return false;


            $(e.target).closest('.app_container').addClass('drag_over');

            return false;
          }.bind(this))
          .on('dragleave', function(e){

            $(e.target).closest('.app_container').removeClass('drag_over');

            return false;
          }.bind(this))
          .on('drop', function(e){
            e.preventDefault();
            $target = $(e.target);

            $(e.target).closest('.app_container').removeClass('drag_over');
            
            var destination_app_id = $target.closest('.app_container').data('app_id');
            var destination_app;
            var destination_index;
            $.each(this.data.added_apps, function(i, app){
              if(app.id === destination_app_id){
                destination_app = app;
                destination_index = i;
                return false;
              }
            });
            // alert(destination_index);


            var source_app = this.data.dragging_app;
            var source_app_index;

            this.move_app(source_app, destination_index);


            return false;
          }.bind(this))

        ;
      }.bind(this));

      /* add panel to the dom */
      $("#slider_div").append($panel);
      this.adjust_slider_width();

    },

    /* changes the size of the apps in the array so that
    the size of apps are maximized while minimizing the
    number of panels */
    /*
    1. given fixed size apps their size
    2. make every app it's min size
    3. distribute extra room to all apps without fixed size
     */
    optimize_array: function(){
      var panels = this.generate_app_groups();
      $.each(panels, function(i, panel){
        /* find how much extra room exists on panel in minimized form */
        var extra_room = 6;
        var flexable_apps = 0; /* apps without a fixed size */
        $.each(panel.apps, function(i, app){
          if(!app.fixed_size) flexable_apps++;
          else extra_room -= app.size;
        });

        /* make all apps their minimum size */
        $.each(panel.apps, function(i, app){
          if(app.fixed_size) return;
          app.size = app.get_min_size();
          extra_room -= app.size;
        });

        /* distribute that extra room to all apps of non fixed size */
        /* sort the apps by smallest size and the distribute discrete sizes */
        panel.apps.sort(function(a, b){
          return a.size - b.size;
        });
        $.each(panel.apps, function(i, app){
          if(app.fixed_size) return;
          var amount_to_add = Math.ceil(extra_room/flexable_apps)
          app.size += amount_to_add;
          extra_room -= amount_to_add;
        });
      });
    },

    /* finds a spot in the array for the given
    app and inserts it */
    insert_app: function(app){
      var optimal_spot = this.find_optimal_spot_for_app(app);
      this.insert_app_at_index(app, optimal_spot);
    },

    /* inserts the given app at the given index */
    insert_app_at_index: function(app, index){
      this.data.added_apps.splice(index, 0, app);
    },

    /*
    helpers
     */

    find_optimal_spot_for_app: function(app){
      var min_app_size = app.get_min_size();

      var panels = this.generate_app_groups();

      /* find the panel with smallest min_size */
      panels.sort(function(a, b){
        return a.min_size - b.min_size;
      });
      var best_panel = panels[0];

      if(!best_panel || best_panel.min_size + min_app_size > 6) best_panel = undefined;
      if(best_panel){
        return this.data.added_apps.indexOf(best_panel.apps[best_panel.apps.length-1])+1;
      }
      else return this.data.added_apps.length;

    },

    /* returns a list of lists of apps from the
    added_apps list where each list is the apps that
    would fit on a panel */
    generate_app_groups: function(){
      var panels = [];

      var current_panel;
      $.each(this.data.added_apps, function(i, app){
        var min_app_size = app.get_min_size();

        /* create a new panel if one is needed */
        if(!current_panel || current_panel.min_size + min_app_size > 6){
          if(current_panel) panels.push(current_panel);
          current_panel = {min_size: 0, apps: []};
        }

        /* add the current app to the panel */
        current_panel.apps.push(app);
        current_panel.min_size += min_app_size;

      });
      if(current_panel) panels.push(current_panel);

      return panels;
    },

    remove_app_from_active_apps: function(app){
      var index = this.data.added_apps.indexOf(app);
      this.data.added_apps.splice(index, 1);
    },

    /* adjusts the overall width of the slider to accomidate all panels */
    adjust_slider_width: function(){
      var panel_width = 480;
      var panel_margin = 20;
      var width = this.data.panels.length * (panel_width + panel_margin);
      $('#slider_div').css('width', width+'px');
    },

    clickjack: function (e) {
      // alert( $(e.target).hasClass('.app_container') )
      // alert( $(e.target).parent().attr('class') )

      
      // alert( $(e.target).hasClass('.active_app') || $(e.target).parents('.app_container').length > 0)
      /* if we're not clicking on the active panel then clickjack */
      // if( !$(e.target).closest('.app_container').hasClass('active_app') ){
      // if( $(e.target).parent().attr('class') !== undefined && !$(e.target).closest('.app_container').hasClass('.active_app')  ){
      if(true){
        $(this.data.added_apps).each(function(i, app){
          app.set_not_active();
          $('#app_dropzone').hide();
        }.bind(this));
      }
    },

    /* takes the array of apps and generates a JSON string
    which represents the configuration as a series of panels
    with apps on it */
    generate_json: function(){

    }



  };

  function App(parent, data){
    this.parent = parent;
    this.id = data.id;
    this.name = data.name;
    this.min_size = data.min_size;
    this.max_size = data.max_size;

    this.data = {};

    this.init();
  }

  App.prototype = {
    init: function(){
      this.create_banner();
      this.create_app_container();
    },

    /*
    main functions
     */
    
    /* renders the app's banner, saves it and
    adds it to the dom */
    create_banner: function(){
      var $banner = $("#templates .app_banner").clone(true, true);

      /* fill in app details */
      var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus, itaque, magnam, accusamus.";

      $banner.find(".app_icon").attr('src', '../4/newtab_apps/Recently_Bookmarked/logo.png');

      $banner.find(".app_title").html(this.name);
      $banner.find(".app_description").html(lorem);

      $("#apps_list").append($banner);

      this.$banner = $banner;

      /* setup events */

      $banner.find('.add_app').click(function(){
        this.add_app();
      }.bind(this));
    },

    create_app_container: function(){
      var $app_container = $("#templates>.app_container").clone(true, true);
      $app_container.find(".app_name").html(this.name);
      this.$app_container = $app_container;
    },

    /* adds app to active apps on newtab */
    /* this calls the Customizer's add_app
    method NOT vice versa */
    add_app: function(){
      this.parent.add_app(this);
      this.hide_banner();
    },

    set_active: function(){
      /* set all other apps to not active */
      $.each(this.parent.data.added_apps, function(i, app){
        app.set_not_active();
      });

      this.active = true;
      this.$app_container.addClass('active_app');

      var $app_container_content = this.$app_container.find('.app_container_content');

      /* store app_container_content */
      this.data.normal_contents = this.$app_container.html();
      // this.$app_container.empty();

      // alert(this.$app_container.html());

      /* replace app_container with active_app template */
      var $active_app_content = $("#templates .active_app_content").clone(true, true);
      $active_app_content.find('.active_app_name').html(this.name);

      this.$app_container.html($active_app_content);

      $('#app_dropzone').show();
    },

    set_not_active: function(){
      this.active = false;
      this.$app_container.removeClass('active_app');

      /* store app_container_content */
      var normal_content = this.data.normal_contents;

      /* replace app_container_content with active_app template */
      // var $app_container_content = this.$app_container.find('.app_container_content'); 
      // this.$app_container.empty();
      this.$app_container.html(normal_content);
    },

    /*
    secondary functions
     */

    get_min_size: function(){
      if(this.fixed_size) return this.size;
      else if(this.min_size) return this.min_size;
      else return 2;
    },

    show_banner: function(){
      this.$banner.show();
    },

    hide_banner: function(){
      this.$banner.hide();
    }
  };

  /* helpers */

  function prevent_drag(e){
    e.preventDefault();
  }

  var available_apps =
  [
    {id: "recently_closed", name: "Recently Closed"},
    {id: "recently_bookmarked", name: "Recently Bookmarked"},
    {id: "read_it_later", name: "Read It Later"},
    {id: "downloads", name: "Downloads", min_size: 4},
    {id: "top_sites", name: "Top Sites", min_size: 3}
  ];



  /* run */
  $(function(){
    new Customizer(available_apps);
  });

})();