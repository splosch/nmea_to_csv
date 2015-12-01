/*
 * Drawing a cube on the boundaries of given data
 */

define(["three", "stage", "data", "helper"], function(THREE, stage, data, helper) {
  "use strict";

  return {
      material : {
        color: 0x000000,
        lineWidth: 1
      },

      points : [],

      connectedEdges : [
        [4, 5],[4, 6],[5, 7],[6, 7], // top edges
        [0, 1],[0, 2],[1, 3],[2, 3], // bottom edges
        [0, 4],[1, 5],[2, 6],[3, 7]  // side edges
      ],

      setPointsFromData : function () {
        this.points = [
          // top layer points
          helper.vector3d(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.max.z)),
          helper.vector3d(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.max.z)),
          helper.vector3d(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.max.z)),
          helper.vector3d(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.max.z)),
          // bottom layer points
          helper.vector3d(data.xScale(data.min.x), data.yScale(data.min.y), data.zScale(data.min.z)),
          helper.vector3d(data.xScale(data.min.x), data.yScale(data.max.y), data.zScale(data.min.z)),
          helper.vector3d(data.xScale(data.max.x), data.yScale(data.min.y), data.zScale(data.min.z)),
          helper.vector3d(data.xScale(data.max.x), data.yScale(data.max.y), data.zScale(data.min.z))
        ];
      },

      createGeometry : function() {
        var geometry = new THREE.Geometry();

        this.connectedEdges.forEach(function(connection){
          var start = connection[0],
              end   = connection[1];
          geometry.vertices.push(this.points[start], this.points[end]);
        }.bind(this));

        return geometry;
      },

      renderCubeLabels : function () {
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
          var text = helper.text2d(label.name),
          value= helper.text2d(data.format(label.value));

          text.position.x = value.position.x = label.x;
          text.position.y = label.y;
          text.position.z = value.position.z = label.z;

          value.position.y = label.y - offset;

          stage.scatterPlot.add(text);
          stage.scatterPlot.add(value);
        }

        labels.forEach(renderLabel);
      },

      draw : function () {
        var material = new THREE.LineBasicMaterial(this.material),
        cubeBorder;

        this.setPointsFromData();
        cubeBorder = new THREE.Line(this.createGeometry(), material);

        cubeBorder.type = THREE.Lines;

        // draw cubeLabels
        this.renderCubeLabels();
        // draw the object elements
        return cubeBorder;
      }
    };
  }
);