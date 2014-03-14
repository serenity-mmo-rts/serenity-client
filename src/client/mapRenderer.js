// loading layers
var Map = function initLayers(mapData,map_container) {

	// compose EaselJS tileset from image (fixed 64x64 now, but can be parametized)
	var imageData = {
		images : [ tileset ],
		frames : {
			width : 64,//in pixel
			height :64//in pixel
		}
	};
	// create spritesheet
	var tilesetSheet = new createjs.SpriteSheet(imageData);
	
	// loading layer 1 and 2
	for (var idx = 0; idx < mapData.layers.length; idx++) {
		var layerData = mapData.layers[idx];
		initLayer(layerData, tilesetSheet, mapData.tilewidth, mapData.tileheight);
	}


// drawing layer data
	function initLayer(layerData, tilesetSheet, tilewidth, tileheight) {
		for ( var y = 0; y < layerData.height; y++) {
			for ( var x = 0; x < layerData.width; x++) {
				// create a new Bitmap for each cell
				var cellBitmap = new createjs.BitmapAnimation(tilesetSheet);			
				// layer data has single dimension array
				var idx = x + y * layerData.width;
				// tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
				cellBitmap.gotoAndStop(layerData.data[idx] - 1);
				// isometrix tile positioning based on X Y order from Tiled
				cellBitmap.x = x * tilewidth/2 - y * tilewidth/2 -32; // center X
				cellBitmap.y = y * tileheight/2 + x * tileheight/2 -32 - 1440;  // center Y
				// add bitmap to container
				map_container.addChild(cellBitmap);
				
			}
		}		
	}







}
