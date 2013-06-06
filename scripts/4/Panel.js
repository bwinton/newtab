;(function(){
    // var Panel = function($panel){
    /* start and end (inclusive-exclusive) are
    incices into the NewTabs array of app_data */
    var Panel = function(Slider, start, end){

      this.$els = {};
      this.parent = Slider;
      this.data = {
        app_data_start: start,
        app_data_end: end
      };

      this.init();

      /* 
      EVENTS
      */

      /* window resize */
      this.$els.window.resize(function(e) {
        this.fix_size();
      }.bind(this));

    };

    Panel.prototype.init = function(){
      /* find elements */
      this.$els = {
        // panel: $panel,
        // app_group: $panel.find(".app_group"),
        // apps: $panel.find(".app_container"),
        window: $(window)
      };

      this.render();
      window.setTimeout(function(){
        this.fix_size();
        // console.log(this.constructor);
      }.bind(this), 0);

    };

    Panel.prototype.fix_size = function(){
      var panel_height = this.$els.panel.height();
      var panel_width = this.$els.panel.width();
      var apps_on_panel = this.$els.apps.length;
      var denom;

      /* fix panel width */
      var width = $(window).innerWidth();
      this.$els.panel.css("width", width);

      /* calculates how wide the given app should
      be given its container, the number of apps
      it must share the container with, and it's
      min_width factor */
      function calc_app_width($app_container){
        var min_size;
        if($app_container.hasClass("app_3")){
          min_size = 1;
        }
        else if($app_container.hasClass("app_2")){
          min_size = 2;
        }
        else{
          min_size = 3;
        }
        denom = Math.min(min_size, apps_on_panel);
        return (panel_width-300)/denom;
      }

      /* app_group */
      // this.$els.app_group.css("height", panel_height-50+"px");

      /* apps */
      // this.$els.apps.css("height", panel_height-100+"px");
      this.$els.apps.each(function(i,app_container){
        var $app_container = $(app_container);
        var width = calc_app_width($app_container);
        // $(app_container).css("width", width+"px");
      });


    };

    Panel.prototype.render = function(){
      /* create panel div */
      var panel = $("<div>").addClass('slider_panel');
      var app_group = $("<div>").addClass("app_group");
      panel.append(app_group);
      panel.appendTo(this.parent.$els.slider_div);
      this.$els.panel = panel;
      this.$els.app_group = app_group;

      /* generate each app */
      for(var x=this.data.app_data_start;
        x<this.data.app_data_end; x++){

        var app_data = this.parent.data.apps_data[x];
        var app_container = $("<div>").addClass("app_container").attr('draggable','true');
        /* set app size factor */
        if(app_data.size === 1)
          app_container.addClass("app_1");
        else if(app_data.size === 2)
          app_container.addClass("app_2");
        else if(app_data.size === 3)
          app_container.addClass("app_3");

        app_group.append(app_container);

        /* inject app script */
        // app_container.append($("<div>").html(app_data.id));
        // app_container.append(temporary_app_generator);
        // app_container.append();
        app_content_loader(app_data.id, app_container);


      }

      /* insert clearfix */
      app_group.append($("<div>").addClass('clearfix'));
      this.$els.apps = $(".app_container");

      // /* init sizes */
      window.setTimeout(function(){
        this.fix_size();
      }.bind(this), 0);


    };

    function app_content_loader(app_id, $app_container){
      /* get package.json */
      console.log("app_id: "+ app_id);
      var app_location = "./newtab_apps/"+app_id+"/";

      // $app_container.load(app_location + "index.html", function(data){
      //   console.log(typeof(data));
      // });

      $.getJSON(app_location+"package.json")
      .done(function(json){
        display_logo(json, $app_container, app_location);
        display_title(json, $app_container);
        display_list(json, $app_container, app_location);
      })
      .fail(function(e){
        console.log("not found");
        $app_container.append("not found");
      });

    }


    function display_title(json, $app_container){
        $app_container.append(
          $('<span class="app_title">').html(json.name)
        );
    }

    function display_logo(json, $app_container, app_location){
        var logo_loc = app_location + (json.logo || "logo.png");
        $app_container.append(
          $('<img class="app_logo">').attr('src', logo_loc)
        );
    }

    function display_list(json, $app_container, app_location){
        var ul = $('<ul class="app_list">').appendTo($app_container);
        $.getJSON(app_location + "app.json")
        .done(function(list){
          $(list).each(function(i, item){
            var li = $('<li class="app_list_item">').appendTo(ul);
            var link = $('<a>').attr('href',item.url).appendTo(li);

            link
            .append(
              $('<img>').attr('src', app_location+item.image)
            )
            .append(
              $('<div class="list_item_text">')
              .append(
                $('<div class="app_item_text1">').html(item.text1)
              )
              .append(
                $('<div class="app_item_text2">').html(item.text2)
              )

            )
            .append($('<div class="clearfix">'));
          });
        })
        .fail(function(){
          console.log("could not load list");
        });
    }

    function temporary_app_generator(){
      var app = $('<div class="app">');
      var ul = $('<ul class="app_list">').appendTo(app);
      // for(var x=0; x<50; x++){
      //   var li = $('<li class="app_list_item">').appendTo(ul);
      //   var text = 'abcde fghi jklmnop qrstu vwxyz abcde fghi jklmnop qrstu vwxyz abcde fghi jklmnop qrstu vwxyz abcde fghi jklmnop qrstu vwxyz'
      //   li.html(text);
      // }

      return app;
    }

    /* export */
    window.Panel = Panel;

})();