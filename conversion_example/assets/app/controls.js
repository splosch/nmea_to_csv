define(["jQuery"], function($) {
  "use strict";

  var base = window;

  return {

    rangeSlider : {
      startSliderSel : "#data_range_start",
      endSliderSel   : "#data_range_end",
      start       : 0,
      end         : 1,

      renderSliders : function() {
        var startSlider = $("<input id='"+this.startSliderSel+"'type='range' min='0' max='1' step='0.01'>"),
            endSlider   = $("<input id='"+this.endSliderSel+"'type='range' min='0' max='1' step='0.01'>");

        $(base).append(startSlider);
        $(base).append(endSlider);
      },

      bindEventHandlers : function(sliderSelector){
        // for simplicity, if one range slider receives a change
        // read and store both slder values

        $(base).on("change", sliderSelector,  function(event) {
          this.start = this.startSliderSel.val();
          this.end   = this.endSliderSel.val();

          // on every change populate new range to update the dataset
          $(this).trigger("data.updateHighlightRange", { "range" : [this.start, this.end] });
        }, false);
      },

      init : function () {
        this.renderSliders();
        this.bindEventHandlers(this.startSlider + ", " + this.endSlider);
      }
    }
  };
});


