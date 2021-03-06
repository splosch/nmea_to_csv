define(["D3"], function(D3) {
  "use strict";

  return {
    format     : D3.format("+.3f"),
    unfiltered : [],
    min : {},
    max : {},
    highlight: [0.2, 0.3], // highlight defines an area whch should be marked [start, end], values are float between 0..1

      // retrieving min and max values for each dimension array
      // TODO: make this dynamic based on data provided
      setBoundaries : function () {
        var getBoundariesFor = function(entity){
          return D3.extent(this.unfiltered, function (d) {return d[entity];});
        }.bind(this),
        xExent = getBoundariesFor("x"),
        yExent = getBoundariesFor("y"),
        zExent = getBoundariesFor("z"),
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


      setRange : function (range) {
        if (range && range[1]) {
          var absRange = range[1] - range[0];
          if (typeof absRange === "number" && absRange > 0 && absRange < 1) {
            this.highlight = range;
          }
        }
      },

      setScale : function() {
        this.xScale = D3.scale.linear().domain([this.min.x, this.max.x]).range([-50,50]);
        this.yScale = D3.scale.linear().domain([this.min.y, this.max.y]).range([-50,50]);
        this.zScale = D3.scale.linear().domain([this.min.z, this.max.z]).range([-50,50]);
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
  }
);
