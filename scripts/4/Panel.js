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
      this.$els.app_group.css("height", panel_height-50+"px");

      /* apps */
      this.$els.apps.css("height", panel_height-100+"px");
      this.$els.apps.each(function(i,app_container){
        var $app_container = $(app_container);
        var width = calc_app_width($app_container);
        $(app_container).css("width", width+"px");
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
        var app_container = $("<div>").addClass("app_container");
        /* set app size factor */
        if(app_data.size === 1)
          app_container.addClass("app_1");
        else if(app_data.size === 2)
          app_container.addClass("app_2");
        else if(app_data.size === 3)
          app_container.addClass("app_3");

        app_group.append(app_container);

        /* inject app script */
        app_container.append($("<div>").html(app_data.id));

      }

      this.$els.apps = $(".app_container");

      // /* init sizes */
      window.setTimeout(function(){
        this.fix_size();
      }.bind(this), 0);


    };

    /* export */
    window.Panel = Panel;

})();