function pointsFromData (data) {
  var mat = new THREE.ParticleBasicMaterial({
    vertexColors: true,
    size: 10
  });

  var pointCount = data.unfiltered.length;
  var pointGeo = new THREE.Geometry();
  for (var i = 0; i < pointCount; i ++) {
    var x = data.xScale(data.unfiltered[i].x);
    var y = data.yScale(data.unfiltered[i].y);
    var z = data.zScale(data.unfiltered[i].z);
    var speed = data.unfiltered[i].data;

    pointGeo.vertices.push(new THREE.Vector3(x, y, z));
    pointGeo.colors.push(new THREE.Color().setRGB(speed, speed, speed));
  }
  var points = new THREE.ParticleSystem(pointGeo, mat);

  return points;
}

require(["D3", "stage", "data", "cube"], function(D3, stage, data, cube) {
  function loadCSV(filename, data, callback) {
    // fetch and parse a csv file and return a array of objects e.g.:
    // [{ x : 123, y : 234, z : 345, data : "ABC" }, {...}, ...]
    D3.csv(filename, data.onCSVFileLoad.bind(data, callback));
  }

  loadCSV("../conversion_example/example_biking_wgs84_xyz.csv", data, function(positionData) {
    stage.init(document.body, window);

    stage.scatterPlot.add(cube.buildWith(positionData));
    stage.scatterPlot.add(pointsFromData(positionData));

    stage.render();
  });
});


