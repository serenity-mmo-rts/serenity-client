var ResourceMap = function (mapRenderer, resMap, mapId, resContainer) {
    var self = this;

    this.mapId = mapId;
    this.mapRenderer = mapRenderer;
    this.map = resMap;
    this.container = resContainer;

    this.mapData = game.layers.get(this.mapId);
    this.mapType = game.layerTypes.get(this.mapData.mapTypeId);

    this.mapWidth = this.mapData.width();
    this.mapHeight = this.mapData.height();
    this.mapRenderWidth = this.mapRenderer.gameCoord2RenderX(this.mapWidth, -this.mapHeight);
    this.mapRenderHeight = this.mapRenderer.gameCoord2RenderY(this.mapWidth, this.mapHeight);

    this.rgbMapName = this.mapRenderer.mapContainer.layerView.rgbMapName;
    this.rgbMapName.subscribe(function() {
        self.clearAndInitBitmapCache();
        self.checkRendering();
    });

    this.debugTiles = false;
    this.debugLog = false;

    this.finishedLoadingCallback  = null;
    this.finishedScreenLoadingCallback  = null;
    this.updatingDisabled = false;

    // bmpResolution is always fixed to:
    this.bitmapNumScales = 8;
    this.bmpResolutionX = Math.pow(2, this.bitmapNumScales);
    this.bmpResolutionY = Math.pow(2, this.bitmapNumScales)/2;


    this.maxScale = 20;
    this.containerPerScale  = [];
    this.clearAndInitBitmapCache();

    this.sourcesQuadTree = null;
    this.progressBar = null;

    this.checkRenderingAlreadyRunning = false;
};

ResourceMap.prototype.clearAndInitBitmapCache = function() {
    this.containerPerScale  = [];
    this.container.removeAllChildren();

    // each containerPerScale stores bitmaps at a specific map resolution:
    // containerPerScale[0] contains 1  bitmap  spanning the whole map
    // containerPerScale[1] contains 4  bitmaps spanning the whole map
    // containerPerScale[2] contains 16 bitmaps spanning the whole map
    // etc

    for (var scale = 0; scale <= this.maxScale; scale++) {
        this.containerPerScale[scale] = new createjs.Container();
        this.container.addChildAt(this.containerPerScale[scale], scale);
    }
};

ResourceMap.prototype.enableProgressBar = function () {
    this.progressBar = new ProgressBar();
};

ResourceMap.prototype.disableProgressBar = function () {
    if (this.progressBar != null) {
        this.progressBar.destroy();
        this.progressBar = null;
    }
};

ResourceMap.prototype.initQuadtree = function (resTypeId) {
    if (this.debugLog) console.log("generate quadtree");

    var renderWidth = this.mapRenderWidth;
    var renderHeight = this.mapRenderHeight;

    var bounds = {
        x: -renderWidth/2,
        y: -renderHeight/2,
        width: renderWidth,
        height: renderHeight
    };

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
};

ResourceMap.prototype.resize = function () {
    this.checkRendering();
};

ResourceMap.prototype.checkRendering = function () {

    if (this.checkRenderingAlreadyRunning) {
        return;
    }
    else {
        this.checkRenderingAlreadyRunning = true;
        this.checkRenderingNextRun();
    }
};

ResourceMap.prototype.checkRenderingNextRun = function() {
    var self = this;

    if (this.updatingDisabled) {
        this.disableProgressBar();
    }
    else {

        //console.log("this.mapRenderWidth="+this.mapRenderWidth+" this.mapRenderHeight="+this.mapRenderHeight);

        var xoff = - this.mapRenderer.mainContainer.x + this.mapRenderWidth/2;
        var yoff = - this.mapRenderer.mainContainer.y + this.mapRenderHeight/2;
        var zoom = this.mapRenderer.mapContainer.zoom;

        //console.log("check rendering at xoff="+xoff+ " yoff="+yoff+" zoom="+zoom);

        // calculate desired scale:
        function log2(number) {
            return Math.log(number) / Math.log(2);
        }

        var optimal_scale = Math.round(log2((zoom*this.mapRenderWidth) / (this.bmpResolutionX)));
        var minScale = optimal_scale-1;//=1;
        var desiredScale = optimal_scale-1;

        for (var scale = minScale; scale <= desiredScale; scale++) {

            //console.log("start rendering at scale="+scale);

            var totalDepth = scale + this.bitmapNumScales;
            var numInScale = Math.pow(2, scale);
            var bmpRenderSizeX = this.mapRenderWidth / numInScale;
            var bmpRenderSizeY = this.mapRenderHeight / numInScale;

            var centerBmpX = Math.floor(xoff / bmpRenderSizeX);
            var centerBmpY = Math.floor(yoff / bmpRenderSizeY);

            var counter = 0;
            var foundTile = true; // search as long as there is something missing:
            for (var radFromCenter = 0; foundTile; radFromCenter++) {
                foundTile = false;
                for (var bmpXidx = centerBmpX - radFromCenter; bmpXidx <= centerBmpX + radFromCenter; bmpXidx++) {
                    var isFirstOrLast = (Math.abs(bmpXidx - centerBmpX) == radFromCenter);
                    for (var bmpYidx = centerBmpY - radFromCenter; bmpYidx <= centerBmpY + radFromCenter; bmpYidx = isFirstOrLast ? (bmpYidx + 1) : (bmpYidx + 2 * radFromCenter)) {
                        counter++;

                        var bmpName = "x" + bmpXidx + "y" + bmpYidx;

                        var bmpxmin = (bmpXidx + numInScale/2) * this.bmpResolutionX;
                        var bmpxmax = (bmpXidx + numInScale/2 +1) * this.bmpResolutionX;
                        var bmpymin = (bmpYidx) * this.bmpResolutionY;
                        var bmpymax = (bmpYidx+1) * this.bmpResolutionY;

                        // check distance between tile-rect and screen-rect:
                        var render_x = (bmpXidx+0.5) * bmpRenderSizeX;
                        var render_y = (bmpYidx+0.5) * bmpRenderSizeY;
                        //console.log("bmpXidx="+bmpXidx+" bmpYidx="+bmpYidx+" render_x="+render_x+" render_y="+render_y);

                        var h_diff = Math.abs(render_x - xoff);
                        var v_diff = Math.abs(render_y - yoff);
                        //console.log("h_diff="+h_diff+" v_diff="+v_diff+" bmpRenderSizeX="+bmpRenderSizeX+" bmpRenderSizeY="+bmpRenderSizeY);
                        if (h_diff - bmpRenderSizeX*0.5 <= 1.1*window.innerWidth/zoom &&
                            v_diff - bmpRenderSizeY*0.5 <= 1.1*window.innerHeight/zoom) {

                            foundTile = true; // it will continue with radius search

                            var existObj = this.containerPerScale[scale].getChildByName(bmpName);
                            if (existObj == null) {

                                var bmpObj = this.genBitmapFromPlanetGenerator(bmpxmin, bmpxmax, bmpymin, bmpymax, totalDepth);

                                bmpObj.name = bmpName;
                                bmpObj.x = render_x - this.mapRenderWidth/2;
                                bmpObj.y = render_y - this.mapRenderHeight/2;
                                bmpObj.regX = this.bmpResolutionX / 2;
                                bmpObj.regY = this.bmpResolutionY / 2;
                                bmpObj.scaleX = this.mapRenderWidth / (this.bmpResolutionX * numInScale);
                                bmpObj.scaleY = this.mapRenderHeight / (this.bmpResolutionY * numInScale);

                                if (this.debugTiles) {
                                    bmpObj.scaleX *= 0.99;
                                    bmpObj.scaleY *= 0.99;
                                }
                                else {
                                    var browser=navigator.userAgent.toLowerCase();
                                    if(browser.indexOf('firefox') > -1) {
                                        bmpObj.scaleX *= 1.001;
                                        bmpObj.scaleY *= 1.001;
                                    }
                                }
                                if (this.debugLog) {
                                    console.log("added bmpObj at scale="+scale+" radFromCenter=" + radFromCenter + " with name=" + bmpName + " and with x=" + bmpObj.x + " y=" + bmpObj.y);
                                }

                                this.containerPerScale[scale].addChild(bmpObj);

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
                                    self.checkRenderingNextRun();
                                }, 40);
                                return;
                            }
                        }
                    }
                }
            }


            /*
            // remove tiles that are far away from screen:
            for (var i = this.containerPerScale[scale].children.length - 1; i >= 0; i--) {
                var bmpObj = this.containerPerScale[scale].children[i];
                var DistanceX = Math.abs(bmpObj.x + xoff);
                var DistanceY = Math.abs(bmpObj.y + yoff);

                if (DistanceX <= (numTilesPerSide + 0.5) * this.bmpRenderSizeX && DistanceY <= (numTilesPerSide + 0.5) * this.bmpRenderSizeY) {
                    //console.log("keep bmp with name="+bmpObj.name)
                }
                else {
                    //console.log("remove bmp with name=" + bmpObj.name)
                    this.containerPerScale[scale].removeChildAt(i);
                }
            }
            */

        }

        console.log("all tiles loaded");

        this.checkRenderingAlreadyRunning = false;
        this.disableProgressBar();

        if ( this.finishedLoadingCallback != null) {
            this.finishedLoadingCallback(this);
        }

    }
}

/**
 * specify parameter rect within the targetDepth resolution (i.e. if targetDepth==8, then bmpxmax=256 is the end of map)
 * @param bmpxmin
 * @param bmpxmax
 * @param bmpymin
 * @param bmpymax
 * @param targetDepth
 * @returns {*}
 */
ResourceMap.prototype.genBitmapFromPlanetGenerator = function(bmpxmin, bmpxmax, bmpymin, bmpymax, targetDepth) {

    var xpos = bmpxmin + Math.pow(2,targetDepth)/2;
    var ypos = bmpymin + Math.pow(2,targetDepth)/2;
    var width = (bmpxmax-bmpxmin);
    var height = (bmpymax-bmpymin);

    var mycanvas = document.createElement("canvas");
    mycanvas.width = width;
    mycanvas.height = height;
    var ctx = mycanvas.getContext("2d");
    var imgData = ctx.createImageData(width, height);

    var tmpMapGenerator = this.mapData.mapGenerator.getSeededCopy();
    var rgb = tmpMapGenerator.getMatrix(xpos,2*ypos,width,2*height,targetDepth,this.rgbMapName(),true); // x,y, width, height, dept

    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    var sizeX = rgb.sizeX;
    var data = imgData.data;
    for (var yDest = 0, ySource=0; yDest < height; yDest++, ySource++) {
        var startOfRowDest = width * yDest;
        var startOfRowSource = sizeX * ySource;
        for (var xDest = 0, xSource=0; xDest < width; xDest++, xSource++) {
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
    return bmp;
};



ResourceMap.prototype.genResData = function (bmpxmin, bmpxmax, bmpymin, bmpymax) {

    var resData = this.newFilledArray(this.bmpResolutionX*this.bmpResolutionY, 0.0);
    resData = Object(resData);

    var renderHeight = bmpymax-bmpymin;
    var renderWidth = bmpxmax-bmpxmin;
    var ressourceItems = this.sourcesQuadTree.retrieve({x: bmpxmin, y: bmpymin, height: renderHeight, width: renderWidth});
    ressourceItems = _.uniq(ressourceItems);
    //console.log("num ressource Items retrieved for bitmap"+ressourceItems.length)

    var mapTypeScale = this.mapRenderer.mapType.scale;
    var mapTypeScaleSq = mapTypeScale*mapTypeScale;
    var mapTypeRatio = this.mapRenderer.mapType.ratioWidthHeight;


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

/*
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
*/

ResourceMap.prototype.GetHotColour = function (v, vmin, vmax) {
    var resDataScaled = Math.round(255 * (v-vmin)/(vmax - vmin));
    return {r: resDataScaled, g: 0, b: 255 - resDataScaled};
};


ResourceMap.prototype.newFilledArray = function (len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
};

ResourceMap.prototype.wrapIndex = function (i, i_max) {
    return ((i % i_max) + i_max) % i_max;
};

ResourceMap.prototype.addFinishedLoadingCallback = function (fcn) {
    this.finishedLoadingCallback  = fcn;
};

ResourceMap.prototype.addFinishedScreenLoadingCallback = function (fcn) {
    this.finishedScreenLoadingCallback  = fcn;
};