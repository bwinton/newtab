/**
 * The object that controls the sliding frames
 */


;(function(){

  /* define the object */
  var Slider = function(){

    this.init();

    /*
    DATA
     */
    
    this.panels = 3;
    this.current_panel = 0;
    /* number of pixels the slider div is currently shifted by */
    this.current_shift = 0;

    /* 
    EVENTS
    */
   
    /* window resize */
    this.$els.window.resize(function() {
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
    this.current_panel--;
    this.do_shift();

    /* manage buttons */
    this.$els.next_button.show();
    if(this.current_panel === 0) this.$els.prev_button.hide();
  };

  Slider.prototype.next = function(){
    // alert("next");
    this.current_panel++;
    this.do_shift();

    /* manage buttons */
    this.$els.prev_button.show();
    if(this.current_panel === this.panels - 1) this.$els.next_button.hide();
  };

  /* looks at the current shift amount and updates
  the css to reflect this */
  Slider.prototype.do_shift = function(){
    this.current_shift = this.current_panel * this.$els.window.width();
    if (this.current_shift < 0) this.current_shift = 0;
    this.$els.slider_div.css({
      // 'transform': "translate3d(-"+this.current_shift+"px,0,0)"
      'transform': "translate3d(-"+this.current_shift+"px,0,0)"
    });
  }

  /*
  this fixes the size of each panel to be exactly
  the size of the browser window
   */
  Slider.prototype.fix_size = function(){
    var height = this.$els.window.height() - this.$els.header.height() - this.$els.footer.height();
    var width = this.$els.window.width();
    
    /* fix height */
    this.$els.slider_div.css("height", height+"px");
    /* fix width of each panel */
    this.$els.panels.css("width", width+"px");
  
    /* fix shift */
    this.do_shift();
  };


  /* export */
  window.Slider = Slider;

})();