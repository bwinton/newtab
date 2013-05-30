;(function(){
    var Panel = function($panel){

      this.$els = {};

      this.data = {};
      this.init($panel);

      /* 
      EVENTS
      */

      /* window resize */
      this.$els.window.resize(function(e) {
        this.fix_size();
      }.bind(this));

    };

    Panel.prototype.init = function($panel){
      /* find elements */
      this.$els = {
        panel: $panel,
        app_group: $panel.find(".app_group"),
        apps: $panel.find(".app_container"),
        window: $(window)
      };

      /* init sizes */
      this.fix_size();

    };

    Panel.prototype.fix_size = function(){
      var panel_height = this.$els.panel.height();
      var panel_width = this.$els.panel.width();
      var apps_on_panel = this.$els.apps.length;
      var denom;

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

    /* export */
    window.Panel = Panel;

})();