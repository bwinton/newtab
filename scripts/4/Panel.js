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
      
      /* app_group */
      this.$els.app_group.css("height", panel_height-50+"px");

      /* apps */
      this.$els.apps.css("height", panel_height-100+"px");
    };

    /* export */
    window.Panel = Panel;

})();