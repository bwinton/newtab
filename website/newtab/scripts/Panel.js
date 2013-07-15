;(function(){
    /* start and end (inclusive-exclusive) are
    incices into the NewTabs array of app_data */
    var Panel = function(Slider, $panel_div, apps){

      this.$els = {
        panel_div: $panel_div,
        app_group: $panel_div.find('.app_group'),
        window: $(window)
      };
      this.parent = Slider;
      this.data = {
        apps: apps
      };

      /* init */
      this.launch_apps();

    };

    /* 
    Main Code
    */
    Panel.prototype = {

      /*
      Primary Functions
       */
      launch_apps: function(){
        $.each(this.data.apps, function(i, app_data){
          console.log('app data');
          console.log(app_data);
          if(!app_data.valid){
            alert(app_data.id + ' failed!');
            return;
          }
          /* create div for app */
          $("#templates .app_wrapper").render({
            app_title: app_data.id,
            app_container: function(container){
              $.each(app_data.contents, function(i, item){
                /* render each line */
                $(container).append(
                  $("#templates .app_line").render(item)
                )
              })
            }
          })
          .addClass("app_"+app_data.size)
          .appendTo(this.$els.app_group);
          /* get data to load into the app */
        }.bind(this));


      },
      
      /*
      Secondary Functions
       */

      
      /*
      Helper Functions
       */

    };

    /* 
    Helpers
    */


    function app_content_loader(app_id, $app_wrapper){
      /* get package.json */
      console.log("app_id: "+ app_id);
      var app_location = "./newtab_apps/"+app_id+"/";

      // $app_wrapper.load(app_location + "index.html", function(data){
      //   console.log(typeof(data));
      // });

      $.getJSON(app_location+"package.json")
      .done(function(json){
        display_logo(json, $app_wrapper, app_location);
        display_title(json, $app_wrapper);
        display_list(json, $app_wrapper, app_location);
      })
      .fail(function(e){
        console.log("not found");
        $app_wrapper.append("not found");
      });

    }


    function display_title(json, $app_wrapper){
        $app_wrapper.append(
          $('<span class="app_title">').html(json.name)
        );
    }

    function display_logo(json, $app_wrapper, app_location){
        var logo_loc = app_location + (json.logo || "logo.png");
        $app_wrapper.append(
          $('<img class="app_logo">').attr('src', logo_loc)
        );
    }

    function display_list(json, $app_wrapper, app_location){
        var ul = $('<ul class="app_list">').appendTo($app_wrapper);
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



    /* export */
    window.Panel = Panel;

})();