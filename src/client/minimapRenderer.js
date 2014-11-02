var Minimap = function (minimap,mapControl){

    var self = this;

    this.stage= minimap;
    this.mapControl = mapControl;

    this.size = 4;


    this.draw(this.stage,this.mapControl);
    this.addEvents();
};


Minimap.prototype.draw= function(stage,mapControl) {

    this.stage = stage;
    this.mapControl = mapControl;
    this.main_container = this.mapControl.main_container;
    this.mapId  = this.mapControl.map.mapId;
    this.mini_container = new createjs.Container();


    var currsize = window.innerWidth/this.size;
    var maxwidth = 1600;//screen.width;
    var broswersize =  maxwidth / window.innerWidth;
    var error =(currsize/this.size);


    this.x = 0;
    this.y = 0;
    this.w = currsize;
    this.h = this.w/2;

    $(function() {
        $("#minimap").width(currsize).height(currsize/2);
    });

     var MapWidth = (game.maps.get(this.mapId).width)* this.size;

   this.factor =(MapWidth/currsize);
   this.mini_container.scaleX = 1/this.factor;
   this.mini_container.scaleY = 1/this.factor;


    this.frame = new createjs.Graphics();
    this.frame.setStrokeStyle(3);
    this.frame.beginFill("#F5F7C4").drawRect(this.x,this.y,(this.w-error)*broswersize*this.factor,this.h*broswersize*this.factor) ;

    this.diamond = new createjs.Graphics();
    this.diamond.setStrokeStyle(1);
    this.diamond.beginFill("#C0C0C0") ;


    this.halfMapWidth = ((this.w-error)*broswersize*this.factor)/2;
    this.halfMapHeight = this.halfMapWidth/2;
    var x2 = this.halfMapWidth;
    var y2 = 0;

    this.diamond .moveTo(x2,y2);
    var x2 = x2 - this.halfMapWidth;
    var y2 = y2 + this.halfMapHeight;
    this.diamond .lineTo(x2,y2);
    var x2 = x2 + this.halfMapWidth;
    var y2 = y2 + this.halfMapHeight;
    this.diamond.lineTo(x2,y2);
    var x2 = x2 + this.halfMapWidth;
    var y2 = y2 - this.halfMapHeight;
    this.diamond .lineTo(x2,y2);
    var x2 = x2 - this.halfMapWidth;
    var y2 = y2 - this.halfMapHeight;
    this.diamond .lineTo(x2,y2);

    this.dot = new createjs.Graphics();
    this.dot.setStrokeStyle(3);
    this.dot.beginFill("#ff0000").drawCircle(this.halfMapWidth,this.halfMapHeight,3*this.factor);

    this.map = new createjs.Shape(this.diamond);
    this.background= new createjs.Shape(this.frame);
    this.location = new createjs.Shape(this.dot);

    this.mini_container.addChild(this.background,this.map,this.location);
    this.mini_container.name = "miniM";
    this.stage.addChild(this.mini_container);
}

Minimap.prototype.removeEvents = function(){
    this.map.removeAllEventListeners(["mousedown"]);
}


Minimap.prototype.addEvents= function(){
    var self = this;
    this.map.addEventListener("mousedown", (function (evt) {
        self.moveOnMinimap(evt)
    }));

}

Minimap.prototype.tick= function(evt) {

    this.stage.update();

}



Minimap.prototype.moveOnMinimap = function(evt){

    var self = this;
    var mouseInMiniCoord = this.mini_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    var xpos= mouseInMiniCoord.x;
    var ypos= mouseInMiniCoord.y;
    var minimapCenter = this.stage.globalToLocal(this.halfMapWidth,this.halfMapHeight);
    var DistanceX = xpos-minimapCenter.x;
    var DistanceY = ypos-minimapCenter.y;
    this.location.x = DistanceX;
    this.location.y = DistanceY;
    this.mapControl.main_container.x = -DistanceX;
    this.mapControl.main_container.y = -DistanceY;
    this.mapControl.map.checkRendering()
    //var offset = this.mini2RenderCoords(DistanceX,DistanceY);



    ;
}




