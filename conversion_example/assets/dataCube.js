/*
 * Initial version taken from Phil Pedruco & refactored
 * http://bl.ocks.org/phil-pedruco/raw/9852362/
 */

function createTextCanvas(text, color, font, size) {
    size = size || 16;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var fontStr = (size + 'px ') + (font || 'Arial');
    ctx.font = fontStr;
    var w = ctx.measureText(text).width;
    var h = Math.ceil(size);
    canvas.width = w;
    canvas.height = h;
    ctx.font = fontStr;
    ctx.fillStyle = color || 'black';
    ctx.fillText(text, 0, Math.ceil(size * 0.8));
    return canvas;
}

function createText2D(text, color, font, size, segW, segH) {
    var canvas = createTextCanvas(text, color, font, size);
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

// from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) { //TODO rewrite with vector output
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var renderer = new THREE.WebGLRenderer({
    antialias: true
});
var w = 960;
var h = 700;
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

renderer.setClearColorHex(0xEEEEEE, 1.0);

var camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
camera.position.z = 200;
camera.position.x = -100;
camera.position.y = 100;

var scene = new THREE.Scene();

var scatterPlot = new THREE.Object3D();
scene.add(scatterPlot);

scatterPlot.rotation.y = 0;

function v(x, y, z) {
    return new THREE.Vector3(x, y, z);
}

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
            v(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.max.z)),
            v(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.max.z)),
            v(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.max.z)),
            v(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.max.z)),
            // bottom layer points
            v(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.min.z)),
            v(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.min.z)),
            v(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.min.z)),
            v(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.min.z))
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
        scatterPlot.add(cubeBorder);
    }
};

loadCSV("../conversion_example/example_biking_wgs84_xyz.csv", data, function(data) {
    // initialize the object
    obj_boundaryCube.buildWith(data);
    renderCubeLabels(data);
    renderCSVDataPlot(data);
});

renderCubeLabels = function (data) {
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

        scatterPlot.add(text);
        scatterPlot.add(value);
    }

    labels.forEach(renderLabel);
};

renderCSVDataPlot = function (data) {
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
    scatterPlot.add(points);

    renderer.render(scene, camera);
    var paused = false;
    var last = new Date().getTime();
    var down = false;
    var sx = 0,
        sy = 0;

    window.onmousedown = function(ev) {
        down = true;
        sx = ev.clientX;
        sy = ev.clientY;
    };
    window.onmouseup = function() {
        down = false;
    };
    window.onmousemove = function(ev) {
        if (down) {
            var dx = ev.clientX - sx;
            var dy = ev.clientY - sy;
            scatterPlot.rotation.y += dx * 0.01;
            camera.position.y += dy;
            sx += dx;
            sy += dy;
        }
    }
    var animating = true;
    window.ondblclick = function() {
        animating = !animating;
    };

    function animate(t) {
        if (!paused) {
            last = t;
            if (animating) {
                var v = pointGeo.vertices;
                for (var i = 0; i < v.length; i++) {
                    var u = v[i];
                    //console.log(u)
                    u.angle += u.speed * 0.01;
                    u.x = Math.cos(u.angle) * u.radius;
                    u.z = Math.sin(u.angle) * u.radius;
                }
                pointGeo.__dirtyVertices = true;
            }
            renderer.clear();
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        }
        window.requestAnimationFrame(animate, renderer.domElement);
    };
    animate(new Date().getTime());
    onmessage = function(ev) {
        paused = (ev.data == 'pause');
    };
};