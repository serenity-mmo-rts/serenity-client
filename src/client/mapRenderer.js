// loading layers
var Map = function(mapContainer, stage,mapId) {

    var self = this;

    this.stage = stage;
    this.mapContainer = mapContainer;
    this.main_container = mapContainer.main_container;
    this.bgImage_container = this.mapContainer.bgImage_container;

    this.mapId = mapId;
    this.callbackFinishedLoading = null
    this.tickCounter = 0;

    this.bg_container = new createjs.Container();
    this.obj_container = new createjs.Container();
    this.res_container = new createjs.Container();
    this.mov_container = new createjs.Container();

    this.bg_container.mouseMoveOutside = true;
    this.obj_container.mouseMoveOutside = true;
    this.res_container.mouseMoveOutside = true;
    this.main_container.addChild(this.bg_container,this.obj_container,this.res_container,this.mov_container);


    this.res_container.alpha = 0.5;


    this.bgMap = new ResAndBgWrapper(this,this.bg_container,this.mapId,"background");

    this.resourceMap = new ResAndBgWrapper(this,this.res_container,this.mapId,"resource");


    this.tempObj;
    this.tempObjBitmap;

    this.layer = game.layers.get(this.mapId);
    this.mapType = game.layerTypes.get(this.layer.mapTypeId);
    this.layer.mapData.objectChangedCallback = function(mapObject) {
        self.checkRenderingOfObject(mapObject);
        self.obj_container.sortChildren(function (a, b){ return a.y - b.y; });
    };

    // create unique list of images to load:
    var imagesToLoadHashList = {};
    var imagesToLoad = [];

    // load background image:
    var bgFile = this.mapType._groundImage;
    imagesToLoad.push({id: "bgimage", src:bgFile} );
    this.bgImg = null;

    // use preloadJS to load the images:
    this.loadqueue = new createjs.LoadQueue(false);
    this.loadqueue.addEventListener("complete", function() {self.createMap()});
    this.loadqueue.loadManifest(imagesToLoad);

};

Map.prototype.IsImageOk = function(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
        return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
}


Map.prototype.createMap = function() {

    this.bgImg = this.loadqueue.getResult("bgimage");

    // add background object to bgImage_container
    var background = new createjs.Graphics();
    background.beginBitmapFill ( this.bgImg, repetition='repeat' );


    var halfMapWidth = this.layer.width/2;
    var halfMapHeight = this.layer.height/2;
    var x = this.gameCoord2RenderX(-halfMapWidth,-halfMapHeight);
    var y = this.gameCoord2RenderY(-halfMapWidth,-halfMapHeight);
   // background.drawEllipse(x,y,this.layer.width,this.layer.height);

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
    this.bgImage_container.addChild(backgroundShape);

    this.checkRendering();

    if (this.callbackFinishedLoading) this.callbackFinishedLoading();
};

Map.prototype.checkRendering = function(){

    var objectList = this.layer.mapData.mapObjects.hashList;
    var itemList = this.layer.mapData.items.hashList;

    for (var itemId in itemList) {
        this.checkRenderingOfItem(itemList[itemId]);
    }

    for (var mapObjectId in objectList) {
        this.checkRenderingOfObject(objectList[mapObjectId]);
    }

    var worldObjectList = this.layer.mapGenerator.getWorldObjects();
    for (var worldObjectId in worldObjectList) {
        this.checkRenderingOfObject(worldObjectList[worldObjectId]);
    }

    this.obj_container.sortChildren(function (a, b){ return a.y - b.y; });


    if (this.resourceMap != null) {
        this.resourceMap.checkRendering();
    }

    if (this.bgMap != null) {
        this.bgMap.checkRendering();
    }
}

Map.prototype.checkRenderingOfItem = function(item){

    if (item._blocks.hasOwnProperty("Movable")){
        // ToDO more checks whether item should be rendered or not (quadtree etc.)

        if (item._blocks.Movable.isMoving()){
            this.renderItem(item);
        }
        else{
              var toRemoveChild = this.mov_container.getChildByName(item._id());
                if (toRemoveChild){
                    this.mov_container.removeChild(toRemoveChild);
                }
        }
    }
};

Map.prototype.renderItem =  function(item) {
    // get current position of item
    var currentPosition = item._blocks.Movable.getCurrentPositionOfItem(uc.layerView.lastTick);
    // render item on map
    var movingItem = new createjs.Sprite(uc.spritesheets[item._itemType._iconSpritesheetId]);
    movingItem.gotoAndStop(item._itemType._iconSpriteFrame);
    movingItem.x = this.gameCoord2RenderX(currentPosition.x,currentPosition.y);
    movingItem.y = this.gameCoord2RenderY(currentPosition.x,currentPosition.y);
    movingItem.originId = item._blocks.Movable.originId();
    movingItem.targetId = item._blocks.Movable.targetId();
    movingItem.name = item._id();
    movingItem.id = item._id();
    this.mov_container.addChild(movingItem);

    var target = this.layer.mapData.mapObjects.get(item._blocks.Movable.targetId());
    var targetCoords = {
        x: this.gameCoord2RenderX(target.x(),target.y()),
        y: this.gameCoord2RenderY(target.x(),target.y())
    };
    createjs.Tween.get(movingItem,{override: true}).to(targetCoords,item._blocks.Movable.travelTime);

    // TODO  create dashed line between origin and target ONLY on click
    // var shape = new createjs.Shape();
    // shape.graphics.setStrokeStyle(2).beginStroke("#ff0000").moveTo(origin.x(),origin.y()).lineTo(target.x(),target.y());
    // shape.graphics.dashedLineTo(100,100,200,300, 4);
    //  stage.addChild(shape);

};


Map.prototype.renderDashedLine =  function(x1, y1, x2, y2, dashLen) {
    this.moveTo(x1, y1);

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
};


Map.prototype.checkRenderingOfObject = function(mapObject){

    var DistanceX = Math.abs(this.gameCoord2RenderX(mapObject.x(),mapObject.y()) +this.main_container.x);
    var DistanceY = Math.abs(this.gameCoord2RenderY(mapObject.x(),mapObject.y()) +this.main_container.y);
    var isalreadyRendered  = false;
    var shouldbeRendered = false;

    //check if object is in gameData:
    if (this.layer.mapData.mapObjects.hashList.hasOwnProperty(mapObject._id())) {
        if(DistanceX <= 1.5*window.innerWidth/this.mapContainer.zoom && DistanceY <= 1.5*window.innerHeight/this.mapContainer.zoom) {
           if (mapObject.state() != mapObjectStates.HIDDEN){
               shouldbeRendered = true;
           }
        }
    }

    var checkedObj = this.obj_container.getChildByName(mapObject._id());
    isalreadyRendered = this.obj_container.contains(checkedObj);

    if (isalreadyRendered && !shouldbeRendered) {   // remove from rendering container
        this.obj_container.removeChild(checkedObj);
        //mapObject.onChangeCallback = [];
        mapObject.removeCallback("renderObj");
        mapObject.objectBitmap = [];
    }
    else if (!isalreadyRendered && shouldbeRendered) {   // add to rendering container
        this.renderObj(mapObject);
        var self = this;
       // mapObject.onChangeCallback = function() {self.renderObj(mapObject)};
        mapObject.addCallback("renderObj", function() {self.renderObj(mapObject)})
    }


};

Map.prototype.renderObj = function(mapObject) {
    //remove if already in container:
    var checkedObj = this.obj_container.getChildByName(mapObject._id());
    if (checkedObj) {
        this.obj_container.removeChild(checkedObj);
    }

    if (mapObject.objectBitmap) {
        this.obj_container.removeChild(mapObject.objectBitmap);
    }

    var objType = game.objectTypes.get(mapObject.objTypeId());

    if (mapObject._blocks.hasOwnProperty("Connection")) {

        var dx = 0.5 * mapObject.width() * Math.cos(-mapObject.ori());
        var dy = 0.5 * mapObject.width() * Math.sin(-mapObject.ori());

        var tmpX = this.gameCoord2RenderX(dx,dy);
        var tmpY = this.gameCoord2RenderY(dx,dy);

        var objectBitmap = new createjs.Shape();

        if (objType._spriteFrame instanceof Array){
            // mapObject.ori is between -pi to pi

            var pi = Math.PI;
            var orientation = mapObject.ori();
            orientation -= pi/4;
            if (orientation<-pi) {
                orientation += 2 * pi;
            }

            var flipUpDown = false;
            if (orientation<0) {
                flipUpDown = true;
                orientation += 2 * pi;
            }
            orientation = orientation % pi;
            // now from 0 to pi

            var mirror = false;
            if (orientation > pi/2) {
                mirror = true;
                orientation = pi - orientation;
            }

            if (uc.layerView.uiGlobalMenu)
                uc.layerView.uiGlobalMenu.setDebugText(orientation.toString() + " mirror: " + mirror.toString() + " flip: " + flipUpDown.toString());

            orientation = Math.round(12*orientation/pi);
            // the result should be a number between 0 and 6
            //


            if (orientation>6)
                orientation=6;
            if (orientation<0)
                orientation=0;

            /* method 1: deprecated... use method below instead...

            // load the sprite and render to a temporary canvas to extract bitmap:
            var singleImg = document.createElement("canvas");
            singleImg.width = 100;
            singleImg.height = 50;
            var ctx = singleImg.getContext("2d");
            var singleSpriteBitmap = new createjs.Sprite(uc.spritesheets[objType._spritesheetId]);
            singleSpriteBitmap.gotoAndStop(objType._spriteFrame[orientation]);
            singleSpriteBitmap.x = 50;
            singleSpriteBitmap.y = 25;
            var tmpstage = new createjs.Stage(singleImg);
            tmpstage.addChild(singleSpriteBitmap);
            tmpstage.update();

            */

            /* method 2: not working ... deprecated... use method below instead...
             var singleSpriteBitmap = new createjs.Sprite(uc.spritesheets[objType._spritesheetId]);
            singleSpriteBitmap.cache(-50, -25, 100, 50);
             var singleImg = singleSpriteBitmap.cacheCanvas;
             */

            /* method 3: easier by directly accessing the image field in the spritesheet: */
            //var singleImg = uc.spritesheets[objType._spritesheetId]._frames[orientation].image;
            //var singleImg = uc.spritesheets[objType._spritesheetId].getFrame(orientation).image;



            var singleImg = new Image();
            singleImg.src = uc.spritesheets[objType._spritesheetId].getFrame(orientation).image.src;

            var test = this.IsImageOk(uc.spritesheets[objType._spritesheetId].getFrame(orientation).image);
            //console.log("image loaded:" + test.toString());

            if (!test){
                return objectBitmap;
            }
            var width = 2*Math.sqrt( tmpX*tmpX + tmpY*tmpY );
            var g = objectBitmap.graphics;
            g.beginBitmapFill( singleImg,  "repeat" );
            g.rect(-width/2, 0, width, 50);

            var renderAngle = Math.atan2(tmpY, tmpX);
            objectBitmap.rotation = 180*renderAngle/Math.PI;

            if (flipUpDown) {
                if (mirror) {
                    // bottom left
                    objectBitmap.scaleX = -1;
                    objectBitmap.scaleY = 1;
                }
                else {
                    // bottom right
                    objectBitmap.scaleX = -1;
                    objectBitmap.scaleY = -1;
                }
            }
            else {
                if (mirror) {
                    //top left
                    objectBitmap.scaleX = 1;
                    objectBitmap.scaleY = -1;
                }
                else {
                    // top right
                    objectBitmap.scaleX = 1;
                    objectBitmap.scaleY = 1;
                }
            }
        }
        else {
            var objectBitmap = new createjs.Shape();

            if (mapObject.state() == mapObjectStates.TEMP) {
                objectBitmap.graphics
                    .beginStroke("rgba(0,50,0,0.5)")
                    .setStrokeStyle(10)
                    .moveTo(-tmpX, -tmpY)
                    .lineTo(tmpX, tmpY)
                    .closePath();
            }
            else if (mapObject.state() == mapObjectStates.WORKING) {
                objectBitmap.graphics
                    .beginStroke("rgba(130,130,130,1)")
                    .setStrokeStyle(10)
                    .moveTo(-tmpX, -tmpY)
                    .lineTo(tmpX, tmpY)
                    .closePath();
            }
            else {
                objectBitmap.graphics
                    .beginStroke("rgba(0,0,0,1)")
                    .setStrokeStyle(10)
                    .moveTo(-tmpX, -tmpY)
                    .lineTo(tmpX, tmpY)
                    .closePath();
            }
        }
    }
    else {
        if (objType._spriteAnimation !== null){
            var objectBitmap = new createjs.Sprite(uc.spritesheets[objType._spritesheetId], "working");
        }
        else {

            if (mapObject.state() == mapObjectStates.TEMP) {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType._spritesheetId]);  // render object from database
                // here could come a image cropping
                objectBitmap.gotoAndStop(objType._spriteFrame);
                objectBitmap.alpha = 0.7;
            }
            else if (mapObject.state() == mapObjectStates.WORKING) {
                    var construction = game.objectTypes.get("constructionSite");
                    var objectBitmap = new createjs.Sprite(uc.spritesheets[construction._spritesheetId]);
                    objectBitmap.gotoAndStop(construction._spriteFrame);
                    objectBitmap.alpha = 1;

            }
            else {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType._spritesheetId]);  // render object from database
                objectBitmap.gotoAndStop(objType._spriteFrame);
            }
            objectBitmap.tickEnabled = false;
        }
    }

    objectBitmap.x = this.gameCoord2RenderX(mapObject.x(), mapObject.y());
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x(), mapObject.y());

    //TODO: set bitmap scaling proportional to objType._initWidth / mapObject._width

    objectBitmap.mapObjectId = mapObject._id();
    objectBitmap.name = mapObject._id();
    mapObject.objectBitmap = objectBitmap;
    this.obj_container.addChild(objectBitmap);

    return objectBitmap;
}

Map.prototype.moveObjectToGameCoord = function(mapObject, x, y) {
  //  var mapObject = this.layer.mapData.mapObjects.hashList[objId];
    var objectBitmap = mapObject.objectBitmap;
    mapObject.x = x;
    mapObject.y = y;
    objectBitmap.x = this.gameCoord2RenderX(mapObject.x, mapObject.y);
    objectBitmap.y = this.gameCoord2RenderY(mapObject.x, mapObject.y);
}

Map.prototype.moveObjectToRenderCoord = function(mapObject, x, y) {
  //  var mapObject = this.layer.mapData.mapObjects.hashList[objId];
    var objectBitmap = mapObject.objectBitmap;
    objectBitmap.x = x;
    objectBitmap.y = y;
    mapObject.x = this.renderCoord2GameX(objectBitmap.x, objectBitmap.y);
    mapObject.y = this.renderCoord2GameY(objectBitmap.x, objectBitmap.y);
}

Map.prototype.gameCoord2RenderX = function(gameX,gameY) {
    var renderX = this.mapType._scale * this.mapType._ratioWidthHeight * (gameX - gameY);
    return renderX;
}

Map.prototype.gameCoord2RenderY = function(gameX,gameY) {
    var renderY = this.mapType._scale * (gameX + gameY);
    return renderY;
}

Map.prototype.renderCoord2GameX = function(renderX,renderY) {
    var gameX = (renderY + renderX/this.mapType._ratioWidthHeight) / (2*this.mapType._scale);
    return gameX;
}

Map.prototype.renderCoord2GameY = function(renderX,renderY) {
    var gameY = (renderY - renderX/this.mapType._ratioWidthHeight) / (2*this.mapType._scale);
    return gameY;
}


// move object
Map.prototype.moveTempObject = function () {
    var pt = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    this.moveObjectToRenderCoord(this.tempObj, pt.x, pt.y);
    this.resortObjects();
};


Map.prototype.resortObjects = function () {
    this.obj_container.sortChildren(function (a, b){ return a.y - b.y; });
}



// get object under mouse position
Map.prototype.getCurrentObject = function () {
    var l = this.obj_container.getNumChildren(); // Number of Objects
    for (var i = 0; i < l; i++) { // loop through all objects
        var child = this.obj_container.getChildAt(i);
        var pt = child.globalToLocal(this.stage.mouseX, this.stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            return child.mapObjectId;
        }
    }
    return false;
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

    // update progess of map objects. chance bitmap input

    this.stage.update();
    if (this.tempObj != undefined) { // move object

    }
};


Map.prototype.resize = function () {
    if (this.resourceMap != null) {
        this.resourceMap.resize();
    }
    if (this.bgMap != null) {
        this.bgMap.resize();
    }};


