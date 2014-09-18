var Minimap = function (stage,main_container,menu_container,canvas_size,eventRender){

     var self = this;
     this.stage = stage;
     this.main_container = main_container;
     this.menu_container = menu_container;
     this.canvas_size = canvas_size;
     this.eventRender = eventRender;

     this.mini_container = new createjs.Container();

     var x = this.canvas_size[1]*(4/5);
     var y = 0;
     var w = this.canvas_size[1]*(1/5);
     var h = w/2;

     this.frame = new createjs.Graphics();
     this.frame.setStrokeStyle(3);
     this.frame.beginFill("#F5F7C4").drawRect(x,y,w,h) ;


    this.diamond = new createjs.Graphics();
    this.diamond.setStrokeStyle(1);
    this.diamond.beginFill("#C0C0C0") ;

    var x2 = this.canvas_size[1]*(9/10);
    var y2 = 0;
    var halfMapWidth = this.canvas_size[1]*(1/10);
    var halfMapHeight = halfMapWidth/2;

    this.diamond .moveTo(x2,y2);
    var x2 = x2 - halfMapWidth;
    var y2 = y2 + halfMapHeight;
    this.diamond .lineTo(x2,y2);
    var x2 = x2 + halfMapWidth;
    var y2 = y2 + halfMapHeight;
    this.diamond.lineTo(x2,y2);
    var x2 = x2 + halfMapWidth;
    var y2 = y2 - halfMapHeight;
    this.diamond .lineTo(x2,y2);
    var x2 = x2 - halfMapWidth;
    var y2 = y2 - halfMapHeight;
    this.diamond .lineTo(x2,y2);


    this.dot = new createjs.Graphics();
    this.dot.setStrokeStyle(3);
    this.dot.beginFill("#ff0000").drawCircle(x2,halfMapHeight,3);

    this.map = new createjs.Shape(this.diamond);
    this.background= new createjs.Shape(this.frame);
    this.location = new createjs.Shape(this.dot);

    this.mini_container.addChild(this.background,this.map,this.location);
    this.mini_container.name = "miniM";

    this.menu_container.addChild(this.mini_container);

    this.map.addEventListener("mousedown", (function (evt) {
        self.moveOnMinimap(evt)
    }));

};

Minimap.prototype.moveOnMinimap = function(evt){

    var self = this;
    var mouseInMainCoord = this.stage.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    var xpos= mouseInMainCoord.x;
    var ypos= mouseInMainCoord.y;

    var minimapCenter = this.stage.globalToLocal(this.canvas_size[1]*(9/10),this.canvas_size[1]*(1/10)/2);

    var DistanceX = xpos-minimapCenter.x;
    var DistanceY = ypos-minimapCenter.y;
    this.location.x = DistanceX;
    this.location.y = DistanceY;

    var offset = this.mini2RenderCoords(DistanceX,DistanceY);

    this.main_container.x = -offset[0];
    this.main_container.y = -offset[1];

   self.eventRender();
}



Minimap.prototype.mini2RenderCoords = function(miniX,miniY) {

    var MinimapWidth  = this.canvas_size[1]*(1/5);
    var MapWidth = 30000*4;  // in px
    var Factor = Math.round(MapWidth/MinimapWidth);

    var mapX = - this.canvas_size[1]/2 + Math.round(miniX*Factor);
    var mapY = - this.canvas_size[0]/2 + Math.round(miniY*Factor);

    return [mapX,mapY];
}

Minimap.prototype.render2MiniCoords = function(renderX,renderY) {

    var MinimapWidth  = this.canvas_size[1]*(1/5);
    var MapWidth = 30000*4;     // in px
    var Factor = Math.round(MapWidth/MinimapWidth);

    var miniX =  (renderX/Factor) + (this.canvas_size[1]/2/Factor);
    var miniY =  (renderY/Factor) + (this.canvas_size[0]/2/Factor);

    return [miniX,miniY];
}
