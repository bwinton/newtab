/**
 * The object that controls the sliding frames
 */


;(function(){

  /* define the object */
  var Slider = function(){

    /*
    DATA
     */
    
    this.panels = 3;
    this.current_panel = 0;
    /* number of pixels the slider div is currently shifted by */
    this.current_shift = 0;

    this.data = {};
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
      // console.log(e);
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
      panels: $("#slider_div").children(),
      header: $("#header"),
      footer: $("#footer"),
      window: $(window)
    };

    /* init sizes */
    this.fix_size();

  };




  Slider.prototype.prev = function(){
    // alert("prev");
    if(this.current_panel<=0) return;
    this.current_panel--;
    this.do_shift();

    /* manage buttons */
    this.$els.next_button.show();
    if(this.current_panel === 0) this.$els.prev_button.hide();
  };

  Slider.prototype.next = function(){
    // alert("next");
    if(this.current_panel >= this.panels-1) return;
    this.current_panel++;
    this.do_shift();

    /* manage buttons */
    this.$els.prev_button.show();
    if(this.current_panel === this.panels - 1) this.$els.next_button.hide();
  };

  /* looks at the current shift amount and updates
  the css to reflect this */
  Slider.prototype.do_shift = function(is_resize){
    this.current_shift = this.current_panel * this.data.width;
    // if (this.current_shift < 0) this.current_shift = 0;
    var transTime = 0;
    if(!is_resize) transTime = 150;
    this.$els.slider_div.css({
      "transform": "translate(-"+this.current_shift+"px,0)",
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
    var width = $(window).innerWidth();

    this.data.width = width;
    this.data.height = height;

    /* fix height */
    this.$els.slider_div.css("height", height+"px");
    /* fix width of each panel */
    this.$els.panels.css("width", width+"px");

    /* fix shift */
    this.do_shift(true);
  };

  /* export */
  window.Slider = Slider;

})();