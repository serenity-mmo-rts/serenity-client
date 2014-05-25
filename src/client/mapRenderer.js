// loading layers
var Map = function(map_container,gameData,mapId) {

    var self = this;

    this.gameData = gameData;
    this.mapId = mapId;
    this.map_container = map_container;
    this.spritesheets = {};

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

    // use preloadJS to load the images:
    var queue = new createjs.LoadQueue(true);
    queue.addEventListener("complete", function() {self.createMap()});
    queue.loadManifest(imagesToLoad);
};


Map.prototype.createMap = function() {
    for (var spritesheetId in this.gameData.spritesheets.hashList) {
        this.spritesheets[spritesheetId] = new createjs.SpriteSheet(this.gameData.spritesheets.hashList[spritesheetId]);
    }

    for (mapObjectId in this.gameData.maps.hashList[this.mapId].mapObjects.hashList) {
        var mapObject = this.gameData.maps.hashList[this.mapId].mapObjects.hashList[mapObjectId];
        // create a new Bitmap for the object:
        var objType = this.gameData.objectTypes.hashList[mapObject.objTypeId];
        var objectBitmap = new createjs.BitmapAnimation(this.spritesheets[objType.spritesheetId]);
        objectBitmap.gotoAndStop(objType.spriteFrame);
        objectBitmap.x = 2 * (mapObject.x - mapObject.y);
        objectBitmap.y = mapObject.x + mapObject.y;
        this.map_container.addChild(objectBitmap);
    }
};
