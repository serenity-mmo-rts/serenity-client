
 // contains the container structure of Easeljs, zoom,  entry points of containers etc.*/
var MapContainer = function(mapId){

    var self = this;

    this.mapId = mapId;

    // initialize stage and minimap
    createjs.MotionGuidePlugin.install(createjs.Tween);
    this.stage = new createjs.Stage("canvas");
    createjs.Touch.enable(this.stage);

    // Containers
    this.zoom_container = new createjs.Container();
    this.main_container = new createjs.Container();
    this.menu_container = new createjs.Container();




    // movement outside
    this.stage.mouseMoveOutside = true;
    this.main_container.mouseMoveOutside = true;
    this.menu_container.mouseMoveOutside = true;


    // inherit
    this.zoom_container.addChild(this.main_container);
    this.stage.addChild(this.zoom_container,this.menu_container);

    // zoom levels
    this.zoomFactors = [0.05, 0.1, 0.2, 0.3486784401, 0.387420489, 0.43046721, 0.4782969, 0.531441, 0.59049, 0.6561, 0.729, 0.81, 0.9, 1, 1.1, 1.21, 1.331, 1.4641, 1.61051, 1.771561, 1.9487171, 2.14358881, 2.357947691, 2.5937424601];
    this.zoom_level = 13;
    this.zoom = this.zoomFactors[this.zoom_level];


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
}


 MapContainer.prototype.tick = function(evt) {
     this.map.tick();
 };



 MapContainer.prototype.MouseWheelHandler = function (e) {
     var self = this;
     var changedZoom = false;
     if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0)   {

         if (this.zoom_level <20) {
             this.zoom_level+=1;
             this.zoom = this.zoomFactors[this.zoom_level];
             changedZoom = true;
         }
     }

     else {
         if (this.zoom_level >0) {
             this.zoom_level-= 1;
             this.zoom = this.zoomFactors[this.zoom_level];
             changedZoom = true;
         }
     }

     if (changedZoom) {
         this.zoom_container.scaleX=this.zoom;
         this.zoom_container.scaleY=this.zoom;
         this.map.loadRessourceOverlay();
         this.map.checkRendering();
         self.stage.update();
     }

 };

 // if browser is resized draw menu again
 MapContainer.prototype.resize = function () {
     this.stage.canvas.height = window.innerHeight;
     this.stage.canvas.width = window.innerWidth;

     this.stage.regX = window.innerWidth / 2;
     this.stage.regY = window.innerHeight / 2;
     this.stage.x = window.innerWidth / 2;
     this.stage.y = window.innerHeight / 2;

     this.zoom_container.regX = window.innerWidth / 2;
     this.zoom_container.regY = window.innerHeight/ 2;
     this.zoom_container.x = window.innerWidth / 2;
     this.zoom_container.y = window.innerHeight / 2;

     this.main_container.regX = -window.innerWidth / 2;
     this.main_container.regY = -window.innerHeight / 2;

     this.map.resize();
 };
