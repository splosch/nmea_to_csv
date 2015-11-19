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
define(["three"], function(THREE) {
  "use strict";

  return {
    /*
   * Create a 2D Text-Mesh from a canvas object
   */
    text2d: function (text, textStyle, segW, segH) {
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
    },

    vector3d : function (x, y, z) {
      return new THREE.Vector3(x, y, z);
    }
  };
});