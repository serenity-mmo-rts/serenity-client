var TerrainRenderer = function (mapRenderer, resMap, mapId, resContainer, type) {

    this.mapId = mapId;
    this.mapRenderer = mapRenderer;
    this.map = resMap;
    this.container = resContainer;

    this.type = type;

    this.mapData = game.layers.get(this.mapId);
    this.mapType = game.layerTypes.get(this.mapData.mapTypeId);

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;

    this.debugTiles = false;
    this.debugLog = false;

    this.bmpResolutionToPixelScaling = 2;  // this variable can be increased to reduce cpu strain
    this.numTilesOnScreen = 2; // this variable controls the number of tiles

    this.bmpToRenderScaling = this.bmpResolutionToPixelScaling / this.mapRenderer.mapContainer.zoom;
    this.bmpResolutionX = Math.ceil(window.innerWidth / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpResolutionY = Math.ceil(window.innerHeight / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpRenderSizeX = this.bmpResolutionX * this.bmpToRenderScaling;
    this.bmpRenderSizeY = this.bmpResolutionY * this.bmpToRenderScaling;

    // create easeljs container that contains all tiles in all zoom levels:
    this.terrainContainer = new createjs.Container();

    // tiles of different zoom levels are stored in their corresponding containers:
    this.zoomLevelContainers = [];
    /*
    suggestion:
     this.zoomLevelContainers[0] contains  1x1  map tiles, each having a resolution 512x256
     this.zoomLevelContainers[1] contains  2x2  map tiles, each having a resolution 512x256
     this.zoomLevelContainers[2] contains  4x4  map tiles, each having a resolution 512x256
     this.zoomLevelContainers[3] contains  8x8  map tiles, each having a resolution 512x256
     this.zoomLevelContainers[4] contains 16x16 map tiles, each having a resolution 512x256
     this.zoomLevelContainers[5] contains 32x32 map tiles, each having a resolution 512x256
     this.zoomLevelContainers[6] contains 64x64 map tiles, each having a resolution 512x256

     after zooming:
     first select the zoom level that can fill the visible screen with at most 2x2 tiles (usually just 1 tile).
     then incrementally also render more detailed tile levels, up to the level which matches to the screen-resolution/bmpResolutionToPixelScaling.
     */
    for (var i=0; i<=6; i++) {
        this.zoomLevelContainers[i] = new createjs.Container();
        this.terrainContainer.addChild(this.zoomLevelContainers[i]);
    }

    this.finishedLoading = false;

    return this.terrainContainer;

};

TerrainRenderer.prototype.checkRendering = function () {

    var self = this;


    var zoom = this.mapRenderer.mapContainer.zoom;
    var xoff = this.mapRenderer.mainContainer.x;
    var yoff = this.mapRenderer.mainContainer.y;



    var centerBmpX = Math.round(-xoff / this.bmpRenderSizeX);
    var centerBmpY = Math.round(-yoff / this.bmpRenderSizeY);

    var numTilesPerSide = 3 * this.numTilesOnScreen / 2;

    for (var i = this.container.children.length - 1; i >= 0; i--) {
        var bmpObj = this.container.children[i];
        var DistanceX = Math.abs(bmpObj.x + xoff);
        var DistanceY = Math.abs(bmpObj.y + yoff);

        if (DistanceX <= (numTilesPerSide + 0.5) * this.bmpRenderSizeX && DistanceY <= (numTilesPerSide + 0.5) * this.bmpRenderSizeY) {
            //console.log("keep bmp with name="+bmpObj.name)
        }
        else {
            //console.log("remove bmp with name=" + bmpObj.name)
            this.container.removeChildAt(i);
        }
    }

    var counter = 0;
    var numTilesInRing = 1;
    for (var radFromCenter = 0; radFromCenter <= numTilesPerSide; radFromCenter++) {
        for (var bmpX = centerBmpX - radFromCenter; bmpX <= centerBmpX + radFromCenter; bmpX++) {
            var isFirstOrLast = (Math.abs(bmpX - centerBmpX) == radFromCenter);
            for (var bmpY = centerBmpY - radFromCenter; bmpY <= centerBmpY + radFromCenter; bmpY = isFirstOrLast ? (bmpY + 1) : (bmpY + 2 * radFromCenter)) {
                counter++;
                var bmpName = "x" + bmpX + "y" + bmpY;
                var existObj = this.container.getChildByName(bmpName);
                if (existObj == null) {
                    if (this.debugLog) console.log("start adding bmpObj at radFromCenter=" + radFromCenter + " with name=" + bmpName + " to TerrainRenderer with bmpToRenderScaling=" + this.bmpToRenderScaling);

                    var bmpObj = this.genBitmapFromPlanetGenerator((bmpX - 0.5) * this.bmpRenderSizeX, (bmpX + 0.5) * this.bmpRenderSizeX, (bmpY - 0.5) * this.bmpRenderSizeY, (bmpY + 0.5) * this.bmpRenderSizeY);

                    bmpObj.name = bmpName;
                    bmpObj.x = this.bmpRenderSizeX * bmpX;
                    bmpObj.y = this.bmpRenderSizeY * bmpY;
                    //console.log("add bmpObj with name=" + bmpObj.name + " x=" + bmpObj.x + " y=" + bmpObj.y);
                    bmpObj.regX = this.bmpResolutionX / 2;
                    bmpObj.regY = this.bmpResolutionY / 2;
                    this.container.addChild(bmpObj);

                    //update progress bar:
                    if (this.progressBar != null) {
                        this.progressBar.progress(Math.round(100 * counter / (4 * numTilesPerSide * numTilesPerSide)));
                    }

                    //check if screen is fully loaded:
                    if (this.finishedScreenLoadingCallback != null && radFromCenter > this.numTilesOnScreen / 2) {
                        this.finishedScreenLoadingCallback(this);
                    }

                    //do non-blocking recall of this function using setInterval:
                    setTimeout(function () {
                        self.checkRendering();
                    }, 100);
                    return;
                }
            }
        }


    }


};


TerrainRenderer.prototype.genBitmapFromPlanetGenerator = function (bmpxmin, bmpxmax, bmpymin, bmpymax) {

    var targetDepth = 14;
    var xpos = bmpxmin + Math.pow(2, targetDepth) / 2;
    var ypos = bmpymin + Math.pow(2, targetDepth) / 2;
    var width = (bmpxmax - bmpxmin);
    var height = (bmpymax - bmpymin);

    targetDepth = targetDepth - this.bmpToRenderScaling;//planetMap.getDepthAtNormalZoom();
    xpos = xpos / this.bmpToRenderScaling;
    ypos = ypos / this.bmpToRenderScaling;
    width = width / this.bmpToRenderScaling;
    height = height / this.bmpToRenderScaling;


    var mycanvas = document.createElement("canvas");
    mycanvas.width = width;
    mycanvas.height = height;
    var ctx = mycanvas.getContext("2d");
    var imgData = ctx.createImageData(width, height);

    var tmpMapGenerator = this.mapData.mapGenerator.getSeededCopy();
    var rgb = tmpMapGenerator.getMatrix(xpos, 2 * ypos, width, 2 * height, targetDepth, "rgb", true); // x,y, width, height, dept

    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    var sizeX = rgb.sizeX;
    var data = imgData.data;
    for (var yDest = 0, ySource = 2; yDest < height; yDest++, ySource += 2) {
        var startOfRowDest = width * yDest;
        var startOfRowSource = sizeX * ySource;
        for (var xDest = 0, xSource = 2; xDest < width; xDest++, xSource++) {
            var startOfPixelDest = (startOfRowDest + xDest) * 4;
            var startOfPixelSource = (startOfRowSource + xSource);
            data[startOfPixelDest] = r[startOfPixelSource];
            data[startOfPixelDest + 1] = g[startOfPixelSource];
            data[startOfPixelDest + 2] = b[startOfPixelSource];
            data[startOfPixelDest + 3] = 255; //alpha
        }
    }
    ctx.putImageData(imgData, 0, 0);

    var bmp = new createjs.Bitmap(mycanvas);
    if (this.debugTiles) {
        bmp.scaleX = this.bmpToRenderScaling * 0.99;
        bmp.scaleY = this.bmpToRenderScaling * 0.99;
    }
    else {
        bmp.scaleX = this.bmpToRenderScaling;
        bmp.scaleY = this.bmpToRenderScaling;
        var browser = navigator.userAgent.toLowerCase();
        if (browser.indexOf('firefox') > -1) {
            bmp.scaleX *= 1.001;
            bmp.scaleY *= 1.001;
        }
    }
    return bmp;
}


TerrainRenderer.prototype.tick = function () {

    if (!this.finishedLoading) {
        this.checkRendering();
    }

}