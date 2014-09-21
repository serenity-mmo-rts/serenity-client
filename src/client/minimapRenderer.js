var Minimap = function (stage,main_container,menu_container,gameData,mapId,canvas_size,eventRender){

     var self = this;
     this.stage = stage;
     this.main_container = main_container;
     this.menu_container = menu_container;
     this.gameData = gameData;
     this.mapId = mapId;
     this.canvas_size = canvas_size;
     this.eventRender = eventRender;

     this.mapsize = this.gameData.maps.get(this.mapId).width;

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

    var button_img1 = new Image();
    button_img1.src = "resources/icons/arrow_top_right.png";
    this.button1 = new createjs.Bitmap(button_img1);
    this.button1.x = x;
    this.button1.y = (w/2)-45;
    this.button1.name = "close";

    var button_img2 = new Image();
    button_img2.src = "resources/icons/arrow_bottom_left.png";
    this.button2 = new createjs.Bitmap(button_img2);
    this.button2.x =this.canvas_size[1] -(this.canvas_size[1]*(1/5))-48;
    this.button2.y =  +(this.canvas_size[1]*(1/10));
    this.button2.name = "open";
    this.button2.visible = false;

    this.map = new createjs.Shape(this.diamond);
    this.background= new createjs.Shape(this.frame);
    this.location = new createjs.Shape(this.dot);

    this.mini_container.addChild(this.background,this.map,this.location,this.button1,this.button2);
    this.mini_container.name = "miniM";

    this.menu_container.addChild(this.mini_container);

    this.button1.addEventListener("mousedown", (function (evt) {
        self.closeMinimap(evt)
    }));
    this.button2.addEventListener("mousedown", (function (evt) {
        self.openMinimap(evt)
    }));

    this.map.addEventListener("mousedown", (function (evt) {
        self.moveOnMinimap(evt)
    }));

};


Minimap.prototype.closeMinimap = function(tween) {

        var moveButton = createjs.Tween.get(this.mini_container, {loop:false}, true)
            .to({x:+this.canvas_size[1]*(1/5),y:-this.canvas_size[1]*(1/10)}, 500)
            .set({visible:false},this.button1)
            .set({visible:true},this.button2);

       // var remChild = this.mini_container.getChildByName("close");
       //this.mini_container.removeChild(remChild);
}

Minimap.prototype.openMinimap = function(tween) {

    var moveButton2 = createjs.Tween.get(this.mini_container, {loop:false}, true)
        .to({x:0,y:0}, 500)
        .set({visible:false},this.button2)
        .set({visible:true},this.button1);

}


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
    var MapWidth = this.mapsize*4;  // in px
    var Factor = Math.round(MapWidth/MinimapWidth);

    var mapX = - this.canvas_size[1]/2 + Math.round(miniX*Factor);
    var mapY = - this.canvas_size[0]/2 + Math.round(miniY*Factor);

    return [mapX,mapY];
}

Minimap.prototype.render2MiniCoords = function(renderX,renderY) {

    var MinimapWidth  = this.canvas_size[1]*(1/5);
    var MapWidth = this.mapsize*4;     // in px
    var Factor = Math.round(MapWidth/MinimapWidth);

    var miniX =  (renderX/Factor) + (this.canvas_size[1]/2/Factor);
    var miniY =  (renderY/Factor) + (this.canvas_size[0]/2/Factor);

    return [miniX,miniY];
}
