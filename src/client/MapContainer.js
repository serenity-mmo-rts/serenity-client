
 // contains the container structure of Easeljs, zoom,  entry points of containers etc.*/
var MapContainer = function(mapId){

    var self = this;

    this.mapId = mapId;


    // initialize stage and minimap
    createjs.MotionGuidePlugin.install(createjs.Tween);
    this.stage = new createjs.Stage("canvas");
    this.stage.mouseMoveOutside = true;
    createjs.Touch.enable(this.stage);

    // Containers
    this.map_container = new createjs.Container();
    this.map_container.name = "map_container";
    this.map_container.mouseMoveOutside = true;

    this.zoom_container = new createjs.Container();
    this.zoom_container.name = "zoom_container";
    this.zoom_container.mouseMoveOutside = true;

    this.main_container = new createjs.Container();
    this.main_container.name = "main_container";
    this.main_container.mouseMoveOutside = true;

    this.zoomBgImage_container = new createjs.Container();
    this.zoomBgImage_container.name = "zoomBgImage_container";
    this.zoomBgImage_container.mouseMoveOutside = true;

    this.bgImage_container = new createjs.Container();
    this.bgImage_container.name = "bgImage_container";
    this.bgImage_container.mouseMoveOutside = true;

    this.menu_container = new createjs.Container();
    this.menu_container.name = "menu_container";
    this.menu_container.mouseMoveOutside = true;

    // compose containers:
    this.zoom_container.addChild(this.main_container);
    this.zoomBgImage_container.addChild(this.bgImage_container);
    this.map_container.addChild(this.zoomBgImage_container, this.zoom_container);
    this.stage.addChild(this.map_container,this.menu_container);

    // zoom levels
    this.zoom_level = 0;
    this.zoom = 1; //this.zoomFactors[this.zoom_level];

    // Initialize Map
    this.map = new Map(this, this.stage,this.mapId);

    // Initialize map control
    this.mapControl = new MapControl(this.map);


    // mouse zoom
    var canvas = document.getElementById("canvas");
    canvas.onmousedown = function(event){
        event.preventDefault();
    };
    canvas.addEventListener("mousewheel", (function (evt) {
        self.MouseWheelHandler(evt)
    }), false);
    canvas.addEventListener("DOMMouseScroll", (function (evt) {
        self.MouseWheelHandler(evt)
    }), false);

    this.resize();
    this.updateZoom();
}


 MapContainer.prototype.tick = function(evt) {
     this.mapControl.tick();
     this.map.tick();
 };

 MapContainer.prototype.getMouseInGameCoord = function() {
     var pt = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
     var gameCoord = {
         x: this.map.renderCoord2GameX(pt.x, pt.y),
         y: this.map.renderCoord2GameY(pt.x, pt.y)
     };
     return gameCoord;
 }



 MapContainer.prototype.MouseWheelHandler = function (e) {
     var changedZoom = false;
     if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0)   {

         if (this.zoom_level < 30) {
             this.zoom_level+=1;
             changedZoom = true;
         }
     }

     else {
         if (this.zoom_level > -30) {
             this.zoom_level-= 1;
             changedZoom = true;
         }
     }

     if (changedZoom) {
         this.updateZoom();
     }

 };

 MapContainer.prototype.updateZoom = function () {

     this.zoom = Math.pow(1.1, this.zoom_level);
     this.zoom_container.scaleX = this.zoom;
     this.zoom_container.scaleY = this.zoom;

     var zoomGround = Math.pow(1.1, this.zoom_level * this.map.mapType._groundDragScaling);
     this.zoomBgImage_container.scaleX = zoomGround;
     this.zoomBgImage_container.scaleY = zoomGround;

         this.map.ressourceMapWrapper.loadRessourceOverlay();
         this.map.bgMapWrapper.loadRessourceOverlay();
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

     this.map_container.regX = window.innerWidth / 2;
     this.map_container.regY = window.innerHeight/ 2;
     this.map_container.x = window.innerWidth / 2;
     this.map_container.y = window.innerHeight / 2;

     this.zoom_container.regX = window.innerWidth / 2;
     this.zoom_container.regY = window.innerHeight/ 2;
     this.zoom_container.x = window.innerWidth / 2;
     this.zoom_container.y = window.innerHeight / 2;

     this.zoomBgImage_container.regX = window.innerWidth / 2;
     this.zoomBgImage_container.regY = window.innerHeight/ 2;
     this.zoomBgImage_container.x = window.innerWidth / 2;
     this.zoomBgImage_container.y = window.innerHeight / 2;

     this.main_container.regX = -window.innerWidth / 2;
     this.main_container.regY = -window.innerHeight / 2;
     this.bgImage_container.regX = -window.innerWidth / 2;
     this.bgImage_container.regY = -window.innerHeight / 2;

     this.map.resize();
 };

 MapContainer.prototype.removeFromCanvas = function () {
     //this.stage.enableEvents(false);
     this.stage.autoClear = true; // This must be true to clear the stage.
     this.stage.removeAllChildren();
     this.stage.update();
 }

