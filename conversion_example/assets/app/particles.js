/*
 * Drawing points onto a stage with given data
 */

define(["three", "data", "helper"], function(THREE, data, helper) {
  "use strict";

  return {
      geometry : new THREE.Geometry(),
      material : new THREE.ParticleBasicMaterial({
                   vertexColors: true,
                   size: 10
                 }),
      start    : 0,
      end      : 1,

      // TBD could be called with 'range' to limit particles to a defined section
      setHighlightRange : function (range) {
        this.start = Math.floor((range[0]) * this.particleCount);
        this.end   = Math.floor((range[1]) * this.particleCount);
      },

      // TBD could be called with 'range' to limit particles to a defined section
      draw : function () {
        var p = {};

        this.particleCount = data.unfiltered.length;
        this.setHighlightRange(data.highlight);

        for (var i = 0; i < this.particleCount; i ++) {
          var inRange = (i >= this.start) && (i <= this.end);

          p = {
            x : data.xScale(data.unfiltered[i].x),
            y : data.yScale(data.unfiltered[i].y),
            z : data.zScale(data.unfiltered[i].z),
            speed : data.unfiltered[i].data
          };

          p.color = new THREE.Color().setRGB(inRange ? 1 : p.speed, p.speed, p.speed);

          this.geometry.vertices.push(helper.vector3d(p.x, p.y, p.z));
          this.geometry.colors.push(p.color);
        }

        return new THREE.ParticleSystem(this.geometry, this.material);
      }
    };
});