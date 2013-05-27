/**
 * The object that controls the sliding frames
 */


;(function(){
  
  /* define the object */
  var Slider = function(){
    var slider_el;
  };

  Slider.prototype.prev = function(){
    alert("prev");
  };

  Slider.prototype.next = function(){
    alert("next");
  };


  /* export */
  window.Slider = Slider;

})();