require(["stage", "data", "controls", "cube", "particles"], function(stage, data, controls, cube, particles) {
  var base = window.document.body;

  stage.init(document.body, window);
  data.init("conversion_example/example_biking_wgs84_xyz.csv");
  controls.rangeSlider.init();

  // main.js dispatches events to force decoupling of individual modules
  $(window.document.body).on("data.updated", function(){

    // TBD avoid adding scatterplot again (its just added on top of the old ... instead replace)
    stage.scatterPlot.add(cube.draw());
    stage.scatterPlot.add(particles.draw());
    stage.render();
  }.bind(this, stage));
});


