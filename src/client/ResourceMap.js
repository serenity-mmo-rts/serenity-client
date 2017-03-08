var ResourceMap = function (mapRenderer, resMap, mapId, res_container, type) {

    this.mapId = mapId;
    this.mapRenderer = mapRenderer;
    this.map = resMap;
    this.container = res_container;

    this.type = type;

    this.mapData = game.layers.get(this.mapId);
    this.mapType = game.layerTypes.get(this.mapData.mapTypeId);

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;

    this.debugTiles = false;
    this.debugLog = false;

    this.finishedLoadingCallback  = null;
    this.finishedScreenLoadingCallback  = null;
    this.updatingDisabled = false;

    this.bmpResolutionToPixelScaling = 2;  // this variable can be increased to reduce cpu strain
    this.numTilesOnScreen = 2; // this variable controls the number of tiles

    this.bmpToRenderScaling = this.bmpResolutionToPixelScaling / this.mapRenderer.mapContainer.zoom;
    this.bmpResolutionX = Math.ceil(window.innerWidth / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpResolutionY = Math.ceil(window.innerHeight / (this.numTilesOnScreen * this.bmpResolutionToPixelScaling));
    this.bmpRenderSizeX = this.bmpResolutionX * this.bmpToRenderScaling;
    this.bmpRenderSizeY = this.bmpResolutionY * this.bmpToRenderScaling;
    if (this.debugLog) console.log("new RessourceMap with bmpToRenderScaling=" + this.bmpToRenderScaling);

    this.sourcesQuadTree = null;

    this.progressBar = null;
};


ResourceMap.prototype.enableProgressBar = function () {
    this.progressBar = new ProgressBar();
}

ResourceMap.prototype.disableProgressBar = function () {
    if (this.progressBar != null) {
        this.progressBar.destroy();
        this.progressBar = null;
    }
}

ResourceMap.prototype.initQuadtree = function (resTypeId) {
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

    for (var i = this.map.sources.length-1; i >= 0; i--) {
        if (this.map.sources[i].type == resTypeId) {
            var xRender = this.mapRenderer.gameCoord2RenderX(this.map.sources[i].x,this.map.sources[i].y);
            var yRender = this.mapRenderer.gameCoord2RenderY(this.map.sources[i].x,this.map.sources[i].y);
            var widthRender = 2 * this.mapRenderer.gameCoord2RenderX(this.map.sources[i].r,-this.map.sources[i].r);
            var heightRender = 2 * this.mapRenderer.gameCoord2RenderY(this.map.sources[i].r,this.map.sources[i].r);

            this.sourcesQuadTree.insert({
                i: i,
                x: xRender-widthRender/2,
                y: yRender-heightRender/2,
                height: heightRender,
                width: widthRender,
                xGame: this.map.sources[i].x,
                yGame: this.map.sources[i].y,
                rGame: this.map.sources[i].r,
                r1Game: this.map.sources[i].r1,
                s: this.map.sources[i].s,
                v: this.map.sources[i].v});
        }
    }
}

ResourceMap.prototype.checkRendering = function () {

    var self = this;

    if (this.updatingDisabled) {
        if (this.debugLog) console.log("disabled update of resourceMap with bmpToRenderScaling=" + this.bmpToRenderScaling);
        this.disableProgressBar();
    }
    else {
        var xoff = this.mapRenderer.main_container.x;
        var yoff = this.mapRenderer.main_container.y;

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
                for (var bmpY = centerBmpY - radFromCenter; bmpY <= centerBmpY + radFromCenter; bmpY=isFirstOrLast?(bmpY+1):(bmpY+2*radFromCenter)) {
                    counter++;
                    var bmpName = "x" + bmpX + "y" + bmpY;
                    var existObj = this.container.getChildByName(bmpName);
                    if (existObj == null) {
                        if (this.debugLog) console.log("start adding bmpObj at radFromCenter=" +radFromCenter+ " with name=" + bmpName + " to resourceMap with bmpToRenderScaling=" + this.bmpToRenderScaling);

                        //var resData = this.genResData((bmpX - 0.5) * this.bmpRenderSizeX, (bmpX + 0.5) * this.bmpRenderSizeX, (bmpY - 0.5) * this.bmpRenderSizeY, (bmpY + 0.5) * this.bmpRenderSizeY);
                        //var bmpObj = this.genBitmapFromResData(resData);

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
                            this.progressBar.progress(Math.round(100*counter/(4*numTilesPerSide*numTilesPerSide)));
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

        //console.log("all tiles loaded");

        this.disableProgressBar();

        if ( this.finishedLoadingCallback != null) {
            this.finishedLoadingCallback(this);
        }

    }

};


ResourceMap.prototype.genBitmapFromPlanetGenerator = function(bmpxmin, bmpxmax, bmpymin, bmpymax) {

    var targetDepth = 14;
    var xpos = bmpxmin + Math.pow(2,targetDepth)/2;
    var ypos = bmpymin + Math.pow(2,targetDepth)/2;
    var width = (bmpxmax-bmpxmin);
    var height = (bmpymax-bmpymin);

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

    var rgb = this.mapData.mapGenerator.getMatrix(xpos,2*ypos,width,2*height,targetDepth,"rgb"); // x,y, width, height, depth

    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    var sizeX = rgb.sizeX;
    var data = imgData.data;
    for (var yDest = 0, ySource=2; yDest < height; yDest++, ySource+=2) {
        var startOfRowDest = width * yDest;
        var startOfRowSource = sizeX * ySource;
        for (var xDest = 0, xSource=2; xDest < width; xDest++, xSource++) {
            var startOfPixelDest = (startOfRowDest + xDest) *4;
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
        bmp.scaleX = this.bmpToRenderScaling*0.99;
        bmp.scaleY = this.bmpToRenderScaling*0.99;
    }
    else {
        bmp.scaleX = this.bmpToRenderScaling;
        bmp.scaleY = this.bmpToRenderScaling;
        var browser=navigator.userAgent.toLowerCase();
        if(browser.indexOf('firefox') > -1) {
            bmp.scaleX *= 1.001;
            bmp.scaleY *= 1.001;
        }
    }
    return bmp;
}



ResourceMap.prototype.genResData = function (bmpxmin, bmpxmax, bmpymin, bmpymax) {

    var resData = this.newFilledArray(this.bmpResolutionX*this.bmpResolutionY, 0.0);
    resData = Object(resData);

    var renderHeight = bmpymax-bmpymin;
    var renderWidth = bmpxmax-bmpxmin;
    var ressourceItems = this.sourcesQuadTree.retrieve({x: bmpxmin, y: bmpymin, height: renderHeight, width: renderWidth});
    ressourceItems = _.uniq(ressourceItems);
    //console.log("num ressource Items retrieved for bitmap"+ressourceItems.length)

    var mapTypeScale = this.mapRenderer.mapType._scale;
    var mapTypeScaleSq = mapTypeScale*mapTypeScale;
    var mapTypeRatio = this.mapRenderer.mapType._ratioWidthHeight;


    for (var i = 0; i < ressourceItems.length; i++) {
        //TODO: add for loop to add periodic boundaries: i.e use this.mapRenderer.gameCoord2RenderX(this.sources.x[i]+this.mapWidth,this.sources.y[i]+this.mapHeight)

        var x = this.mapRenderer.gameCoord2RenderX(ressourceItems[i].xGame, ressourceItems[i].yGame);
        var y = this.mapRenderer.gameCoord2RenderY(ressourceItems[i].xGame, ressourceItems[i].yGame);
        var r = ressourceItems[i].rGame;
        var v = ressourceItems[i].v;
        var r1 = ressourceItems[i].r1Game;
        var s = ressourceItems[i].s;


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
        var r1sq = (r1)*(r1);
        if (xmaxBmpPixel > xminBmpPixel && ymaxBmpPixel > yminBmpPixel) {
            for (var bmpYpixel = yminBmpPixel; bmpYpixel < ymaxBmpPixel; bmpYpixel++) {
                var renderDistY = bmpYpixel * this.bmpToRenderScaling + bmpymin - y;
                var startOfRow = this.bmpResolutionX * bmpYpixel;
                for (var bmpXpixel = xminBmpPixel; bmpXpixel < xmaxBmpPixel; bmpXpixel++) {
                    var renderDistX = bmpXpixel * this.bmpToRenderScaling + bmpxmin - x;

                    // THIS code block is replaced by faster code:
                    //var xDist = Math.abs(this.mapRenderer.renderCoord2GameX(renderDistX, renderDistY));
                    //var yDist = Math.abs(this.mapRenderer.renderCoord2GameY(renderDistX, renderDistY));
                    //var distSq = xDist*xDist + yDist*yDist;

                    // THIS code block does the same but inline:
                    var gameDistXY = renderDistX/mapTypeRatio;
                    var xDist = (renderDistY + gameDistXY);
                    var yDist = (renderDistY - gameDistXY);
                    var distSq = (xDist*xDist + yDist*yDist)/ (4*mapTypeScaleSq);

                    if (distSq <= rsq) {
                        var startOfColumn = startOfRow + bmpXpixel;

                        // gaussian:
                        //resData[startOfColumn] += v * Math.exp(- distSq / sigmaSqr2);

                        // linear descent:
                        //resData.resData[startOfColumn] += v * (rsq - distSq)/rsq;

                        if (distSq < r1sq) {
                            resData[startOfColumn] += v;
                        }
                        else {
                            var distInDescent = (Math.sqrt(distSq)-r1)/(r-r1);
                            // interpolation between linear descent and sinus:
                            resData[startOfColumn] += v * ((1 - distInDescent) + s * Math.sin(distInDescent*2*Math.PI) / (2*Math.PI));
                        }
                    }
                }

            }
        }

    }

    return resData;

};

ResourceMap.prototype.genBitmapFromResData = function (resData) {
    var mycanvas = document.createElement("canvas");
    mycanvas.width = this.bmpResolutionX;
    mycanvas.height = this.bmpResolutionY;
    var ctx = mycanvas.getContext("2d");
    var imgData = ctx.createImageData(this.bmpResolutionX, this.bmpResolutionY);
    for (var yy = 0; yy < this.bmpResolutionY; yy++) {
        var startOfRow = this.bmpResolutionX * yy;
        for (var xx = 0; xx < this.bmpResolutionX; xx++) {
            var startOfPixel = (startOfRow + xx) * 4;
            var colors = this.GetHotColour(resData[startOfRow + xx],0, 1);
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
        var browser=navigator.userAgent.toLowerCase();
        if(browser.indexOf('firefox') > -1) {
            bmp.scaleX *= 1.001;
            bmp.scaleY *= 1.001;
        }
    }
    return bmp;
}


ResourceMap.prototype.GetHotColour = function (v, vmin, vmax) {
    var resDataScaled = Math.round(255 * (v-vmin)/(vmax - vmin));
    return {r: resDataScaled, g: 0, b: 255 - resDataScaled};
}


ResourceMap.prototype.newFilledArray = function (len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

ResourceMap.prototype.wrapIndex = function (i, i_max) {
    return ((i % i_max) + i_max) % i_max;
}

ResourceMap.prototype.addFinishedLoadingCallback = function (fcn) {
    this.finishedLoadingCallback  = fcn;
};

ResourceMap.prototype.addFinishedScreenLoadingCallback = function (fcn) {
    this.finishedScreenLoadingCallback  = fcn;
};