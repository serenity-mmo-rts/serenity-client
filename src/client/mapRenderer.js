// loading layers
var Map = function initLayers(mapData,map_container) {

    var self = this;
    this.mapData = mapData;
    this.map_container = map_container;

    this.tileset = new Image();
    this.tileset.src = this.mapData.tilesets[0].image;
    this.tileset.onLoad = this.createMap();
};


Map.prototype.createMap = function() {
    var self = this;
    this.imageData = {
        images : [ this.tileset ],
        frames : {
            width : 64,//in pixel
            height :64//in pixel
        }
    };
    // create spritesheet
    this.tilesetSheet = new createjs.SpriteSheet(this.imageData);

    // loading layer 1 and 2
    for (var idx = 0; idx < this.mapData.layers.length; idx++) {
        this.layerData = this.mapData.layers[idx];
        this.initLayer();

    }
};


// drawing layer data
Map.prototype.initLayer = function() {
    for ( var y = 0; y < this.layerData.height; y++) {
        for ( var x = 0; x < this.layerData.width; x++) {
            // create a new Bitmap for each cell
            var cellBitmap = new createjs.BitmapAnimation(this.tilesetSheet);
            // layer data has single dimension array
            var idx = x + y * this.layerData.width;
            // tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
            cellBitmap.gotoAndStop(this.layerData.data[idx] - 1);
            // isometrix tile positioning based on X Y order from Tiled
            cellBitmap.x = x * this.mapData.tilewidth/2 - y * this.mapData.tilewidth/2 -32; // center X
            cellBitmap.y = y * this.mapData.tileheight/2 + x * this.mapData.tileheight/2 -32 - 1440;  // center Y
            // add bitmap to container
            this.map_container.addChild(cellBitmap);

        }
    }
};



