/*
 * Initial version taken from Phil Pedruco & refactored
 * http://bl.ocks.org/phil-pedruco/raw/9852362/
 */


/*
 * Generic Helpers
 * Helper methods, only bound to vanilla JS
 */

// from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) { //TODO rewrite with vector output
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


/*
 * Canvas Helpers
 */

/* createTextCanvas
 * Creates a Canvas Object from given Text
 *
 * @required  text      "Hello World"
 * @optional  options   {color: 'red', font: 'Arial', size: 14}   font style
 * @return    canvas    Canvas Object with text and style given
 */
// TODO check THREE D JS to generate text
// having itenerated wit canvas and than rendered within the Scene seems lke an overkill
function createTextCanvas(text, options) {
  if (!text) return;

  // TODO add merge functionality for options together with defaults
  var textStyle = {
        color: 'black',
        font : 'Arial',
        size : 16
      },
      canvas        = document.createElement('canvas'),
      canvasContext = canvas.getContext('2d');

  // set text properties before measuring the dimensions of added text
  // otherwise styles will not be considdered
  canvasContext.font      = (textStyle.size + 'px ') + textStyle.font;
  canvasContext.fillStyle = textStyle.color;

  canvas.width  = canvasContext.measureText(text).width;
  canvas.height = Math.ceil(textStyle.size);

  canvasContext.fillText(text, 0, Math.ceil(textStyle.size * 0.8));

  return canvas;
}

/*
 * THREE D JS Helpers
 */

/*
 * Create a 2D Text-Mesh from a canvas object
 */
function createText2D(text, textStyle, segW, segH) {
  var canvas = createTextCanvas(text, textStyle);
  var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
  var tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  var planeMat = new THREE.MeshBasicMaterial({
    map: tex,
    color: 0xffffff,
    transparent: true
  });
  var mesh = new THREE.Mesh(plane, planeMat);
  mesh.scale.set(0.5, 0.5, 0.5);
  mesh.doubleSided = true;
  return mesh;
}

function v3d(x, y, z) {
  return new THREE.Vector3(x, y, z);
}



var stage = {
  width  : 960,
  height : 700,
  parentElement : document.body,
  camera : false,
  scene  : new THREE.Scene(),
  scatterPlot : new THREE.Object3D(),
  renderer    : new THREE.WebGLRenderer({ antialias: true }),

  setRenderer : function () {
    this.renderer.setSize(this.width, this.height);
    this.parentElement.appendChild(this.renderer.domElement);
    this.renderer.setClearColorHex(0xEEEEEE, 1.0);
  },

  setCamera: function () {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 10000);
    this.camera.position.z = 200;
    this.camera.position.x = -100;
    this.camera.position.y = 100;
  },

  setScene: function() {
    this.scene.add(this.scatterPlot);
    this.scatterPlot.rotation.y = 0;
  },

  render: function() {
    this.renderer.render(this.scene, this.camera);
  },

  listenToUserInteraction: function(window) {
    this.paused = false;
    this.down   = false;
    this.last   = new Date().getTime();
    this.sx = 0;
    this.sy = 0;
    this.animating = true;

    window.onmousedown = function(event) {
      this.down = true;
      this.sx = event.clientX;
      this.sy = event.clientY;
    }.bind(this);

    window.onmouseup = function() {
      this.down = false;
    }.bind(this);

    window.onmousemove = function(event) {
      if (this.down) {
        var dx = event.clientX - this.sx,
            dy = event.clientY - this.sy;

        this.scatterPlot.rotation.y += dx * 0.01;
        this.camera.position.y += dy;
        this.sx += dx;
        this.sy += dy;

        this.render();
      }
    }.bind(this);
  },

  init: function(parentElement, window) {
    if (parentElement) {
      this.parentElement = parentElement;
    }

    this.setRenderer();
    this.setCamera();
    this.setScene();
    this.listenToUserInteraction(window);
  }
};



var data = {
  format     : d3.format("+.3f"),
  unfiltered : [],
  min : {},
  max : {},

    // retrieving min and max values for each dimension array
    // TODO: make this dynamic based on data provided
    setBoundaries : function () {
      var getBoundariesFor = function(entity){
        return d3.extent(this.unfiltered, function (d) {return d[entity];});
      }.bind(this),
      xExent = getBoundariesFor("x"),
      yExent = getBoundariesFor("y"),
      zExent = getBoundariesFor("z");
      dataExent = getBoundariesFor("data");

      this.min.x = xExent[0];
      this.max.x = xExent[1];
      this.min.y = yExent[0];
      this.max.y = yExent[1];
      this.min.z = zExent[0];
      this.max.z = zExent[1];
      this.min.data = dataExent[0];
      this.max.data = dataExent[1];
    },

    setScale : function() {
      this.xScale = d3.scale.linear().domain([this.min.x, this.max.x]).range([-50,50]);
      this.yScale = d3.scale.linear().domain([this.min.y, this.max.y]).range([-50,50]);
      this.zScale = d3.scale.linear().domain([this.min.z, this.max.z]).range([-50,50]);
    },

    onCSVFileLoad : function (callback, rows) {
      rows.forEach(function (row, index) {
        this.unfiltered.push({
          x: +row.x,
          y: +row.y,
          z: +row.z,
          data: +row.data
        });
      }.bind(this));

      this.setBoundaries();
      this.setScale();

      if (callback && typeof callback === "function") {
        callback(this);
      }
    }
  };

  function loadCSV(filename, data, callback) {
    // fetch and parse a csv file and return a array of objects e.g.:
    // [{ x : 123, y : 234, z : 345, data : "ABC" }, {...}, ...]
    d3.csv(filename, data.onCSVFileLoad.bind(data, callback));
  }

/*
 * Drawing a cube on the boundaries of given data
 */
var obj_boundaryCube = {
  material : {
    color: 0x000000,
    lineWidth: 1
  },

  points : [],

  lines : [
    [4, 5],[4, 6],[5, 7],[6, 7], // top edges
    [0, 1],[0, 2],[1, 3],[2, 3], // bottom edges
    [0, 4],[1, 5],[2, 6],[3, 7]  // side edges
    ],

  setPointsFromData : function (data) {
    this.points = [
      // top layer points
      v3d(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.max.z)),
      v3d(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.max.z)),
      v3d(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.max.z)),
      v3d(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.max.z)),
      // bottom layer points
      v3d(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.min.z)),
      v3d(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.min.z)),
      v3d(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.min.z)),
      v3d(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.min.z))
    ];
  },

  createGeometry : function() {
    var geometry = new THREE.Geometry();

    this.lines.forEach(function(line){
      var start = line[0],
      end   = line[1];
      geometry.vertices.push(this.points[start], this.points[end]);
    }.bind(this));

    return geometry;
  },

  buildWith : function (data) {
    var material = new THREE.LineBasicMaterial(this.material),
    cubeBorder;

    this.setPointsFromData(data);
    cubeBorder = new THREE.Line(this.createGeometry(), material);

    cubeBorder.type = THREE.Lines;

    // draw the object elements
    return cubeBorder;
  }
};


renderCubeLabels = function (data, stage) {
  var offset = 10,
      labels = [
        { name: "-X", value: data.min.x, x: data.xScale(data.min.x) - offset, y: 0, z: null },
        { name: "X",  value: data.max.x, x: data.xScale(data.max.x) + offset, y: 0, z: null },
        { name: "-Y", value: data.min.y, x: null, y: data.yScale(data.min.y) - offset, z: null },
        { name: "Y",  value: data.max.y, x: null, y: data.yScale(data.max.y) + offset, z: null },
        { name: "-Z", value: data.min.z, x: null, y: 0, z: data.zScale(data.min.z) - offset },
        { name: "Z",  value: data.max.z, x: null, y: 0, z: data.zScale(data.max.z) + offset }
      ];

  function renderLabel (label) {
    var text = createText2D(label.name),
    value= createText2D(data.format(label.value));

    text.position.x = value.position.x = label.x;
    text.position.y = label.y;
    text.position.z = value.position.z = label.z;

    value.position.y = label.y - offset;

    stage.scatterPlot.add(text);
    stage.scatterPlot.add(value);
  }

  labels.forEach(renderLabel);
};

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
    //console.log(pointGeo.vertices);
    //pointGeo.vertices[i].angle = Math.atan2(z, x);
    //pointGeo.vertices[i].radius = Math.sqrt(x * x + z * z);
    //pointGeo.vertices[i].speed = (z / 100) * (x / 100);
    pointGeo.colors.push(new THREE.Color().setRGB(speed, speed, speed));

  }
  var points = new THREE.ParticleSystem(pointGeo, mat);

  return points;
}


loadCSV("../conversion_example/example_biking_wgs84_xyz.csv", data, function(data) {
  stage.init(document.body, window);

  stage.scatterPlot.add(obj_boundaryCube.buildWith(data));
  renderCubeLabels(data, stage);
  stage.scatterPlot.add(pointsFromData(data));

  stage.render();
});