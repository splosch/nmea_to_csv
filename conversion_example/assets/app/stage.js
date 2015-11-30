define(["three"], function(THREE) {
  "use strict";

  return {
    stageId: "fullPlott",
    width  : 960,
    height : 700,
    parentElement : document.body,
    camera : undefined,
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
      this.camera.position.x = 0;
      this.camera.position.y = 0;
    },

    setScene: function() {
      this.scene.add(this.scatterPlot);
      this.scatterPlot.rotation.y = 0;
    },

    render: function() {
      this.renderer.render(this.scene, this.camera);
    },

    listenToUserInteraction: function(container) {
      this.paused = false;
      this.down   = false;
      this.last   = new Date().getTime();
      this.sx = 0;
      this.sy = 0;

      container.onmousedown = function(event) {
        this.down = true;
        this.sx = event.clientX;
        this.sy = event.clientY;
      }.bind(this);

      container.onmouseup = function() {
        this.down = false;
      }.bind(this);

      container.onmousemove = function(event) {
        if (this.down) {
          var dx = event.clientX - this.sx,
              dy = event.clientY - this.sy;

          this.scatterPlot.rotation.y += dx * 0.01;
          this.scatterPlot.rotation.x += dy * 0.01;
          //this.camera.position.y += dy;
          this.sx += dx;
          this.sy += dy;

          this.render();
        }
      }.bind(this);
    },

    init: function(parentElement) {
      var container = $(this.stageId)[0] || window;

      if (parentElement) {
        this.parentElement = parentElement;
      }

      this.setRenderer();
      this.setCamera();
      this.setScene();
      this.listenToUserInteraction(container);
    }
  };
});
