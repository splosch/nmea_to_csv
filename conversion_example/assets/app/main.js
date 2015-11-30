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


  function loadCSV(filename, data, callback) {
    // fetch and parse a csv file and return a array of objects e.g.:
    // [{ x : 123, y : 234, z : 345, data : "ABC" }, {...}, ...]
    D3.csv(filename, data.onCSVFileLoad.bind(data, callback));
  }

  loadCSV("conversion_example/example_biking_wgs84_xyz.csv", data, function(positionData) {
    var base = window.document.body;

    stage.init(document.body, window);

    // main.js dispatches events to force decoupling of individual modules
    $(window.document.body).on("data.updated", function(){
      stage.scatterPlot.add(cube.buildWith(positionData));
      stage.scatterPlot.add(pointsFromData(positionData, data.highlight));
      stage.render();
    }.bind(this, stage));

  });

  controls.rangeSlider.init();

});


