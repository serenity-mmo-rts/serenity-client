var RessourceMap = function (mapRenderer, main_container, mapId, res_container) {

    this.mapId = mapId;
    this.mapRenderer = mapRenderer;
    this.main_container = main_container;
    this.res_container = res_container;
    this.canvas_size = [window.innerHeight, window.innerWidth];

    this.mapData = game.maps.get(this.mapId);
    this.mapType = game.mapTypes.get(this.mapData.mapTypeId);

    this.mapWidth = this.mapData.width;
    this.mapHeight = this.mapData.height;
    var renderWidth = this.mapRenderer.gameCoord2RenderX(this.mapWidth, -this.mapHeight);
    var renderHeight = this.mapRenderer.gameCoord2RenderY(this.mapWidth, this.mapHeight);

    this.bmpToRenderScaling = 4;

    this.sources = {x: [], y: [], r: [], v: []};

    var bounds = {
        x: -renderWidth/2,
        y: -renderHeight/2,
        width: renderWidth,
        height: renderHeight
    }
    this.sourcesQuadTree = new QuadTree(bounds);

    this.numTilesOnScreen = 2;
    this.bmpResolutionX = Math.ceil(window.innerWidth / (this.numTilesOnScreen * this.bmpToRenderScaling));
    this.bmpResolutionY = Math.ceil(window.innerHeight / (this.numTilesOnScreen * this.bmpToRenderScaling));
    this.bmpRenderSizeX = this.bmpResolutionX * this.bmpToRenderScaling;
    this.bmpRenderSizeY = this.bmpResolutionY * this.bmpToRenderScaling;
}


RessourceMap.prototype.genRes = function () {
    var numRessources = 100;

    this.sources = {x: [], y: [], r: [], v: []};
    this.sources.x = [];
    this.sources.y = [];
    this.sources.r = [];
    this.sources.v = [];

    var minR = Math.min(this.mapWidth, this.mapHeight) / 20;
    var maxR = Math.min(this.mapWidth, this.mapHeight) / 5;
    var minV = 0.1;
    var maxV = 0.2;
    for (var i = 0; i < numRessources; i++) {
        var x = this.mapWidth * (Math.random() - 0.5);
        var y = this.mapHeight * (Math.random() - 0.5);
        var r = minR + (maxR - minR) * Math.random();
        var v = minV + (maxV - minV) * Math.random();
        this.sources.x.push(x);
        this.sources.y.push(y);
        this.sources.r.push(r);
        this.sources.v.push(v);

        var xRender = this.mapRenderer.gameCoord2RenderX(x,y);
        var yRender = this.mapRenderer.gameCoord2RenderY(x,y);
        var widthRender = 2 * r * this.mapType.scale * this.mapType.ratioWidthHeight;
        var heightRender = 2 * r * this.mapType.scale;

        this.sourcesQuadTree.insert({
            x: xRender-widthRender/2,
            y: yRender-heightRender/2,
            height: heightRender,
            width: widthRender,
            xGame: x,
            yGame: y,
            rGame: r,
            v: v});
    }
}


RessourceMap.prototype.checkRendering = function () {

    var self = this;

    var zoomfac = uc.layer.mapContainer.zoom;

    var xoff = this.main_container.x;
    var yoff = this.main_container.y;

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

    var numTilesInRing = 1;
    for (var radFromCenter = 0; radFromCenter <= numTilesPerSide; radFromCenter++) {
        for (var bmpX = centerBmpX - radFromCenter; bmpX <= centerBmpX + radFromCenter; bmpX++) {
            var isFirstOrLast = (Math.abs(bmpX - centerBmpX) == radFromCenter);
            for (var bmpY = centerBmpY - radFromCenter; bmpY <= centerBmpY + radFromCenter; bmpY=isFirstOrLast?(bmpY+1):(bmpY+2*radFromCenter)) {
                var bmpName = "x" + bmpX + "y" + bmpY;
                var existObj = this.res_container.getChildByName(bmpName);
                if (existObj == null) {
                    var bmpObj = this.getResBitmap(100, (bmpX - 0.5) * this.bmpRenderSizeX, (bmpX + 0.5) * this.bmpRenderSizeX, (bmpY - 0.5) * this.bmpRenderSizeY, (bmpY + 0.5) * this.bmpRenderSizeY);
                    bmpObj.name = bmpName;
                    bmpObj.x = this.bmpRenderSizeX * bmpX;
                    bmpObj.y = this.bmpRenderSizeY * bmpY;
                    console.log("add bmpObj with name=" + bmpObj.name + " x=" + bmpObj.x + " y=" + bmpObj.y);
                    bmpObj.regX = this.bmpResolutionX / 2;
                    bmpObj.regY = this.bmpResolutionY / 2;
                    this.res_container.addChild(bmpObj);

                    //do non-blocking recall of this function using setInterval:
                    setTimeout(function () {
                        self.checkRendering();
                    }, 10);
                    return;
                }
            }
        }
    }
}


RessourceMap.prototype.getResBitmap = function (time, bmpxmin, bmpxmax, bmpymin, bmpymax) {
    var noiseLevel = 0;
    var time = Math.max(time - 1, 0);

    deepwaterSize = 0.01 + Math.max(time - 5, 0) * 3;
    coastwaterSize = time * 2;
    beachSize = time * 2;
    valleySize = Math.max(time - 5, 0) * 5;
    greenSize = Math.max(time - 10, 0) * 5;
    mountainSize = 50 - time * 5;
    iceSize = 50 - Math.min(time, 9) * 5;

    sumSize = deepwaterSize + coastwaterSize + beachSize + valleySize + greenSize + mountainSize + iceSize;

    var landscape = [];
    landscape.push({maxV: deepwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 0, g: 0, b: 150}, name: "deepwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + coastwaterSize / sumSize, c1: {r: 0, g: 0, b: 150}, c2: {r: 56, g: 200, b: 200}, name: "coastwater"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + beachSize / sumSize, c1: {r: 255, g: 255, b: 153}, c2: {r: 200, g: 120, b: 20}, name: "beach"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + valleySize / sumSize, c1: {r: 200, g: 120, b: 20}, c2: {r: 50, g: 150, b: 50}, name: "valley"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + greenSize / sumSize, c1: {r: 50, g: 150, b: 50}, c2: {r: 153, g: 76, b: 0}, name: "green"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + mountainSize / sumSize, c1: {r: 153, g: 76, b: 0}, c2: {r: 102, g: 51, b: 0}, name: "mountain"});
    landscape.push({maxV: landscape[landscape.length - 1].maxV + iceSize / sumSize, c1: {r: 102, g: 51, b: 0}, c2: {r: 255, g: 255, b: 255}, name: "ice"});

    var resData = this.newFilledArray(this.bmpResolutionX * this.bmpResolutionY, 0.0);
    var numRessources = this.sources.x.length;

    var renderHeight = bmpymax-bmpymin;
    var renderWidth = bmpxmax-bmpxmin;
    var ressourceItems = this.sourcesQuadTree.retrieve({x: bmpxmin, y: bmpymin, height: renderHeight, width: renderWidth});
    console.log("num ressource Items retrieved for bitmap"+ressourceItems.length)

    //for (var i = 0; i < numRessources; i++) {
    for (var i in ressourceItems) {
        //TODO: add for loop to add periodic boundaries: i.e use this.mapRenderer.gameCoord2RenderX(this.sources.x[i]+this.mapWidth,this.sources.y[i]+this.mapHeight)


        var x = ressourceItems[i].x;
        var y = ressourceItems[i].y;
        var r = ressourceItems[i].rGame;
        var v = ressourceItems[i].v;
        //var x = this.mapRenderer.gameCoord2RenderX(this.sources.x[i], this.sources.y[i]);
        //var y = this.mapRenderer.gameCoord2RenderY(this.sources.x[i], this.sources.y[i]);
        //var r = this.sources.r[i] * this.mapType.scale;
        //var v = this.sources.v[i];

        var xminRenderCoord = Math.floor(x - 2 * r * this.mapType.ratioWidthHeight);
        var xmaxRenderCoord = Math.ceil(x + 2 * r * this.mapType.ratioWidthHeight);
        var yminRenderCoord = Math.floor(y - 2 * r);
        var ymaxRenderCoord = Math.ceil(y + 2 * r);

        var xminBmpPixel = Math.max((xminRenderCoord - bmpxmin) / this.bmpToRenderScaling, 0);
        var xmaxBmpPixel = Math.min((xmaxRenderCoord - bmpxmax) / this.bmpToRenderScaling, this.bmpResolutionX);
        var yminBmpPixel = Math.max((yminRenderCoord - bmpymin) / this.bmpToRenderScaling, 0);
        var ymaxBmpPixel = Math.min((ymaxRenderCoord - bmpymax) / this.bmpToRenderScaling, this.bmpResolutionY);

        //create Gaussian with constants:
        var sigma = r / 5;
        var sigmaSqr2 = 2 * sigma * sigma;

        for (var bmpYpixel = yminBmpPixel; bmpYpixel < ymaxBmpPixel; bmpYpixel++) {
            var bmpYcoord = bmpYpixel * this.bmpToRenderScaling + bmpymin;
            var startOfRow = this.bmpResolutionX * bmpYpixel;
            for (var bmpXpixel = xminBmpPixel; bmpXpixel < xmaxBmpPixel; bmpXpixel++) {
                var bmpXcoord = bmpXpixel * this.bmpToRenderScaling + bmpxmin;
                var xDist = Math.abs(this.mapRenderer.renderCoord2GameX(bmpXcoord - x, bmpYcoord - y));
                var yDist = Math.abs(this.mapRenderer.renderCoord2GameY(bmpXcoord - x, bmpYcoord - y));
                var distSq = xDist*xDist + yDist*yDist;
                if (distSq < r * r) {
                    var startOfColumn = startOfRow + bmpXpixel;
                    resData[startOfColumn] = resData[startOfColumn] + v * Math.exp(- distSq / sigmaSqr2);
                }
            }

        }
    }

    //var mycanvas = document.getElementById('display');
    var mycanvas = document.createElement("canvas");
    mycanvas.width = this.bmpResolutionX;
    mycanvas.height = this.bmpResolutionY;
    var ctx = mycanvas.getContext("2d");
    //var imgData=ctx.getImageData(0,0,bmpWidth,bmpHeight);
    var imgData = ctx.createImageData(this.bmpResolutionX, this.bmpResolutionY);

    for (var yy = 0; yy < this.bmpResolutionY; yy++) {
        var startOfRow = this.bmpResolutionX * yy;
        for (var xx = 0; xx < this.bmpResolutionX; xx++) {
            var startOfPixel = (startOfRow + xx) * 4;
            var resDataScaled = resData[startOfRow + xx];

            if (false) {
                var resDataScaled = Math.round(255 * resDataScaled);
                imgData.data[startOfPixel] = resDataScaled; //r
                imgData.data[startOfPixel + 1] = 0; //g
                imgData.data[startOfPixel + 2] = 255 - resDataScaled; //b
            }
            else if (false) {
                var resDataColors = this.GetColour(resDataScaled, 0, 1);
                imgData.data[startOfPixel] = resDataColors.r * 255; //r
                imgData.data[startOfPixel + 1] = resDataColors.g * 255; //g
                imgData.data[startOfPixel + 2] = resDataColors.b * 255; //b
            }
            else {
                var i = 0;
                while (i < landscape.length - 1 && landscape[i].maxV < resDataScaled) {
                    i++;
                }
                var minV = (i == 0 ? 0 : landscape[i - 1].maxV);
                var a = (resDataScaled - minV) / (landscape[i].maxV - minV);
                imgData.data[startOfPixel] = landscape[i].c1.r * (1 - a) + landscape[i].c2.r * (a);
                imgData.data[startOfPixel + 1] = landscape[i].c1.g * (1 - a) + landscape[i].c2.g * (a);
                imgData.data[startOfPixel + 2] = landscape[i].c1.b * (1 - a) + landscape[i].c2.b * (a);

                //Add Noise
                imgData.data[startOfPixel] = imgData.data[startOfPixel] + noiseLevel * Math.random(); //r
                imgData.data[startOfPixel + 1] = imgData.data[startOfPixel + 1] + noiseLevel * Math.random(); //g
                imgData.data[startOfPixel + 2] = imgData.data[startOfPixel + 2] + noiseLevel * Math.random(); //b
            }

            //Alpha Channel
            imgData.data[startOfPixel + 3] = 255; //alpha
        }
    }

    ctx.putImageData(imgData, 0, 0);

    var bmp = new createjs.Bitmap(mycanvas);
    bmp.scaleX = this.bmpToRenderScaling;
    bmp.scaleY = this.bmpToRenderScaling;
    bmp.alpha = 0.5;
    return bmp;

};

RessourceMap.prototype.newFilledArray = function (len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

RessourceMap.prototype.GetColour = function (v, vmin, vmax) {
    var c = {r: 1, g: 1, b: 1};

    if (v < vmin)
        v = vmin;
    if (v > vmax)
        v = vmax;
    var dv = vmax - vmin;

    if (v < (vmin + 0.25 * dv)) {
        c.r = 0;
        c.g = 4 * (v - vmin) / dv;
    } else if (v < (vmin + 0.5 * dv)) {
        c.r = 0;
        c.b = 1 + 4 * (vmin + 0.25 * dv - v) / dv;
    } else if (v < (vmin + 0.75 * dv)) {
        c.r = 4 * (v - vmin - 0.5 * dv) / dv;
        c.b = 0;
    } else {
        c.g = 1 + 4 * (vmin + 0.75 * dv - v) / dv;
        c.b = 0;
    }

    return c;
}

RessourceMap.prototype.wrapIndex = function (i, i_max) {
    return ((i % i_max) + i_max) % i_max;
}
