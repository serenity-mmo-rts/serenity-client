var Layer = function (client, stage,gameData, mapId) {


    var self = this;

    this.client = client;

    // resize to full window
    this.client.stage.canvas.height = window.innerHeight;
    this.client.stage.canvas.width = window.innerWidth;

    this.canvas_size = [window.innerHeight, window.innerWidth];

    this.gameData = gameData;
    this.mapId = mapId;
    this.stage = stage;

    this.stage.regX = window.innerWidth / 2;
    this.stage.regY = window.innerHeight / 2;
    this.stage.x = window.innerWidth / 2;
    this.stage.y = window.innerHeight / 2;

    // Zooming
    this.zoomFactors = [0.3486784401, 0.387420489, 0.43046721, 0.4782969, 0.531441, 0.59049, 0.6561, 0.729, 0.81, 0.9, 1, 1.1, 1.21, 1.331, 1.4641, 1.61051, 1.771561, 1.9487171, 2.14358881, 2.357947691, 2.5937424601];
    this.zoom_level = 10;
    this.zoom = this.zoomFactors[this.zoom_level];

    this.move_count = 1;
    this.del_count = 1;


    // Objects
    this.current_object;

    //BOOLEANS
    this.build = false;
    this.allowedToBuild = true;         // collision detection need to be included
    this.hit_object = false;
    this.destroy = false;
    this.move = false;
    this.moving = false;
    this.destroyed = false;
    this.truthArr = [false, true];
    this.visit = false;

    // Container
    this.zoom_container = new createjs.Container();
    this.zoom_container.regX = window.innerWidth / 2;
    this.zoom_container.regY = window.innerHeight/ 2;
    this.zoom_container.x = window.innerWidth / 2;
    this.zoom_container.y = window.innerHeight / 2;
    this.main_container = new createjs.Container();
    this.main_container.x = this.stage.x;
    this.main_container.y = this.stage.y;
    this.main_container.mouseMoveOutside = true;
    this.map_container = new createjs.Container();
    this.map_container.mouseMoveOutside = true;
    this.obj_container = new createjs.Container();
    this.obj_container.mouseMoveOutside = true;


    // Initialize Map
    this.map = new Map(this.map_container, this.obj_container, this.canvas_size, this.gameData, this.mapId);

    // Render Menu
    this.menu_container = new createjs.Container();
    this.menu_container.mouseMoveOutside = true;
    this.buildMenu = new BuildMenu((function (objectTypeId) {
        self.initializeObject(objectTypeId)
    }), (function () {
        self.deleteObject()
    }), (function () {
        self.moveObject()
    }), this.canvas_size, this.gameData, this.mapId);
    //this.headMenu = new HeaderMenu(this.menu_container, this.canvas_size);
    this.minimap = new Minimap(this.stage,this.main_container,this.menu_container,this.gameData,this.mapId,this.canvas_size,(function (x,y,list,zoom) {
        self.RenderObjects(self.main_container.x, self.main_container.y,self.gameData.maps.get(self.mapId).mapObjects.hashList,self.zoom)
    }));

    // inherit
    this.main_container.addChild(this.map_container, this.obj_container);
    this.zoom_container.addChild(this.main_container);
    this.stage.addChild(this.zoom_container,this.menu_container);

    // event listener for main container
    this.main_container.addEventListener("mousedown", (function (evt) {
        self.handleMousedownMain(evt)
    }));

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


    // on resize
    window.addEventListener('resize',(function(){self.resize()}), false);
};


// main Event Listener for map interaction
Layer.prototype.handleMousedownMain = function (evt) {
    var self = this;
    this.getCurrentObject();

    var kchild = this.menu_container.getChildByName("submenu");
    this.menu_container.removeChild(kchild);
    this.stage.enableMouseOver([frequency = 0]);

    if (this.build) { // build object
        if (this.allowedToBuild) {
            this.build = false;
            this.moveCurrentObject();
            socket.emit('buildHouse', [this.mapId, this.currBuildingObj.save()]);
        }
    }

    else if (this.destroy) { // delete object
        if (this.hit_object) {
            // remove object and directly render it
            this.obj_container.removeChild(this.current_object);
            this.stage.update();
        }
    }

    else if (this.move) { // move object
        if (this.hit_object && !this.visit) {
            this.moving = true;
            this.visit = true;
            // get offset
            offset = {
                x: evt.target.x - evt.stageX,
                y: evt.target.y - evt.stageY
            };

            // calculate global offset
            evt.addEventListener("mousemove", function (ev) {
                ev.target.x = ev.stageX + offset.x;
                ev.target.y = ev.stageY + offset.y;
                self.global_offsetX = ev.target.x;
                self.global_offsetY = ev.target.y;
            });

        }
        else if (this.hit_object && this.visit && this.allowedToBuild) {
            this.visit = false;
            this.moving = false;

        }
    }


    //  change Layer or drag main container
    else if (!this.build && !this.move) {

        if (this.hit_object) { // submenu on click onto object

            this.stage.enableMouseOver([frequency = 50]);

            var subicon = "resources/objects/bank1.png";
            var x = this.stage.mouseX;
            var y = this.stage.mouseY;
            var height = 40;
            var width = 160;

            var buttonMenu = new Menu();
            buttonMenu.addButton(x + (0 * width), y + (0 * height), subicon, 'Go into', [], (function () {
                self.client.changeLayer() ;
            }));
            buttonMenu.addButton(x + (0 * width), y + (1 * height), subicon, 'Something else', [], []);


            var buttonMenuContainer = new createjs.Container();
            dummy1 = dummy2 = dummy3 = new createjs.Container();

            buttonMenuContainer.addChild(dummy1, dummy2, dummy3, buttonMenu.menuItems[0],buttonMenu.menuItems[1]);
            buttonMenuContainer.name = "submenu";
            this.menu_container.addChild(buttonMenuContainer);
        }

        else { // drag main container
            //document.body.style.cursor='move';
            var startDragAt = this.main_container.globalToLocal(evt.stageX,evt.stageY);
            evt.addEventListener("mousemove", function (ev) {
                var mouseAt = self.main_container.globalToLocal(ev.stageX,ev.stageY);
                self.main_container.x += mouseAt.x - startDragAt.x;
                self.main_container.y += mouseAt.y - startDragAt.y;

            });


            evt.addEventListener("mouseup", function (ev) {
                //var minimapCenter = self.stage.globalToLocal(self.canvas_size[1]*(9/10),self.canvas_size[1]*(1/10)/2);
                var minicoords = self.minimap.render2MiniCoords(-self.main_container.x,-self.main_container.y);
                self.minimap.location.x = minicoords[0];
                self.minimap.location.y = minicoords[1];
                self.RenderObjects(self.main_container.x, self.main_container.y,self.gameData.maps.get(self.mapId).mapObjects.hashList,self.zoom);
                var mouseAt = self.main_container.globalToLocal(ev.stageX,ev.stageY);
                //self.main_container.regX= self.main_container.x+window.innerWidth/2;
                //self.main_container.regY= self.main_container.y+window.innerHeight/2;
            });


        }
    }
};


// initialize  Object
Layer.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

        $( "#bottomLeftUi" ).toggleClass( "hidden", 500, "easeOutSine" );

        // if deleting or moving was still on switch it off
        this.destroy = false;
        this.del_count = 1;
        this.move = false;
        this.move_count = 1;

        this.currBuildingObj = new MapObject(this.gameData, {_id: 'tempObject', x: this.main_container.x, y: this.main_container.y, objTypeId: objectTypeId, userId: this.client.userId});
        this.gameData.maps.get(this.mapId).mapObjects.add(this.currBuildingObj);
        this.map.renderObj(this.currBuildingObj);

        this.currBuildingObj.objectBitmap.mouseMoveOutside = true;
        this.currBuildingObj.objectBitmap.alpha = 1;

        //this.current_object = this.currentlyBuildingBitmap;
        this.build = true;
 //   }
};


// delete Object
Layer.prototype.deleteObject = function () {

    this.build = false;
    this.move = false;
    this.move_count = 1;

    // delete ON or OFF
    this.destroy = this.truthArr[this.del_count];
    this.del_count += 1;
    if (this.del_count > 1) {
        this.del_count = 0;
    }
};


// moving Object
Layer.prototype.moveObject = function () {

    this.build = false;
    this.destroy = false;
    this.del_count = 1;

    // move ON or OFF
    this.move = this.truthArr[this.move_count];
    this.move_count += 1;
    if (this.move_count > 1) {
        this.move_count = 0;

    }
};


// get object under mouse position
Layer.prototype.getCurrentObject = function () {
    var l = this.obj_container.getNumChildren(); // Number of Objects
    this.hit_object = false;
    for (var i = 0; i < l; i++) { // loop through all objects
        var child = this.obj_container.getChildAt(i);
        var pt = child.globalToLocal(this.stage.mouseX, this.stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            this.hit_object = true;
            this.current_object = child;
            this.currentlyBuildingBitmap = child;
        }
    }
};


// if browser is resized draw menu again
Layer.prototype.resize = function () {
    this.stage.canvas.height = window.innerHeight;
    this.stage.canvas.width = window.innerWidth;
    this.canvas_size = [window.innerHeight, window.innerWidth];
};


// move object
Layer.prototype.moveCurrentObject = function () {
    var pt = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    this.map.moveObjectToRenderCoord(this.currBuildingObj._id, pt.x, pt.y);
};

Layer.prototype.MouseWheelHandler = function (e) {
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

    this.stage.update();
};


Layer.prototype.RenderObjects = function(x,y,List,zoom){
    this.map.checkRendering(List,x,y,zoom);
}


Layer.prototype.tick = function () {

    var mouseInMainCoord = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    $("#layerDebug").html(
        "this.zoom="+this.zoom +
            "<br>window.innerWidth=" + window.innerWidth +
            "<br>window.innerHeight=" + window.innerHeight +
            "<br>mouseInMainCoord.x="+mouseInMainCoord.x +
            "<br>mouseInMainCoord.y="+mouseInMainCoord.y +
            "<br>main_container.x="+ -this.main_container.x +
            "<br>main_container.y="+ -this.main_container.y+
            "<br>stage.mouseX"+ this.stage.mouseX +
            "<br>stage.mouseX="+ this.stage.mouseY
    );

    if (this.moving || this.build) { // move object
        this.moveCurrentObject();

    }


};

