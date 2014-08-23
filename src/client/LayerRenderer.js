var Layer = function (client, stage, gameData, mapId) {


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

    // Map Container
    this.main_container = new createjs.Container();
    this.main_container.x = this.stage.x;
    this.main_container.y = this.stage.y;
    this.main_container.mouseMoveOutside = true;
    this.map_container = new createjs.Container();
    this.map_container.mouseMoveOutside = true;
    this.obj_container = new createjs.Container();
    this.obj_container.mouseMoveOutside = true;

    // Initialize Map
    this.map = new Map(this.map_container, this.obj_container, this.gameData, this.mapId);

    // Render Menu
    this.menu_container = new createjs.Container();
    this.menu_container.mouseMoveOutside = true;
    this.buildMenu = new BuildMenu((function (objectTypeId) {
        self.initializeObject(objectTypeId)
    }), (function () {
        self.deleteObject()
    }), (function () {
        self.moveObject()
    }), this.menu_container, this.canvas_size, this.gameData, this.mapId);
    this.headMenu = new HeaderMenu(this.menu_container, this.canvas_size);

    // inherit
    this.main_container.addChild(this.map_container, this.obj_container);
    this.stage.addChild(this.main_container, this.menu_container);

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

        if (this.hit_object) { // move in house (submenu missing)

            this.stage.enableMouseOver([frequency = 50]);

            this.icon = "resources/objects/bank1.png";
            var x = this.stage.mouseX;
            var y = this.stage.mouseY;
            var height = 40;
            var width = 160;

            this.submenu3 = new Menu();
            this.submenu3.addButton(x + (2 * width), y + (1 * height), this.icon, 'Reload Layer', [], (function () {
                self.client.goLayerDown()
            }));
            this.submenu3.addButton(x + (2 * width), y + (2 * height), this.icon, 'submenu32', []);
            this.submenu3.addButton(x + (2 * width), y + (3 * height), this.icon, 'submenu33', []);

            this.submenu2 = new Menu();
            this.submenu2.addButton(x + (2 * width), y + (0 * height), this.icon, 'submenu21', []);
            this.submenu2.addButton(x + (2 * width), y + (1 * height), this.icon, 'submenu22', []);
            this.submenu2.addButton(x + (2 * width), y + (2 * height), this.icon, 'submenu23', []);

            this.submenu1 = new Menu();
            this.submenu1.addButton(x + (1 * width), y + (0 * height), this.icon, 'submenu11', this.submenu2);
            this.submenu1.addButton(x + (1 * width), y + (1 * height), this.icon, 'submenu12', this.submenu3);

            this.mainmenu = new Menu();
            this.mainmenu.addButton(x + (0 * width), y + (0 * height), this.icon, 'mainmenu1', this.submenu1);
            this.mainmenu.addButton(x + (0 * width), y + (1 * height), this.icon, 'mainmenu2', []);
            this.mainmenu.addButton(x + (0 * width), y + (2 * height), this.icon, 'mainmenu3', []);
            this.mainmenu.addButton(x + (0 * width), y + (3 * height), this.icon, 'mainmenu4', []);
            this.mainmenu.addButton(x + (0 * width), y + (4 * height), this.icon, 'mainmenu5', []);

            this.buttonMenuContainer = new createjs.Container();
            var dummy1 = new createjs.Container();
            var dummy2 = new createjs.Container();
            var dummy3 = new createjs.Container();
            this.buttonMenuContainer.addChild(dummy1, dummy2, dummy3, this.mainmenu.menuItems[0], this.mainmenu.menuItems[1], this.mainmenu.menuItems[2], this.mainmenu.menuItems[3], this.mainmenu.menuItems[4]);
            this.buttonMenuContainer.name = "submenu";
            this.menu_container.addChild(this.buttonMenuContainer);
        }

        else { // drag main container
            //document.body.style.cursor='move';
            var startDragAt = this.main_container.globalToLocal(evt.stageX,evt.stageY);
            evt.addEventListener("mousemove", function (ev) {
                var mouseAt = self.main_container.globalToLocal(ev.stageX,ev.stageY);
                self.main_container.x += mouseAt.x - startDragAt.x;
                self.main_container.y += mouseAt.y - startDragAt.y;
            });
        }
    }
};


// initialize  Object
Layer.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

    if (this.build) {     // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n - 1); // correct index missing
        this.obj_container.removeChild(del_child);
    }
    else {
        // remove build menu
        //var kill_child = this.menu_container.getChildAt(5);
        //this.menu_container.removeChild(kill_child);
        $( "#bottomLeftUi" ).toggleClass( "hidden", 500, "easeOutSine" );

        // if deleting or moving was still on switch it off
        this.destroy = false;
        this.del_count = 1;
        this.move = false;
        this.move_count = 1;

        this.currBuildingObj = new MapObject(this.gameData, {_id: 'tempObject', x: 0, y: 0, objTypeId: objectTypeId, userId: this.client.userId});
        this.map.addObject(this.currBuildingObj);
        this.currBuildingObj.objectBitmap.mouseMoveOutside = true;
        this.currBuildingObj.objectBitmap.alpha = 1;

        //this.current_object = this.currentlyBuildingBitmap;
        this.build = true;
    }
};


// delete Object
Layer.prototype.deleteObject = function () {

    if (this.build) {  // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n - 1); // correct index missing
        this.obj_container.removeChild(del_child);
    }

    // if building or moving was still on switch it off
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

    if (this.build) {    // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n - 1); // correct index missing
        this.obj_container.removeChild(del_child);
    }

    // if building or deleting was still on switch it off
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

    this.stage.scaleX=this.zoom;
    this.stage.scaleY=this.zoom;
    this.stage.update();
};


Layer.prototype.tick = function () {

    var mouseInMainCoord = this.main_container.globalToLocal(this.stage.mouseX, this.stage.mouseY);
    $("#layerDebug").html(
        "this.zoom="+this.zoom +
            "<br>window.innerWidth=" + window.innerWidth +
            "<br>window.innerHeight=" + window.innerHeight +
            "<br>mouseInMainCoord.x="+mouseInMainCoord.x +
            "<br>mouseInMainCoord.y="+mouseInMainCoord.y +
            "<br>main_container.x="+this.main_container.x +
            "<br>main_container.y="+this.main_container.y
    );

    if (this.moving || this.build) { // move object
        this.moveCurrentObject();

    }


};

