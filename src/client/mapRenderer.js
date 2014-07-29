// loading layers
var Map = function(map_container,obj_container,gameData,mapId) {

    var self = this;

    this.gameData = gameData;
    this.mapId = mapId;
    this.map_container = map_container;
    this.obj_container = obj_container;
    this.spritesheets = {};
    this.bgImg;
    this.mapData = this.gameData.maps.hashList[this.mapId];
    this.mapType = this.gameData.mapTypes.hashList[this.mapData.mapTypeId];

    // create unique list of images to load:
    var imagesToLoadHashList = {}, imagesToLoad = [];
    for (var spritesheetId in gameData.spritesheets.hashList) {
        var spritesheet = gameData.spritesheets.hashList[spritesheetId];
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

    for (var spritesheetId in this.gameData.spritesheets.hashList) {
        this.spritesheets[spritesheetId] = new createjs.SpriteSheet(this.gameData.spritesheets.hashList[spritesheetId]);
    }

    for (mapObjectId in this.mapData.mapObjects.hashList) {
        this.addObject(this.mapData.mapObjects.hashList[mapObjectId]);
    }
    this.obj_container.sortChildren(function (a, b){ return a.y - b.y; });
};

Map.prototype.addObject = function(mapObject) {
    // create a new Bitmap for the object:
    var objType = this.gameData.objectTypes.hashList[mapObject.objTypeId];
    var objectBitmap = new createjs.BitmapAnimation(this.spritesheets[objType.spritesheetId]);
    objectBitmap.gotoAndStop(objType.spriteFrame);
    objectBitmap.x = this.gameCoord2RenderX(mapObject.x, mapObject.y);
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x, mapObject.y);

    //TODO: set bitmap scaling proportional to objType.initWidth / mapObject.width

    objectBitmap.mapObjectId = mapObjectId;
    mapObject.bitmap = objectBitmap;
    this.obj_container.addChild(objectBitmap);
}

Map.prototype.moveObjectToGameCoord = function(objId, x, y) {
    var mapObject = this.mapData.mapObjects.hashList[objId];
    var objectBitmap = mapObject.objectBitmap;
    mapObject.x = x;
    mapObject.y = y;
    objectBitmap.x = this.gameCoord2RenderX(mapObject.x, mapObject.y);
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x, mapObject.y);
}

Map.prototype.moveObjectToRenderCoord = function(objId, x, y) {
    var mapObject = this.mapData.mapObjects.hashList[objId];
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
    var gameX = (renderX / this.mapType.ratioWidthHeight + renderY) / this.mapType.scale;
    return gameX;
}

Map.prototype.renderCoord2GameY = function(renderX,renderY) {
    var gameY = (renderY - renderX / this.mapType.ratioWidthHeight) / this.mapType.scale;
    return gameY;
}