/**
 * The object that controls the sliding frames
 */


;(function(){

  /* define the object */
  var Slider = function(NewTab, apps_data){

    /*
    DATA
     */
    
    // this.panels = 3;
    // this.current_panel = 0;
    /* number of pixels the slider div is currently shifted by */
    // this.current_shift = 0;

    this.submods = {
      panels: []
    }
    this.parent = NewTab;
    this.data = {
      current_panel: 0, /* the number of the currently view panel */
      current_shift: 0, /* the current shift amount in positive pixels */
      apps_data: apps_data /* JSONic data about the apps on the slider */
    };

    this.init();

    /* 
    EVENTS
    */

    /* window resize */
    this.$els.window.resize(function(e) {
      this.fix_size();
    }.bind(this));

    /* click prev button */
    this.$els.prev_button.click(function() {
      this.prev();
    }.bind(this));

    /* click next button */
    this.$els.next_button.click(function() {
      this.next();
    }.bind(this));

    this.$els.window.on("keydown", function(e){
      var keyCode = e.keyCode;
      switch(keyCode){
        case 39:
          this.next();
          e.preventDefault();
          break;
        case 37:
          this.prev();
          e.preventDefault();
          break;
      }
    }.bind(this));

  };

  Slider.prototype.init = function(){
    /* hide prev button */
    $("#prev_button").hide();

    /* find elements */
    this.$els = {
      prev_button: $("#prev_button"),
      next_button: $("#next_button"),
      slider_div: $("#slider_div"),
      header: $("#header"),
      footer: $("#footer"),
      window: $(window)
    };

    this.create_panels(this.data.apps_data);

    /* hide next button if needed */
    if(this.submods.panels.length < 2) $("#next_button").hide();

    /* init sizes */
    this.fix_size();

  };




  Slider.prototype.prev = function(){
    if(this.data.current_panel<=0) return;
    this.data.current_panel--;
    this.do_shift();

    /* manage buttons */
    this.$els.next_button.show();
    if(this.data.current_panel === 0) this.$els.prev_button.hide();
  };

  Slider.prototype.next = function(){
    // alert("next");
    if(this.data.current_panel >= this.submods.panels.length - 1) return;
    this.data.current_panel++;
    this.do_shift();

    /* manage buttons */
    this.$els.prev_button.show();
    if(this.data.current_panel === this.submods.panels.length - 1) this.$els.next_button.hide();
  };

  /* looks at the current shift amount and updates
  the css to reflect this */
  Slider.prototype.do_shift = function(is_resize){
    this.data.current_shift = this.data.current_panel * $(window).innerWidth();
    // if (this.current_shift < 0) this.current_shift = 0;
    console.log(this.data.current_shift);
    var transTime = 0;
    if(!is_resize) transTime = 150;
    this.$els.slider_div.css({
      "transform": "translate(-"+this.data.current_shift+"px,0)",
      "transition": "transform "+transTime+"ms ease-in-out"

    });
  };

  /*
  this fixes the size of each panel to be exactly
  the size of the browser window
   */
  Slider.prototype.fix_size = function(){
    var height = this.$els.window.innerHeight() - this.$els.header.height() - this.$els.footer.height();
    // var width = this.$els.window.innerWidth();
    // var width = $(window).innerWidth();

    this.data.height = height;

    /* fix height */
    this.$els.slider_div.css("height", height+"px");

    /* fix shift */
    this.do_shift(true);
  };

  // should give each panel an index into the NewTab's
  // app data as well as a reference to itself
  /* walks through the list of apps and spawns new panels
  as neccessary and assigns apps to each panel */
  Slider.prototype.create_panels = function(apps_data){
    var panel_width = 0;
    var start = 0;
    var end = 0;

    if(apps_data.length<1) return;

    $.each(apps_data, function(i, app){
      var size = app.size || 1;
      if(panel_width + size <= 3){
        /* fits on this panel */
        panel_width+=size;
        end++;
      }
      else{
        /* needs new panel */
        this.submods.panels.push(
          new Panel(this, start, end)
        );

        /* reset data */
        panel_width = size;
        start = end;
        end++;
      }

      }.bind(this));

      this.submods.panels.push(
        new Panel(this, start, end)
      );

  };

  /* calculates the number of panels needed to
  hold all apps */
  // function calc_numb_of_panels_needed(app_data){
  //   var width_total = 0;
  //   $.each(app_data, function(i, app){
  //     width_total+=app.size;
  //   });
  //   return (width_total+2) / 3;
  // }

  /* export */
  window.Slider = Slider;

})();