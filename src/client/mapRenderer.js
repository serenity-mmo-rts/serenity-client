// loading layers
var Map = function(mapContainer, stage,mapId) {

    var self = this;

    this.stage = stage;
    this.mapContainer = mapContainer;
    this.main_container = mapContainer.main_container;
    this.mapId = mapId;

    this.map_container = new createjs.Container();
    this.bg_container = new createjs.Container();
    this.obj_container = new createjs.Container();
    this.res_container = new createjs.Container();
    this.map_container.mouseMoveOutside = true;
    this.bg_container.mouseMoveOutside = true;
    this.obj_container.mouseMoveOutside = true;
    this.res_container.mouseMoveOutside = true;
    this.main_container.addChild(this.map_container,this.bg_container,this.obj_container,this.res_container);

    this.res_container.alpha = 0.5;


    var bgMapRenderer = (function(){
        var noiseLevel = 0;
        var time = 100;

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

        var convertToLandscape = function(resDataScaled){
            var c = {r: 1, g: 1, b: 1};

            var i = 0;
            while (i < landscape.length - 1 && landscape[i].maxV < resDataScaled) {
                i++;
            }
            var minV = (i == 0 ? 0 : landscape[i - 1].maxV);
            var a = (resDataScaled - minV) / (landscape[i].maxV - minV);
            c.r = landscape[i].c1.r * (1 - a) + landscape[i].c2.r * (a);
            c.g = landscape[i].c1.g * (1 - a) + landscape[i].c2.g * (a);
            c.b = landscape[i].c1.b * (1 - a) + landscape[i].c2.b * (a);

            if (noiseLevel) {
                //Add Noise
                c.r += noiseLevel * Math.random();
                c.g += noiseLevel * Math.random();
                c.b += noiseLevel * Math.random();
            }

            return c;
        };
        return convertToLandscape

    })();
    this.bgMapWrapper = new RessourceMapWrapper(this,this.bg_container,this.mapId,bgMapRenderer);

    this.ressourceMapWrapper = new RessourceMapWrapper(this,this.res_container,this.mapId);

    this.current_object;
    this.tempObj;
    this.tempObjBitmap;
    this.tempGameEvent;
    this.hit_object = false;

    this.spritesheets = {};
    this.bgImg;
    this.mapData = game.maps.get(this.mapId);
    this.mapType = game.mapTypes.get(this.mapData.mapTypeId);
    this.mapData.objectChangedCallback = function(mapObject) {
        self.checkRenderingOfObject(mapObject);
        self.obj_container.sortChildren(function (a, b){ return a.y - b.y; });
    };

    // create unique list of images to load:
    var imagesToLoadHashList = {}, imagesToLoad = [];
    for (var spritesheetId in game.spritesheets.hashList) {
        var spritesheet = game.spritesheets.hashList[spritesheetId];
        for (var i=0, l=spritesheet.images.length; i<l; i++ ) {
            if(!imagesToLoadHashList.hasOwnProperty(spritesheet.images[i])) {
                imagesToLoad.push(spritesheet.images[i]);
                imagesToLoadHashList[spritesheet.images[i]] = 1;
            }
        }
    }

    // load background image:
    var bgFile = this.mapType.groundImage;
    imagesToLoad.push(bgFile);
    this.bgImg = new Image();
    this.bgImg.src = bgFile;

    // use preloadJS to load the images:
    var queue = new createjs.LoadQueue(true);
    queue.addEventListener("complete", function() {self.createMap()});
    queue.loadManifest(imagesToLoad);
};


Map.prototype.createMap = function() {

    // add background object to map_container
    var background = new createjs.Graphics();
    background.beginBitmapFill ( this.bgImg, repetition='repeat' );


    var halfMapWidth = this.mapData.width/2;
    var halfMapHeight = this.mapData.height/2;
    var x = this.gameCoord2RenderX(-halfMapWidth,-halfMapHeight);
    var y = this.gameCoord2RenderY(-halfMapWidth,-halfMapHeight);
   // background.drawEllipse(x,y,this.mapData.width,this.mapData.height);

    background.moveTo(x,y);
    x = this.gameCoord2RenderX(-halfMapWidth,halfMapHeight);
    y = this.gameCoord2RenderY(-halfMapWidth,halfMapHeight);
    background.lineTo(x,y);
    x = this.gameCoord2RenderX(halfMapWidth,halfMapHeight);
    y = this.gameCoord2RenderY(halfMapWidth,halfMapHeight);
    background.lineTo(x,y);
    x = this.gameCoord2RenderX(halfMapWidth,-halfMapHeight);
    y = this.gameCoord2RenderY(halfMapWidth,-halfMapHeight);
    background.lineTo(x,y);
    background.closePath();


    var backgroundShape = new createjs.Shape(background);
    backgroundShape.x = 0;
    backgroundShape.y = 0;
    this.map_container.addChild(backgroundShape);

    // load spritesheets
    for (var spritesheetId in game.spritesheets.hashList) {
        this.spritesheets[spritesheetId] = new createjs.SpriteSheet(game.spritesheets.hashList[spritesheetId]);
    }

    this.checkRendering();


};

Map.prototype.checkRendering = function(){

    var objectList = game.maps.get(uc.layer.mapId).mapObjects.hashList;

    for (var mapObjectId in objectList) {
        this.checkRenderingOfObject(objectList[mapObjectId]);
    }

    this.obj_container.sortChildren(function (a, b){ return a.y - b.y; });

    if (this.ressourceMapWrapper != null) {
        this.ressourceMapWrapper.checkRendering();
    }
    if (this.bgMapWrapper != null) {
        this.bgMapWrapper.checkRendering();
    }
}

Map.prototype.checkRenderingOfObject = function(mapObject){

    var DistanceX = Math.abs(this.gameCoord2RenderX(mapObject.x,mapObject.y) +this.main_container.x);
    var DistanceY = Math.abs(this.gameCoord2RenderY(mapObject.x,mapObject.y) +this.main_container.y);
    var isalreadyRendered  = false;
    var shouldbeRendered = false;

    //check if object is in gameData:
    if (game.maps.get(uc.layer.mapId).mapObjects.hashList.hasOwnProperty(mapObject._id)) {
        if(DistanceX <= 1.5*window.innerWidth/this.mapContainer.zoom && DistanceY <= 1.5*window.innerHeight/this.mapContainer.zoom) {
            shouldbeRendered = true;
        }
    }

    var checkedObj = this.obj_container.getChildByName(mapObject._id);
    isalreadyRendered = this.obj_container.contains(checkedObj);

    if (isalreadyRendered && !shouldbeRendered) {   // remove from rendering container
        this.obj_container.removeChild(checkedObj);
    }
    else if (!isalreadyRendered && shouldbeRendered) {   // add to rendering container
        this.renderObj(mapObject);
    }

}

Map.prototype.renderObj = function(mapObject) {
    //remove if already in container:
    var checkedObj = this.obj_container.getChildByName(mapObject._id);
    if (checkedObj) {
        this.obj_container.removeChild(checkedObj);
    }
    // create a new Bitmap for the object:
    var objType = game.objectTypes.get(mapObject.objTypeId);
    var objectBitmap = new createjs.BitmapAnimation(this.spritesheets[objType.spritesheetId]);
    objectBitmap.gotoAndStop(objType.spriteFrame);
    objectBitmap.x = this.gameCoord2RenderX(mapObject.x, mapObject.y);
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x, mapObject.y);
    if (mapObject.state == mapObjectStates.TEMP) {
        objectBitmap.alpha = 0.7;
    }
    if (mapObject.state == mapObjectStates.WORKING) {
        objectBitmap.alpha = 0.3;
    }

    //TODO: set bitmap scaling proportional to objType.initWidth / mapObject.width

    objectBitmap.mapObjectId = mapObject._id;
    objectBitmap.name = mapObject._id;
    mapObject.objectBitmap = objectBitmap;
    this.obj_container.addChild(objectBitmap);

    return objectBitmap;
}

Map.prototype.moveObjectToGameCoord = function(mapObject, x, y) {
  //  var mapObject = this.mapData.mapObjects.hashList[objId];
    var objectBitmap = mapObject.objectBitmap;
    mapObject.x = x;
    mapObject.y = y;
    objectBitmap.x = this.gameCoord2RenderX(mapObject.x, mapObject.y);
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x, mapObject.y);
}

Map.prototype.moveObjectToRenderCoord = function(mapObject, x, y) {
  //  var mapObject = this.mapData.mapObjects.hashList[objId];
    var objectBitmap = mapObject.objectBitmap;
    objectBitmap.x = x;
    objectBitmap.y = y;
    mapObject.x = this.renderCoord2GameX(objectBitmap.x, objectBitmap.y);
    mapObject.y = this.renderCoord2GameY(objectBitmap.x, objectBitmap.y);
}

Map.prototype.gameCoord2RenderX = function(gameX,gameY) {
    var renderX = this.mapType.scale * this.mapType.ratioWidthHeight * (gameX - gameY);
    return renderX;
}

Map.prototype.gameCoord2RenderY = function(gameX,gameY) {
    var renderY = this.mapType.scale * (gameX + gameY);
    return renderY;
}

Map.prototype.renderCoord2GameX = function(renderX,renderY) {
    var gameX = (renderY + renderX/this.mapType.ratioWidthHeight) / (2*this.mapType.scale);
    return gameX;
}

Map.prototype.renderCoord2GameY = function(renderX,renderY) {
    var gameY = (renderY - renderX/this.mapType.ratioWidthHeight) / (2*this.mapType.scale);
    return gameY;
}


// move object
Map.prototype.moveTempObject = function () {
    var pt = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    this.moveObjectToRenderCoord(this.tempObj, pt.x, pt.y);
    this.obj_container.sortChildren(function (a, b){ return a.y - b.y; });
};




// get object under mouse position
Map.prototype.getCurrentObject = function () {
    var l = this.obj_container.getNumChildren(); // Number of Objects
    this.hit_object = false;
    for (var i = 0; i < l; i++) { // loop through all objects
        var child = this.obj_container.getChildAt(i);
        var pt = child.globalToLocal(this.stage.mouseX, this.stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            this.hit_object = true;
            this.current_object = child;
            this.currentlyBuildingBitmap = child;
        }
    }
    return(this.hit_object);
};



Map.prototype.addTempObj= function (tempObj) {

    this.tempObj = tempObj;

    this.tempObjBitmap = this.renderObj(this.tempObj);
    this.tempObjBitmap.mouseMoveOutside = true;

};


Map.prototype.deleteTempObj= function () {

    if (this.tempObj != undefined) {
        this.tempObj = null;
        var child =  this.obj_container.getChildByName('tempObject');
        this.obj_container.removeChild(child);
    }

};


Map.prototype.tick = function() {
    this.stage.update();
     if (this.tempObj != undefined) { // move object
       this.moveTempObject();
         if(this.tempGameEvent && this.tempGameEvent.isValid()) {
             this.tempObjBitmap.alpha = 1;
         }
         else {
             this.tempObjBitmap.alpha = 0.3;
         }
    }
};


Map.prototype.resize = function () {
    if (this.ressourceMapWrapper != null) {
        this.ressourceMapWrapper.resize();
    }
    if (this.bgMapWrapper != null) {
        this.bgMapWrapper.resize();
    }
};