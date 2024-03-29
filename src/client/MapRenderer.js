// loading layers
var Map = function(mapContainer, stage,mapId) {

    var self = this;

    this.stage = stage;
    this.mapContainer = mapContainer;
    this.mainContainer = mapContainer.mainContainer;
    this.bgImageContainer = this.mapContainer.bgImageContainer;

    this.mapId = mapId;
    this.callbackFinishedLoading = null;
    this.tickCounter = 0;

    this.bgContainer = new createjs.Container();
    this.objBgContainer = new createjs.Container();
    this.objContainer = new createjs.Container();
    this.resContainer = new createjs.Container();
    this.movContainer = new createjs.Container();
    this.movUpContainer = new createjs.Container();

    this.bgContainer.mouseMoveOutside = true;
    this.objBgContainer.mouseMoveOutside = true;
    this.objContainer.mouseMoveOutside = true;
    this.resContainer.mouseMoveOutside = true;
    this.mainContainer.addChild(this.bgContainer,this.objBgContainer,this.objContainer,this.resContainer,this.movContainer,this.movUpContainer);

    this.moveUpSubscriptions = {};
    this.moveSubscriptions = {};

    this.resContainer.alpha = 0.5;

    this.layer = game.layers.get(this.mapId);
    this.mapData = this.layer;

    this.mapType = game.layerTypes.get(this.layer.mapTypeId());

    this.bgMap = new ResourceMap(this, this.mapData.mapProperties, this.mapId, this.bgContainer);
    //this.resourceMap = new ResourceMap(this, this.mapData.mapProperties, this.mapId, this.resContainer);

    this.bgMap.initQuadtree(this.resTypeId);
    //this.resourceMap.initQuadtree(this.resTypeId);

    this.bgMap.checkRendering();
    //this.resourceMap.checkRendering();

    //this.bgMap = new ResAndBgWrapper(this,this.bgContainer,this.mapId,"background");
    //this.resourceMap = new ResAndBgWrapper(this,this.resContainer,this.mapId,"resource");

    this.isPeriodic = this.mapType.isPeriodic;


    this.layer.mapData.objectChangedCallback = function(mapObject) {
        if (mapObject instanceof MapObject) {
            self.checkRenderingOfObject(mapObject);
            self.objContainer.sortChildren(function (a, b) {
                return a.y - b.y;
            });
        }
    };

    // create unique list of images to load:
    var imagesToLoadHashList = {};
    var imagesToLoad = [];

    // load background image:
    var bgFile = this.mapType.groundImage;
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

    // add background object to bgImageContainer
    var background = new createjs.Graphics();
    background.beginBitmapFill ( this.bgImg, repetition='repeat' );


    var halfMapWidth = this.layer.width()/2;
    var halfMapHeight = this.layer.height()/2;
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
    this.bgImageContainer.addChild(backgroundShape);

    this.layer.mapGenerator.renderBgObjects(this.objBgContainer);

    this.checkRendering();

    if (this.callbackFinishedLoading) this.callbackFinishedLoading();
};

Map.prototype.mapAreaChangedCallback = function(evt, objectOrItem) {
    if (objectOrItem instanceof MapObject) {
        this.checkRenderingOfObject(objectOrItem);
        this.objContainer.sortChildren(function (a, b) {
            return a.y - b.y;
        });
    }
};

Map.prototype.checkRendering = function(){

    var self = this;

    if (this.mapAreaListener) {
        this.layer.mapData.removeListenerForArea(this.mapAreaListener);
    }

    var listenX = this.renderCoord2GameX(this.mainContainer.x, this.mainContainer.y);
    var listenY = this.renderCoord2GameY(this.mainContainer.x, this.mainContainer.y);
    var radius = 0.5 * Math.max(window.innerWidth,window.innerHeight) / this.mapContainer.zoom;
    // here we check for circle collision because this is much faster in comparison to collision detections using the rotated screen rectangle in game coordinates
    var bounds = new Bounds().initCircle(listenX, listenY, radius);

    this.mapAreaListener = this.layer.mapData.addListenerForArea(function(evt,mapObj){
        self.mapAreaChangedCallback(evt,mapObj);
    }, bounds, true, true, true);

    var objectList = this.layer.mapData.mapObjects.hashList;
    var itemList = this.layer.mapData.items.hashList;

    for (var itemId in itemList) {
        // ToDO more checks whether item should be rendered or not (map listner, quadtree etc.)
        this.checkRenderingOfItem(itemList[itemId]);
    }

    var counter = 0;
    for (var mapObjectId in objectList) {
        counter++;
        this.checkRenderingOfObject(objectList[mapObjectId]);
    }

    var worldObjectList = this.layer.mapGenerator.getWorldObjects();
    for (var worldObjectId in worldObjectList) {
        counter++;
        this.checkRenderingOfObject(worldObjectList[worldObjectId]);
    }
    //console.log("counter="+counter)

    this.objContainer.sortChildren(function (a, b){ return a.y - b.y; });


    if (this.resourceMap != null) {
        this.resourceMap.checkRendering();
    }

    if (this.bgMap != null) {
        this.bgMap.checkRendering();
    }
}

Map.prototype.checkRenderingOfItem = function(item){


    // in case rendering is possible
    if (item.blocks.hasOwnProperty("Movable")){
        var self = this;
        if (!this.moveSubscriptions.hasOwnProperty(item._id())) {
            this.moveSubscriptions[item._id()]=item.blocks.Movable.isMoving.subscribe(function(newValue){
                if (newValue){
                    self.renderMovingItem(item);
                }
                else{
                    var toRemoveChild = self.movContainer.getChildByName(item._id());
                    if (toRemoveChild){
                        self.movContainer.removeChild(toRemoveChild);
                        //  else deltefromsubscrioption this.subscribtion[itemId].dispose();
                        //toRemoveChild.siubscription.dispose()
                    }
                }
            });
        }

        if (item.blocks.hasOwnProperty("SubObject")){
            if (!this.moveUpSubscriptions.hasOwnProperty(item._id())) {
                this.moveUpSubscriptions[item._id()]=item.blocks.Movable.isMovingUp.subscribe(function (newValue) {
                    if (newValue) {
                        self.renderMovingUpItem(item);
                    }
                    else {
                        var toRemoveChild = self.movUpContainer.getChildByName(item._id());
                        if (toRemoveChild) {
                            self.movUpContainer.removeChild(toRemoveChild);
                        }
                    }
                });
            }
        }
    }
};


Map.prototype.renderMovingUpItem =  function(item) {
    // get current position of item
    var currentPosition = {
        x: item.x(),
        y: item.y()
    };
    // render item on map
    var movingItem = new createjs.Sprite(uc.spritesheets[item.itemType.iconSpritesheetId]);
    movingItem.gotoAndStop(item.itemType.iconSpriteFrame);
    movingItem.x = this.gameCoord2RenderX(currentPosition.x,currentPosition.y);
    movingItem.y = this.gameCoord2RenderY(currentPosition.x,currentPosition.y);
    movingItem.originId = item.blocks.Movable.originId();
    movingItem.targetId = item.blocks.Movable.targetId();
    movingItem.name = item._id();
    movingItem._id = item._id();
    this.movUpContainer.addChild(movingItem);

    var targetCoords1 = {
        x: this.gameCoord2RenderX(currentPosition.x-50, currentPosition.y-50),
        y: this.gameCoord2RenderY(currentPosition.x-50, currentPosition.y-50)
    };
    var targetCoords2 = {
        x: this.gameCoord2RenderX(currentPosition.x-150, currentPosition.y-150),
        y: this.gameCoord2RenderY(currentPosition.x-150, currentPosition.y-150)
    };
    var targetCoords3 = {
        x: this.gameCoord2RenderX(currentPosition.x-300, currentPosition.y-300),
        y: this.gameCoord2RenderY(currentPosition.x-300, currentPosition.y-300)
    };
    var targetCoords3 = {
        x: this.gameCoord2RenderX(currentPosition.x-600, currentPosition.y-600),
        y: this.gameCoord2RenderY(currentPosition.x-600, currentPosition.y-600)
    };
    var targetCoords3 = {
        x: this.gameCoord2RenderX(currentPosition.x-1200, currentPosition.y-1200),
        y: this.gameCoord2RenderY(currentPosition.x-1200, currentPosition.y-1200)
    };
    createjs.Tween.get(movingItem,{override: true}).
        to(targetCoords1,item.blocks.Movable.movingUpTime/5).
        to(targetCoords2,item.blocks.Movable.movingUpTime/5).
        to(targetCoords3,item.blocks.Movable.movingUpTime/5).
        to(targetCoords3,item.blocks.Movable.movingUpTime/5).
        to(targetCoords3,item.blocks.Movable.movingUpTime/5);
};

Map.prototype.renderMovingItem =  function(item) {
    // get current position of item
    var currentPosition = item.blocks.Movable.getCurrentPositionOfItem(uc.layerView.lastTick);
    // render item on map
    var movingItem = new createjs.Sprite(uc.spritesheets[item.itemType.iconSpritesheetId]);
    movingItem.gotoAndStop(item.itemType.iconSpriteFrame);
    movingItem.x = this.gameCoord2RenderX(currentPosition.x,currentPosition.y);
    movingItem.y = this.gameCoord2RenderY(currentPosition.x,currentPosition.y);
    movingItem.originId = item.blocks.Movable.originId();
    movingItem.targetId = item.blocks.Movable.targetId();
    movingItem.name = item._id();
    movingItem._id = item._id();
    this.movContainer.addChild(movingItem);

    var target = this.layer.mapData.mapObjects.get(item.blocks.Movable.targetId());
    var targetCoords = {
        x: this.gameCoord2RenderX(target.x(),target.y()),
        y: this.gameCoord2RenderY(target.x(),target.y())
    };
    createjs.Tween.get(movingItem,{override: true}).to(targetCoords,item.blocks.Movable.travelTime);

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
    //console.log(".............")

    var camPosX = -this.mainContainer.x;
    var camPosY = -this.mainContainer.y;
    //console.log("camPosX="+camPosX + "  camPosY="+camPosY);
    //console.log("mapObject.x()="+mapObject.x() + "  mapObject.y()="+mapObject.y());

    var objRenderX = this.gameCoord2RenderXnearCam(mapObject.x(),mapObject.y());
    var objRenderY = this.gameCoord2RenderYnearCam(mapObject.x(),mapObject.y());

    //console.log("objRenderX="+objRenderX + "  objRenderY="+objRenderY);

    // TODO: add periodic boundaries:
    var DistanceX = Math.abs( objRenderX-camPosX);
    var DistanceY = Math.abs( objRenderY-camPosY);


    var isalreadyRendered  = false;
    var shouldbeRendered = false;

    //check if object is in gameData:
    if (this.layer.mapData.mapObjects.hashList.hasOwnProperty(mapObject._id())) {
        if(DistanceX <= 1.5*window.innerWidth/this.mapContainer.zoom && DistanceY <= 1.5*window.innerHeight/this.mapContainer.zoom) {
           if (mapObject.state() != State.HIDDEN && mapObject.activeOnLayer){
               shouldbeRendered = true;
           }
        }
    }

    //console.log("shouldbeRendered="+shouldbeRendered);

    var checkedObj = this.objContainer.getChildByName(mapObject._id());
    isalreadyRendered = this.objContainer.contains(checkedObj);

    if (isalreadyRendered && shouldbeRendered) {
        // check if coordinates are still correct:
        checkedObj.x = objRenderX;
        checkedObj.y = objRenderY;
    }
    else if (isalreadyRendered && !shouldbeRendered) {   // remove from rendering container
        this.objContainer.removeChild(checkedObj);
        //mapObject.onChangeCallback = [];
        mapObject.removeCallback("renderObj");
        mapObject.objectBitmap = [];
    }
    else if (!isalreadyRendered && shouldbeRendered) {   // add to rendering container
        this.renderObj(mapObject);
        var self = this;
       // mapObject.onChangeCallback = function() {self.renderObj(mapObject)};
        mapObject.addCallback("renderObj", function() {
            if (mapObject.state()==State.HIDDEN){
                self.removeFromRenderer(mapObject);
            }
            else{
                self.renderObj(mapObject);
                if (mapObject.className=="subObject") {   // check whether map object is a subObject and hence has to add to be placed callback
                    uc.layerView.uiPlaceItemMenu.handleSubscription(mapObject);
                    // disable subscription needs to be done
                }
            }


        });
    }
};


Map.prototype.removeFromRenderer = function(mapObject) {
    //remove if already in container:
    var checkedObj = this.objContainer.getChildByName(mapObject._id());
    if (checkedObj) {
        this.objContainer.removeChild(checkedObj);
    }

    if (mapObject.objectBitmap) {
        this.objContainer.removeChild(mapObject.objectBitmap);
    }
};

Map.prototype.renderObj = function(mapObject) {
    //remove if already in container:
    this.removeFromRenderer(mapObject);

    var objType = game.objectTypes.get(mapObject.objTypeId());

    if (mapObject.blocks.hasOwnProperty("Connection")) {

        var dx = 0.5 * mapObject.width() * Math.cos(-mapObject.ori());
        var dy = 0.5 * mapObject.width() * Math.sin(-mapObject.ori());

        var tmpX = this.gameCoord2RenderX(dx,dy);
        var tmpY = this.gameCoord2RenderY(dx,dy);

        var objectBitmap = new createjs.Shape();

        if (objType.spriteFrame instanceof Array){
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
                uc.layerView.testComponent.setDebugText(orientation.toString() + " mirror: " + mirror.toString() + " flip: " + flipUpDown.toString());

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
            var singleSpriteBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId]);
            singleSpriteBitmap.gotoAndStop(objType.spriteFrame[orientation]);
            singleSpriteBitmap.x = 50;
            singleSpriteBitmap.y = 25;
            var tmpstage = new createjs.Stage(singleImg);
            tmpstage.addChild(singleSpriteBitmap);
            tmpstage.update();

            */

            /* method 2: not working ... deprecated... use method below instead...
             var singleSpriteBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId]);
            singleSpriteBitmap.cache(-50, -25, 100, 50);
             var singleImg = singleSpriteBitmap.cacheCanvas;
             */

            /* method 3: easier by directly accessing the image field in the spritesheet: */
            //var singleImg = uc.spritesheets[objType.spritesheetId].frames[orientation].image;
            //var singleImg = uc.spritesheets[objType.spritesheetId].getFrame(orientation).image;



            var singleImg = new Image();
            singleImg.src = uc.spritesheets[objType.spritesheetId].getFrame(orientation).image.src;

            var test = this.IsImageOk(uc.spritesheets[objType.spritesheetId].getFrame(orientation).image);
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

            if (mapObject.state() == State.TEMP) {
                objectBitmap.graphics
                    .beginStroke("rgba(0,50,0,0.5)")
                    .setStrokeStyle(10)
                    .moveTo(-tmpX, -tmpY)
                    .lineTo(tmpX, tmpY)
                    .closePath();
            }
            else if (mapObject.state() == State.CONSTRUCTION) {
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
        if (objType.spriteAnimation !== null){

            if (mapObject.state() == State.TEMP) {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId], "working");
            }
            else if (mapObject.state() == State.CONSTRUCTION) {

                var construction = game.objectTypes.get("constructionSite");
                var objectBitmap = new createjs.Sprite(uc.spritesheets[construction.spritesheetId]);
                objectBitmap.gotoAndStop(construction.spriteFrame);
                objectBitmap.alpha = 1;
            }
            else {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId], "working");
            }

        }
        else {

            if (mapObject.state() == State.TEMP) {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId]);
                // render object from database
                // here could come a image cropping
                objectBitmap.gotoAndStop(objType.spriteFrame);
                objectBitmap.alpha = 0.7;
            }
            else if (mapObject.state() == State.CONSTRUCTION) {

                    var construction = game.objectTypes.get("constructionSite");
                    var objectBitmap = new createjs.Sprite(uc.spritesheets[construction.spritesheetId]);
                    objectBitmap.gotoAndStop(construction.spriteFrame);
                    objectBitmap.alpha = 1;

            }
            else {
                var objectBitmap = new createjs.Sprite(uc.spritesheets[objType.spritesheetId]);  // render object from database
                objectBitmap.gotoAndStop(objType.spriteFrame);
            }
            objectBitmap.tickEnabled = false;
        }
    }

    if (objType.spriteScaling) {
        objectBitmap.scaleX = objType.spriteScaling;
        objectBitmap.scaleY = objType.spriteScaling;
    }
    objectBitmap.x = this.gameCoord2RenderXnearCam(mapObject.x(), mapObject.y());
    objectBitmap.y = this.gameCoord2RenderYnearCam(mapObject.x(), mapObject.y());
    var self = this;
    mapObject.x.subscribe(function(newValue){
        objectBitmap.x = self.gameCoord2RenderXnearCam(mapObject.x(), mapObject.y());
        objectBitmap.y = self.gameCoord2RenderYnearCam(mapObject.x(), mapObject.y());
    });
    mapObject.y.subscribe(function(newValue){
        objectBitmap.x = self.gameCoord2RenderXnearCam(mapObject.x(), mapObject.y());
        objectBitmap.y = self.gameCoord2RenderYnearCam(mapObject.x(), mapObject.y());
    });

    objectBitmap.mapObjectId = ko.computed(function() {
        return mapObject._id();
    }, this);

    objectBitmap.name = mapObject._id();

    //TODO: set bitmap scaling proportional to objType.initWidth / mapObject.width

   // objectBitmap.mapObjectId = mapObject._id();
  //  objectBitmap.name = mapObject._id();


    mapObject.objectBitmap = objectBitmap;
    this.objContainer.addChild(objectBitmap);

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

Map.prototype.gameCoord2RenderXnearCam = function(gameX,gameY) {
    var renderX = this.gameCoord2RenderX(gameX,gameY);
    if (this.isPeriodic) {
        var camPosX = -this.mainContainer.x;
        var renderWidth = this.mapType.ratioWidthHeight * this.mapType.scale * this.layer.width();
        var renderX_toCam = renderX - camPosX + renderWidth/2;
        renderX_toCam = renderX_toCam.mod(renderWidth) - renderWidth/2;
        renderX = renderX_toCam + camPosX;
    }
    return renderX;
}

Map.prototype.gameCoord2RenderYnearCam = function(gameX,gameY) {
    var renderY = this.gameCoord2RenderY(gameX,gameY);
    if (this.isPeriodic) {
        var camPosY = -this.mainContainer.y;
        var renderHeight =  this.mapType.scale * this.layer.height();
        var renderY_toCam = renderY - camPosY + renderHeight/2;
        renderY_toCam = renderY_toCam.mod(renderHeight) - renderHeight/2;
        renderY = renderY_toCam + camPosY;
    }
    return renderY;
}

Map.prototype.gameCoord2RenderX = function(gameX,gameY) {
    var renderX = this.mapType.scale * this.mapType.ratioWidthHeight * (gameX - gameY);
    return renderX;
}

Map.prototype.gameCoord2RenderY = function(gameX,gameY) {
    var renderY = this.mapType.scale * (gameX + gameY);
    return renderY;
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

Map.prototype.renderCoord2GameX = function(renderX,renderY) {
    var gameX = (renderY + renderX/this.mapType.ratioWidthHeight) / (2*this.mapType.scale);
    if (this.isPeriodic) {
        gameX += this.layer.width() / 2;
        gameX.mod(this.layer.width());
        gameX -= this.layer.width() / 2;
    }
    return gameX;
}

Map.prototype.renderCoord2GameY = function(renderX,renderY) {
    var gameY = (renderY - renderX/this.mapType.ratioWidthHeight) / (2*this.mapType.scale);
    if (this.isPeriodic) {
        gameY += this.layer.height() / 2;
        gameY.mod(this.layer.height());
        gameY -= this.layer.height() / 2;
    }
    return gameY;
}


// move object
Map.prototype.moveTempObject = function () {
    var pt = this.mainContainer.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    this.moveObjectToRenderCoord(this.tempObj, pt.x, pt.y);
    this.resortObjects();
};


Map.prototype.resortObjects = function () {
    this.objContainer.sortChildren(function (a, b){ return a.y - b.y; });
}



// get object under mouse position
Map.prototype.getCurrentObject = function () {
    var l = this.objContainer.getNumChildren(); // Number of Objects
    for (var i = 0; i < l; i++) { // loop through all objects
        var child = this.objContainer.getChildAt(i);
        var pt = child.globalToLocal(this.stage.mouseX, this.stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            return child.mapObjectId();
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
        var child =  this.objContainer.getChildByName('tempObject');
        this.objContainer.removeChild(child);
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


