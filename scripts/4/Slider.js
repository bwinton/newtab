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
    };

    this.parent = NewTab;
    // this.$drag_src;
    this.data = {
      current_panel: 0, /* the number of the currently view panel */
      current_shift: 0, /* the current shift amount in positive pixels */
      apps_data: apps_data, /* JSONic data about the apps on the slider */
      transition_on: false
    };

    this.init();

    /* 
    EVENTS
    */

    /* window resize */
    this.$els.window.resize(function(e) {
      this.remove_transition();
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
      /* only slide if not in search box */
      switch(keyCode){
        case 39:
          if($(e.target).attr("id") !== "searchText"){
            this.next();
            e.preventDefault();
          }
          break;
        case 37:
          if($(e.target).attr("id") !== "searchText"){
            this.prev();
            e.preventDefault();
          }
          break;
      }
    }.bind(this));

    /* handle app_container drag events */
    $(".app_container").bind("dragstart", function(e){
      $target = $(e.target);
      $target.css('opacity', '0.4');
      this.$drag_src = $target;
      e.originalEvent.dataTransfer.setData('text/html', $target.html);
    }.bind(this))

    .bind("dragover", function(e){
      if (e.preventDefault) {
        e.preventDefault();
      }

      return false;
    }.bind(this))

    .bind("dragenter", function(e){
      $(e.target).addClass('drag_over');
    }.bind(this))

    .bind("dragleave", function(e){
      $(e.target).removeClass('drag_over');
    }.bind(this))

    .bind("drop", function(e){
        // this / e.target is current target element.

        if (e.stopPropagation) {
          e.stopPropagation(); // stops the browser from redirecting.
        }

        $target = $(e.target);
        // target_html = $target.html();

        /* move container */


        move_container(this.$drag_src, $target);

        /* refind all panels */
        $.map(this.submods.panels, function(panel){
          panel.$els.apps = $(".app_container");
        });

        $(".app_container").removeClass('drag_over')
        .css('opacity', '1.0');

        // $.each(this.submods.panels, function(i, panel){
        //   panel.fix_size();
        // });

        this.$drag_src = undefined;

        return false;
    }.bind(this))

    .bind("dragend", function(e){
      $(".app_container").removeClass('drag_over')
      .css('opacity', '1.0');

    }.bind(this));

    $("#next_button").bind("dragenter", function(){
      this.next();
    }.bind(this));

    $("#prev_button").bind("dragenter", function(){
      this.prev();
    }.bind(this));



  };

  Slider.prototype = {
    init: function(){
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

    },

    prev: function(){
      if(this.data.current_panel<=0) return;
      this.data.current_panel--;

      this.add_transition();
      this.do_shift();

      /* manage buttons */
      this.$els.next_button.show();
      if(this.data.current_panel === 0) this.$els.prev_button.hide();
    },

    next: function(){
      // alert("next");
      if(this.data.current_panel >= this.submods.panels.length - 1) return;
      this.data.current_panel++;

      this.add_transition();
      this.do_shift();

      /* manage buttons */
      this.$els.prev_button.show();
      if(this.data.current_panel === this.submods.panels.length - 1) this.$els.next_button.hide();
    },

    /* looks at the current shift amount and updates
    the css to reflect this */
    do_shift: function(is_resize){
      this.data.current_shift = this.data.current_panel * $(window).innerWidth();
      var transTime;
      // if(!is_resize) transTime = 350;
      // if (true) console.log("hi");
      // if(true) this.$els.slider_div.css("transition","transform 0ms ease-in-out");
      this.$els.slider_div.css({
        "transform": "translate3d(-"+this.data.current_shift+"px,0,0)"
      });
      // if(true) this.$els.slider_div.css("transition","transform 250ms ease-in-out");
      // if(true) this.$els.slider_div.addClass("sliding_transition");
    },

    fix_size: function(){
      var height = this.$els.window.innerHeight() - this.$els.header.height() - this.$els.footer.height();
      // var width = this.$els.window.innerWidth();
      // var width = $(window).innerWidth();

      this.data.height = height;

      this.do_shift(true);
    },

    remove_transition: function(){
      // if(this.data.transition_on === false) return;

      this.data.transition_on = false;
      this.$els.slider_div.css("transition","");

    },

    add_transition: function(){
      // if(this.data.transition_on === true) return;

      this.data.transition_on = true;
      var browser = $.browser;
      if(browser.mozilla)
        this.$els.slider_div.css("transition","transform 250ms ease-in-out");
      else if(browser.chrome)
        this.$els.slider_div.css("transition","-webkit-transform 250ms ease-in-out");

    },

    /* walks through the list of apps and spawns new panels
    as neccessary and assigns apps to each panel */
    create_panels: function(apps_data){
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

    }


  };

  /*
  Helpers
   */

  function swap_$els($c1, $c2){
    var $c1_copy = $c1.clone(true, true);
    var $c2_copy = $c2.clone(true, true);

    $c2.replaceWith($c1_copy);
    $c1.replaceWith($c2_copy);

  }

  function move_container($c1, $c2){
    /* make sure theres a target */
    if(!$c2) return;

    /* if target is after source */

    if($c1.index() > $c2.index())
      $c2.before($c1.clone(true, true));
    else
      $c2.after($c1.clone(true, true));

    $c1.remove();
  }

  /* export */
  window.Slider = Slider;

})();