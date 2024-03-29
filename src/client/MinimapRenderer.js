var Minimap = function(layerView){
    var self = this;
    this.layerView = layerView;
    this.targetDepth = 8;

    this.rgbMapName = this.layerView.rgbMapName;
    this.rgbMapName.subscribe(function() {
        self.draw();
    });

    this.w = 256;
    this.h = this.w/2;

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = this.w + "px";
    this.canvas.id = "minimap";
    this.canvas.border = "none";

};


/**
 * call this function only after the canvas in the constructor was added to the DOM!!!
 */
Minimap.prototype.init = function() {

    this.stage = new createjs.Stage("minimap");
    createjs.Touch.enable(this.stage);
    this.stage.regX = 0;
    this.stage.regY = 0;
    this.stage.y = 0;
    this.stage.x = 0;
    this.stage.mouseMoveOutside = true;
};

Minimap.prototype.setMapControl = function(mapControl) {

    this.mapControl = mapControl;

    this.draw();
    this.addEvents();
};




Minimap.prototype.draw= function() {

    // first remove everything from the minimap:
    this.stage.removeAllChildren();

    this.mapId  = this.mapControl.map.mapId;
    this.layer = game.layers.get(this.mapId);

    $(function() {
        $("#minimap").width(this.w).height(this.h);
    });

    var MapWidth = this.layer.width;
    this.factor =(MapWidth/this.w);


    this.miniContainer = new createjs.Container();
    this.gameContainer = new createjs.Container();
    this.gameContainer.scaleX = 1/this.factor;
    this.gameContainer.scaleY = 1/this.factor;

    if (this.layer.mapGenerator instanceof PlanetGenerator) {
        this.bgMap = this.genBitmapFromPlanetGenerator(this.targetDepth);
        this.bgMap.name = "minimap";
        this.bgMap.x = 10;
        this.bgMap.y = 10;
        this.bgMap.regX = 0;
        this.bgMap.regY = 0;
        this.bgMap.scaleX = 1;
        this.bgMap.scaleY = 1;

        this.miniContainer.addChild(this.bgMap, this.gameContainer);
        this.stage.addChild(this.miniContainer);
    }
    else {
        // TODO add minimap rendering of layer without DS map generation

    }
};


Minimap.prototype.genBitmapFromPlanetGenerator = function(targetDepth) {

    var xpos = 0;
    var ypos = 0;
    var width = Math.pow(2,targetDepth);
    var height = Math.pow(2,targetDepth);

    var tmpMapGenerator = this.layer.mapGenerator.getSeededCopy();
    var rgb = tmpMapGenerator.getMatrix(xpos, ypos, width, height, targetDepth, this.rgbMapName()); // x,y, width, height, depth

    var mycanvas = document.createElement("canvas");
    mycanvas.width = width;
    mycanvas.height = height / 2;
    var ctx = mycanvas.getContext("2d");
    var imgData = ctx.createImageData(width, height / 2);

    var r = rgb.r;
    var g = rgb.g;
    var b = rgb.b;
    var sizeX = rgb.sizeX;
    var data = imgData.data;

    for (var yDest = 0, ySource = 0; yDest < height / 2; yDest++, ySource += 2) {
        var startOfRowDest = width * yDest;
        var startOfRowSource = sizeX * ySource;
        for (var xDest = 0, xSource = 0; xDest < width; xDest++, xSource++) {
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
    return bmp;

}


Minimap.prototype.removeEvents = function(){
    this.gameContainer.removeAllEventListeners(["mousedown"]);
}


Minimap.prototype.addEvents= function(){
    var self = this;
    this.gameContainer.addEventListener("mousedown", (function (evt) {
        self.moveOnMinimap(evt)
    }));

}

Minimap.prototype.tick= function(evt) {

    this.stage.update();

}



Minimap.prototype.moveOnMinimap = function(evt){

    var self = this;
    var mouseInMiniCoord = this.gameContainer.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    var xpos= mouseInMiniCoord.x;
    var ypos= mouseInMiniCoord.y;
    var minimapCenter = this.stage.globalToLocal(this.halfMapWidth,this.halfMapHeight);
    var DistanceX = xpos-minimapCenter.x;
    var DistanceY = ypos-minimapCenter.y;
    this.location.x = DistanceX;
    this.location.y = DistanceY;
    this.mapControl.mainContainer.x = -DistanceX;
    this.mapControl.mainContainer.y = -DistanceY;
    this.mapControl.map.checkRendering()
    //var offset = this.mini2RenderCoords(DistanceX,DistanceY);

}


Minimap.prototype.resize = function () {

    $(this.canvas).width(this.w).height(this.h);

};

