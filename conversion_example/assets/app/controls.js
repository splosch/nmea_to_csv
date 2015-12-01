define(["jQuery"], function($) {
  "use strict";

  var base = window.document.body;

  return {

    rangeSlider : {
      startSliderSel : "data_range_start",
      endSliderSel   : "data_range_end",
      start       : 0,
      end         : 1,

      renderSliders : function() {
        var startSlider = $("<input id='"+this.startSliderSel+"'type='range' min='0' max='1' step='0.01'>"),
            endSlider   = $("<input id='"+this.endSliderSel+"'type='range' min='0' max='1' step='0.01'>");

        $(base).append(startSlider);
        $(base).append(endSlider);
      },

      bindEventHandlers : function(){
        // for simplicity, if one range slider receives a change
        // read and store both slder values

        $(window.document.body).on("change", function(event) {
          this.start = $(base).find("#"+this.startSliderSel).val();
          this.end   = $(base).find("#"+this.endSliderSel).val();

          // on every change populate new range to update the dataset
          $(base).trigger("data.updateHighlightRange", { "start" : this.start, "end" : this.end });
        }.bind(this));
      },

      init : function () {
        this.renderSliders();
        this.bindEventHandlers();
      }
    }
  };
});


