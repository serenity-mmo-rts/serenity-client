
 // contains the container structure of Easeljs, zoom,  entry points of containers etc.*/
var MapContainer = function(mapId){

    var self = this;

    this.mapId = mapId;

    // initialize stage and minimap
    createjs.MotionGuidePlugin.install(createjs.Tween);
    this.stage = new createjs.Stage("canvas");
    this.minimap = new createjs.Stage("minimap");
    createjs.Touch.enable(this.stage);
    createjs.Touch.enable(this.minimap);


    // Containers
    this.zoom_container = new createjs.Container();
    this.main_container = new createjs.Container();
    this.menu_container = new createjs.Container();


    // registration  points
    this.stage.regX = window.innerWidth / 2;
    this.stage.regY = window.innerHeight / 2;
    this.zoom_container.regX = window.innerWidth / 2;
    this.zoom_container.regY = window.innerHeight/ 2;

    // x and y coords
    this.stage.x = window.innerWidth / 2;
    this.stage.y = window.innerHeight / 2;
    this.zoom_container.x = window.innerWidth / 2;
    this.zoom_container.y = window.innerHeight / 2;
    this.main_container.x = window.innerWidth / 2;
    this.main_container.y = window.innerHeight / 2;

    // movement outside
    this.minimap.mouseMoveOutside = true;
    this.stage.mouseMoveOutside = true;
    this.main_container.mouseMoveOutside = true;
    this.menu_container.mouseMoveOutside = true;


    // inherit
    this.zoom_container.addChild(this.main_container);
    this.stage.addChild(this.zoom_container,this.menu_container);

    // zoom levels
    this.zoomFactors = [0.3486784401, 0.387420489, 0.43046721, 0.4782969, 0.531441, 0.59049, 0.6561, 0.729, 0.81, 0.9, 1, 1.1, 1.21, 1.331, 1.4641, 1.61051, 1.771561, 1.9487171, 2.14358881, 2.357947691, 2.5937424601];
    this.zoom_level = 10;
    this.zoom = this.zoomFactors[this.zoom_level];


    // Initialize Map
    this.map = new Map(this.stage,this.main_container,this.mapId);


     //**Initialize Minimap
    // this.minimap = new Minimap(this.stage,this.main_container,this.menu_container,this.mapId,(function (x,y,list,zoom) {
    //    self.map.checkRendering(game.maps.get(self.mapId).mapObjects.hashList,self.main_container.x, self.main_container.y,self.zoom)
    // }));


    // Initialize map control
       this.mapControl = new MapControl(this.map,this.minimap);
    // Render stages once


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


   // this.minimap.update();
    // set FPS and setup tick
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function (evt) {self.stageTick(evt)});
    createjs.Ticker.addEventListener("tick", function (evt) {self.minimapTick(evt)});

}


MapContainer.prototype.stageTick = function(evt) {
   // var self = this;
    this.stage.update();


    /**var mouseInMainCoord = self.main_container.globalToLocal(self.stage.mouseX, self.stage.mouseY);
    $("#layerDebug").html(
        "self.zoom="+self.mapControl.zoom +
            "<br>window.innerWidth=" + window.innerWidth +
            "<br>window.innerHeight=" + window.innerHeight +
            "<br>mouseInMainCoord.x="+mouseInMainCoord.x +
            "<br>mouseInMainCoord.y="+mouseInMainCoord.y +
            "<br>main_container.x="+ -self.main_container.x +
            "<br>main_container.y="+ -self.main_container.y+
            "<br>stage.mouseX"+ self.stage.mouseX +
            "<br>stage.mouseX="+ self.stage.mouseY
    );


    if (self.moving || self.build) { // move object
        self.map.moveCurrentObject();
    }   **/
};

MapContainer.prototype.minimapTick = function(evt) {
    //var self = this;
    this.minimap.update();
};



 MapContainer.prototype.MouseWheelHandler = function (e) {
     var self = this;
     if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0)   {

         if (this.zoom_level <20) {
             this.zoom_level+=1;
             this.zoom = this.zoomFactors[this.zoom_level];
         }
     }

     else {
         if (this.zoom_level >0) {
             this.zoom_level-= 1;
             this.zoom = this.zoomFactors[this.zoom_level];
         }
     }

     this.zoom_container.scaleX=this.zoom;
     this.zoom_container.scaleY=this.zoom;

    self.stage.update();
 };

 // if browser is resized draw menu again
 MapContainer.prototype.resize = function () {
     this.stage.canvas.height = window.innerHeight;
     this.stage.canvas.width = window.innerWidth;
 };
