
 // contains the container structure of Easeljs, zoom,  entry points of containers etc.*/
var MapContainer = function(layerView,mapId){

    var self = this;

    this.layerView = layerView;
    this.mapId = mapId;


    // initialize stage and minimap
    createjs.MotionGuidePlugin.install(createjs.Tween);
    this.stage = new createjs.Stage("canvas");
    this.stage.mouseMoveOutside = true;
    createjs.Touch.enable(this.stage);

    // Containers
    this.mapContainer = new createjs.Container();
    this.mapContainer.name = "mapContainer";
    this.mapContainer.mouseMoveOutside = true;

    this.zoomContainer = new createjs.Container();
    this.zoomContainer.name = "zoomContainer";
    this.zoomContainer.mouseMoveOutside = true;

    this.mainContainer = new createjs.Container();
    this.mainContainer.name = "mainContainer";
    this.mainContainer.mouseMoveOutside = true;

    this.zoomBgImageContainer = new createjs.Container();
    this.zoomBgImageContainer.name = "zoomBgImageContainer";
    this.zoomBgImageContainer.mouseMoveOutside = true;

    this.bgImageContainer = new createjs.Container();
    this.bgImageContainer.name = "bgImageContainer";
    this.bgImageContainer.mouseMoveOutside = true;

    this.menuContainer = new createjs.Container();
    this.menuContainer.name = "menuContainer";
    this.menuContainer.mouseMoveOutside = true;
    this.backgroundContainer = new createjs.Container();
    this.backgroundContainer.name = "backgroundContainer";
    this.backgroundContainer.mouseMoveOutside = true;

    // compose containers:
    this.zoomContainer.addChild(this.mainContainer,this.backgroundContainer);
    this.zoomBgImageContainer.addChild(this.bgImageContainer);
    this.mapContainer.addChild(this.zoomBgImageContainer, this.zoomContainer);
    this.stage.addChild(this.mapContainer,this.menuContainer);

    // zoom levels
    this.zoomLevel = -15;
    this.zoom = 1; //this.zoomFactors[this.zoomLevel];

    // Initialize Map
    this.map = new Map(this, this.stage,this.mapId);

    // Initialize map control
    this.mapControl = new MapControl(this.map);


    // mouse zoom
    var canvas = document.getElementById("canvas");
    canvas.onmousedown = function(event){
        event.preventDefault();
    };

    this.mousewheelCallback = function (evt) {
        self.MouseWheelHandler(evt)
    };
    this.DOMMouseScrollCallback = function (evt) {
        self.MouseWheelHandler(evt)
    };
    canvas.addEventListener("mousewheel", this.mousewheelCallback, false);
    canvas.addEventListener("DOMMouseScroll", this.DOMMouseScrollCallback, false);

    this.resize();
    this.updateZoom();
}


 MapContainer.prototype.tick = function(evt) {
     this.mapControl.tick();
     this.map.tick();
 };

 MapContainer.prototype.getMouseInGameCoord = function() {
     var pt = this.mainContainer.globalToLocal(this.stage.mouseX, this.stage.mouseY);
     var gameCoord = {
         x: this.map.renderCoord2GameX(pt.x, pt.y),
         y: this.map.renderCoord2GameY(pt.x, pt.y)
     };
     return gameCoord;
 }



 MapContainer.prototype.MouseWheelHandler = function (e) {
     var changedZoom = false;
     if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0)   {

         if (this.zoomLevel < 30) {
             this.zoomLevel+=1;
             changedZoom = true;
         }
     }

     else {
         if (this.zoomLevel > -30) {
             this.zoomLevel-= 1;
             changedZoom = true;
         }
     }

     if (changedZoom) {
         this.updateZoom();
     }

 };

 MapContainer.prototype.updateZoom = function () {

     this.zoom = Math.pow(1.1, this.zoomLevel);
     this.zoomContainer.scaleX = this.zoom;
     this.zoomContainer.scaleY = this.zoom;

     var zoomGround = Math.pow(1.1, this.zoomLevel * this.map.mapType.groundDragScaling);
     this.zoomBgImageContainer.scaleX = zoomGround;
     this.zoomBgImageContainer.scaleY = zoomGround;

     //this.map.resourceMap.addOverlay();
     //this.map.bgMap.addOverlay();
     this.map.checkRendering();

     this.stage.update();

 };

 // if browser is resized draw menu again
 MapContainer.prototype.resize = function () {
     this.stage.canvas.height = window.innerHeight;
     this.stage.canvas.width = window.innerWidth;

     this.stage.regX = window.innerWidth / 2;
     this.stage.regY = window.innerHeight / 2;
     this.stage.x = window.innerWidth / 2;
     this.stage.y = window.innerHeight / 2;

     this.mapContainer.regX = window.innerWidth / 2;
     this.mapContainer.regY = window.innerHeight/ 2;
     this.mapContainer.x = window.innerWidth / 2;
     this.mapContainer.y = window.innerHeight / 2;

     this.zoomContainer.regX = window.innerWidth / 2;
     this.zoomContainer.regY = window.innerHeight/ 2;
     this.zoomContainer.x = window.innerWidth / 2;
     this.zoomContainer.y = window.innerHeight / 2;

     this.zoomBgImageContainer.regX = window.innerWidth / 2;
     this.zoomBgImageContainer.regY = window.innerHeight/ 2;
     this.zoomBgImageContainer.x = window.innerWidth / 2;
     this.zoomBgImageContainer.y = window.innerHeight / 2;

     this.mainContainer.regX = -window.innerWidth / 2;
     this.mainContainer.regY = -window.innerHeight / 2;
     this.bgImageContainer.regX = -window.innerWidth / 2;
     this.bgImageContainer.regY = -window.innerHeight / 2;

     this.map.resize();
 };

 MapContainer.prototype.removeFromCanvas = function () {
     //this.stage.enableEvents(false);
     this.stage.autoClear = true; // This must be true to clear the stage.
     this.stage.removeAllChildren();
     this.stage.update();

     var canvas = document.getElementById("canvas");
     canvas.removeEventListener("mousewheel", this.mousewheelCallback);
     canvas.removeEventListener("DOMMouseScroll", this.DOMMouseScrollCallback);
 }

