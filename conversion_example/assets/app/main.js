require(["D3", "stage", "data", "cube", "helper", "three", "controls"], function(D3, stage, data, cube, helper, THREE, controls) {
  function pointsFromData (data, range) {
    var p = {},
        pointsCount = data.unfiltered.length,
        pointGeo   = new THREE.Geometry(),
        mat        = new THREE.ParticleBasicMaterial({
                        vertexColors: true,
                        size: 10
                      }),
        iStart  = Math.floor((range[0] || 0) * pointsCount),
        iEnd    = Math.floor((range[1] || 1) * pointsCount);

    for (var i = 0; i < pointsCount; i ++) {
      var inRange = (i >= iStart) && (i <= iEnd);

      p = {
        x : data.xScale(data.unfiltered[i].x),
        y : data.yScale(data.unfiltered[i].y),
        z : data.zScale(data.unfiltered[i].z),
        speed : data.unfiltered[i].data
      };

      p.color = new THREE.Color().setRGB(inRange ? 1 : p.speed, p.speed, p.speed);

      pointGeo.vertices.push(helper.vector3d(p.x, p.y, p.z));
      pointGeo.colors.push(p.color);
    }

    return new THREE.ParticleSystem(pointGeo, mat);
  }


  var base = window.document.body;

  stage.init(document.body, window);
  data.init("conversion_example/example_biking_wgs84_xyz.csv");
  controls.rangeSlider.init();

  // main.js dispatches events to force decoupling of individual modules
  $(window.document.body).on("data.updated", function(){

    // TBD avoid adding scatterplot again (its just added on top of the old ... instead replace)
    stage.scatterPlot.add(cube.buildWith(data));
    stage.scatterPlot.add(pointsFromData(data, data.highlight));
    stage.render();
  }.bind(this, stage));

});


