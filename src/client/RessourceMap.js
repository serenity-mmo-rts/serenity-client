var RessourceMap = function (mapRenderer, resMap, mapId, res_container, resTypeId, resColorFcn) {

    this.mapId = mapId;
    this.mapRenderer = mapRenderer;
    this.resMap = resMap;
    this.res_container = res_container;
    this.resTypeId = resTypeId;
    this.resColorFcn = resColorFcn;

    this.mapData = game.maps.get(this.mapId);
    this.mapType = game.mapTypes.get(this.mapData.mapTypeId);

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;

    this.debugTiles = false;
    this.debugLog = false;

    this.finishedLoadingCallback  = null;
    this.finishedScreenLoadingCallback  = null;
    this.updatingDisabled = false;

    this.bmpResolutionToPixelScaling = 4;  // this variable can be increased to reduce cpu strain
    this.numTilesOnScreen = 4; // this variable controls the number of tiles

    this.bmpToRenderScaling = this.bmpResolutionToPixelScaling / this.mapRenderer.mapContainer.zoom;
    this.bmpResolutionX = Math.ceil(window.innerWidth / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpResolutionY = Math.ceil(window.innerHeight / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpRenderSizeX = this.bmpResolutionX * this.bmpToRenderScaling;
    this.bmpRenderSizeY = this.bmpResolutionY * this.bmpToRenderScaling;

    this.sourcesQuadTree = null;
    this.initQuadtree(this.resTypeId);


    this.progressBar = null;
}

RessourceMap.prototype.enableProgressBar = function () {
    this.progressBar = new ProgressBar();
}

RessourceMap.prototype.disableProgressBar = function () {
    if (this.progressBar != null) {
        this.progressBar.destroy();
        this.progressBar = null;
    }
}

RessourceMap.prototype.initQuadtree = function (resTypeId) {
    if (this.debugLog) console.log("generate quadtree");

    var renderWidth = this.mapRenderer.gameCoord2RenderX(this.mapWidth, -this.mapHeight);
    var renderHeight = this.mapRenderer.gameCoord2RenderY(this.mapWidth, this.mapHeight);

    var bounds = {
        x: -renderWidth/2,
        y: -renderHeight/2,
        width: renderWidth,
        height: renderHeight
    }

    this.sourcesQuadTree = new QuadTree(bounds);

    for (var i = this.resMap.sources.length-1; i >= 0; i--) {
        if (this.resMap.sources[i].type == resTypeId) {
            var xRender = this.mapRenderer.gameCoord2RenderX(this.resMap.sources[i].x,this.resMap.sources[i].y);
            var yRender = this.mapRenderer.gameCoord2RenderY(this.resMap.sources[i].x,this.resMap.sources[i].y);
            var widthRender = 2 * this.mapRenderer.gameCoord2RenderX(this.resMap.sources[i].r,-this.resMap.sources[i].r);
            var heightRender = 2 * this.mapRenderer.gameCoord2RenderY(this.resMap.sources[i].r,this.resMap.sources[i].r);

            this.sourcesQuadTree.insert({
                i: i,
                x: xRender-widthRender/2,
                y: yRender-heightRender/2,
                height: heightRender,
                width: widthRender,
                xGame: this.resMap.sources[i].x,
                yGame: this.resMap.sources[i].y,
                rGame: this.resMap.sources[i].r,
                v: this.resMap.sources[i].v});
        }
    }
}

RessourceMap.prototype.checkRendering = function () {

    var self = this;

    if (this.updatingDisabled) {
        this.disableProgressBar();
    }
    else {
        var xoff = this.mapRenderer.main_container.x;
        var yoff = this.mapRenderer.main_container.y;

        var centerBmpX = Math.round(-xoff / this.bmpRenderSizeX);
        var centerBmpY = Math.round(-yoff / this.bmpRenderSizeY);

        var numTilesPerSide = 3 * this.numTilesOnScreen / 2;

        for (var i = this.res_container.children.length - 1; i >= 0; i--) {
            var bmpObj = this.res_container.children[i];
            var DistanceX = Math.abs(bmpObj.x + xoff);
            var DistanceY = Math.abs(bmpObj.y + yoff);

            if (DistanceX <= (numTilesPerSide + 0.5) * this.bmpRenderSizeX && DistanceY <= (numTilesPerSide + 0.5) * this.bmpRenderSizeY) {
                //console.log("keep bmp with name="+bmpObj.name)
            }
            else {
                //console.log("remove bmp with name=" + bmpObj.name)
                this.res_container.removeChildAt(i);
            }
        }

        var counter = 0;
        var numTilesInRing = 1;
        for (var radFromCenter = 0; radFromCenter <= numTilesPerSide; radFromCenter++) {
            for (var bmpX = centerBmpX - radFromCenter; bmpX <= centerBmpX + radFromCenter; bmpX++) {
                var isFirstOrLast = (Math.abs(bmpX - centerBmpX) == radFromCenter);
                for (var bmpY = centerBmpY - radFromCenter; bmpY <= centerBmpY + radFromCenter; bmpY=isFirstOrLast?(bmpY+1):(bmpY+2*radFromCenter)) {
                    counter++;
                    var bmpName = "x" + bmpX + "y" + bmpY;
                    var existObj = this.res_container.getChildByName(bmpName);
                    if (existObj == null) {
                        if (this.debugLog) console.log("start adding bmpObj with name=" + bmpName);
                        var resData = this.genResData((bmpX - 0.5) * this.bmpRenderSizeX, (bmpX + 0.5) * this.bmpRenderSizeX, (bmpY - 0.5) * this.bmpRenderSizeY, (bmpY + 0.5) * this.bmpRenderSizeY);
                        var bmpObj = this.genBitmapFromResData(resData);
                        bmpObj.name = bmpName;
                        bmpObj.x = this.bmpRenderSizeX * bmpX;
                        bmpObj.y = this.bmpRenderSizeY * bmpY;
                        //console.log("add bmpObj with name=" + bmpObj.name + " x=" + bmpObj.x + " y=" + bmpObj.y);
                        bmpObj.regX = this.bmpResolutionX / 2;
                        bmpObj.regY = this.bmpResolutionY / 2;
                        this.res_container.addChild(bmpObj);

                        //update progress bar:
                        if (this.progressBar != null) {
                            this.progressBar.progress(Math.round(100*counter/(4*numTilesPerSide*numTilesPerSide)));
                        }

                        //do non-blocking recall of this function using setInterval:
                        setTimeout(function () {
                            self.checkRendering();
                        }, 10);
                        return;
                    }
                }
            }

            //check if screen is fully loaded:
            if (this.finishedScreenLoadingCallback != null && radFromCenter > this.numTilesOnScreen / 2) {
                this.finishedScreenLoadingCallback(this);
            }

        }

        console.log("all tiles loaded");

        this.disableProgressBar();

        if ( this.finishedLoadingCallback != null) {
            this.finishedLoadingCallback(this);
        }

    }



}


RessourceMap.prototype.genResData = function (bmpxmin, bmpxmax, bmpymin, bmpymax) {

    var resData = this.newFilledArray(this.bmpResolutionX*this.bmpResolutionY, 0.0);
    resData = Object(resData);

    var renderHeight = bmpymax-bmpymin;
    var renderWidth = bmpxmax-bmpxmin;
    var ressourceItems = this.sourcesQuadTree.retrieve({x: bmpxmin, y: bmpymin, height: renderHeight, width: renderWidth});
    ressourceItems = _.uniq(ressourceItems);
    //console.log("num ressource Items retrieved for bitmap"+ressourceItems.length)

    for (var i = 0; i < ressourceItems.length; i++) {
        //TODO: add for loop to add periodic boundaries: i.e use this.mapRenderer.gameCoord2RenderX(this.sources.x[i]+this.mapWidth,this.sources.y[i]+this.mapHeight)

        var x = this.mapRenderer.gameCoord2RenderX(ressourceItems[i].xGame, ressourceItems[i].yGame);
        var y = this.mapRenderer.gameCoord2RenderY(ressourceItems[i].xGame, ressourceItems[i].yGame);
        var r = ressourceItems[i].rGame;
        var v = ressourceItems[i].v;

        var xminRenderCoord = ressourceItems[i].x;
        var xmaxRenderCoord = ressourceItems[i].x + ressourceItems[i].width;
        var yminRenderCoord = ressourceItems[i].y;
        var ymaxRenderCoord = ressourceItems[i].y + ressourceItems[i].height;

        var xminBmpPixel = Math.floor(Math.max(-4000+(xminRenderCoord - bmpxmin) / this.bmpToRenderScaling, 0));
        var xmaxBmpPixel = Math.ceil(Math.min(+4000+(xmaxRenderCoord - bmpxmin) / this.bmpToRenderScaling, this.bmpResolutionX));
        var yminBmpPixel = Math.floor(Math.max(-4000+(yminRenderCoord - bmpymin) / this.bmpToRenderScaling, 0));
        var ymaxBmpPixel = Math.ceil(Math.min(+4000+(ymaxRenderCoord - bmpymin) / this.bmpToRenderScaling, this.bmpResolutionY));

        //create Gaussian with constants:
        var sigma = r / 5;
        var sigmaSqr2 = 2 * sigma * sigma;

        var rsq = (r)*(r);
        if (xmaxBmpPixel > xminBmpPixel && ymaxBmpPixel > yminBmpPixel) {
            for (var bmpYpixel = yminBmpPixel; bmpYpixel < ymaxBmpPixel; bmpYpixel++) {
                var bmpYcoord = bmpYpixel * this.bmpToRenderScaling + bmpymin;
                var startOfRow = this.bmpResolutionX * bmpYpixel;
                for (var bmpXpixel = xminBmpPixel; bmpXpixel < xmaxBmpPixel; bmpXpixel++) {
                    var bmpXcoord = bmpXpixel * this.bmpToRenderScaling + bmpxmin;
                    var xDist = Math.abs(this.mapRenderer.renderCoord2GameX(bmpXcoord - x, bmpYcoord - y));
                    var yDist = Math.abs(this.mapRenderer.renderCoord2GameY(bmpXcoord - x, bmpYcoord - y));
                    var distSq = xDist*xDist + yDist*yDist;
                    if (distSq <= rsq) {
                        var startOfColumn = startOfRow + bmpXpixel;
                        resData[startOfColumn] = resData[startOfColumn] + v * Math.exp(- distSq / sigmaSqr2);
                        //resData.resData[startOfColumn] = resData.resData[startOfColumn] + v * (rsq - distSq)/rsq;
                    }
                }

            }
        }

    }

    return resData;

};

RessourceMap.prototype.genBitmapFromResData = function (resData) {
    var mycanvas = document.createElement("canvas");
    mycanvas.width = this.bmpResolutionX;
    mycanvas.height = this.bmpResolutionY;
    var ctx = mycanvas.getContext("2d");
    var imgData = ctx.createImageData(this.bmpResolutionX, this.bmpResolutionY);
    for (var yy = 0; yy < this.bmpResolutionY; yy++) {
        var startOfRow = this.bmpResolutionX * yy;
        for (var xx = 0; xx < this.bmpResolutionX; xx++) {
            var startOfPixel = (startOfRow + xx) * 4;
            var colors = this.resColorFcn(resData[startOfRow + xx]);
            imgData.data[startOfPixel] = colors.r;
            imgData.data[startOfPixel + 1] = colors.g;
            imgData.data[startOfPixel + 2] = colors.b;
            imgData.data[startOfPixel + 3] = 255; //alpha
        }
    }
    ctx.putImageData(imgData, 0, 0);

    var bmp = new createjs.Bitmap(mycanvas);
    if (this.debugTiles) {
        bmp.scaleX = this.bmpToRenderScaling*0.99;
        bmp.scaleY = this.bmpToRenderScaling*0.99;
    }
    else {
        bmp.scaleX = this.bmpToRenderScaling;
        bmp.scaleY = this.bmpToRenderScaling;
    }
    return bmp;
}

RessourceMap.prototype.newFilledArray = function (len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

RessourceMap.prototype.wrapIndex = function (i, i_max) {
    return ((i % i_max) + i_max) % i_max;
}

RessourceMap.prototype.addFinishedLoadingCallback = function (fcn) {
    this.finishedLoadingCallback  = fcn;
};

RessourceMap.prototype.addFinishedScreenLoadingCallback = function (fcn) {
    this.finishedScreenLoadingCallback  = fcn;
};