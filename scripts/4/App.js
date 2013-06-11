;(function(){
    var NewTab = function(){

      this.submods = {
        panels: []
      };
      this.data = {};

      this.init();

    };

    NewTab.prototype.init = function(){
        this.submods.header = new Header();
        this.submods.footer = new Footer();

        load_apps_data(function(apps_data){
          this.submods.slider = new Slider(this, apps_data.apps);
        }.bind(this));

    };


    /* local helpers */

    function load_apps_data(cb){
      $.getJSON('./settings.json', function(data) {
        cb(data);
      });

    }

    /* run */
    $(function(){
      new NewTab();
    })

})();