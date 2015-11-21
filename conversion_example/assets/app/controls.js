(function(window){
  var controls = {
    rangeSliderStart : function(selector){
      var slider = document.querySelector(selector);

      slider.addEventListener('change', function(event) {}, false);
    }("#data_range_start"),

    rangeSliderEnd : function(selector){
      var slider = document.querySelector(selector);

      slider.addEventListener('change', function(event) {}, false);
    }("#data_range_end")
  };

  return controls;
}(window));
