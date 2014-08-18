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

    // POSITONING
    this.zoom = 1;
    this.global_offsetX = 0;
    this.global_offsetY = 0;
    this.global_buildXpos;
    this.global_buildYpos;
    this.local_buildXpos = (Math.floor(360 / 64)) * 64;
    this.local_buildYpos = (Math.floor(161 / 32)) * 32;

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
    canvas.addEventListener("mousewheel", (function (evt) {
        self.MouseWheelHandler(evt)
    }), false);
    canvas.addEventListener("DOMMouseScroll", (function (evt) {
        self.MouseWheelHandler(evt)
    }), false);


    // on resize
    //window.addEventListener('resize',(function(){self.resize()}), false);
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
            offset = {
                x: evt.target.x - evt.stageX,
                y: evt.target.y - evt.stageY
            };

            evt.addEventListener("mousemove", function (ev) {
                ev.target.x = ev.stageX + offset.x;
                ev.target.y = ev.stageY + offset.y;
                self.global_offsetX = ev.target.x;
                self.global_offsetY = ev.target.y;
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
        var kill_child = this.menu_container.getChildAt(5);
        this.menu_container.removeChild(kill_child);

        // if deleting or moving was still on switch it off
        this.destroy = false;
        del_count = 1;
        this.move = false;
        move_count = 1;

        this.currBuildingObj = new MapObject(this.gameData, {_id: 'tempObject', x: 0, y: 0, objTypeId: objectTypeId, userId: this.client.userid});

        this.map.addObject(this.currBuildingObj);

        this.currBuildingObj.objectBitmap.mouseMoveOutside = true;
        this.currBuildingObj.objectBitmap.alpha = 1;

        // calculate global position of map
        this.global_buildXpos = -this.global_offsetX + this.local_buildXpos;
        this.global_buildYpos = -this.global_offsetY + this.local_buildYpos;

        //this.currentlyBuildingBitmap.x = this.global_buildXpos;
        //this.currentlyBuildingBitmap.y = this.global_buildYpos;
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
    move_count = 1;

    // delete ON or OFF
    this.destroy = this.truthArr[del_count];
    del_count += 1;
    if (del_count > 1) {
        del_count = 0;
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
    del_count = 1;

    // move ON or OFF
    this.move = this.truthArr[move_count];
    move_count += 1;
    if (move_count > 1) {
        move_count = 0;

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
    this.menu_container.removeAllChildren();
    this.buildMenu = new BuildMenu((function () {
        self.initializeObject()
    }), (function () {
        self.deleteObject()
    }), (function () {
        self.moveObject()
    }), this.menu_container, this.canvas_size);
    this.headMenu = new HeaderMenu(this.menu_container);
    this.canvas_size = [window.innerHeight, window.innerWidth];
};


// move object
Layer.prototype.moveCurrentObject = function () {
    var x = this.stage.mouseX - this.global_offsetX;
    var y = this.stage.mouseY - this.global_offsetY;
    this.map.moveObjectToRenderCoord(this.currBuildingObj._id, x, y);
};


Layer.prototype.MouseWheelHandler = function (e) {

    var zoom;
    if (Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) > 0)
        zoom = 1.1;
    else
        zoom = 1 / 1.1;

    this.stage.scaleX *= zoom;
    this.stage.scaleY *= zoom;
    var yZoom = (this.canvas_size[0] - (this.canvas_size[0] * zoom)) / 2;
    var xZoom = (this.canvas_size[1] - (this.canvas_size[1] * zoom)) / 2;
    if (zoom > 1) {
        this.global_offsetX -= xZoom;
        this.global_offsetY -= yZoom;
    }

    else {
        this.global_offsetX += xZoom;
        this.global_offsetY += yZoom;
    }

    this.zoom *= zoom;

    this.stage.update();
}


Layer.prototype.tick = function () {

    if (this.moving || this.build) { // move object
        this.moveCurrentObject();

    }


};

