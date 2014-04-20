


var Layer = function(goLayerUp,goLayerDown,mainData,menuData,stage) {


    var self = this;
    // resize to full window
    stage.canvas.height = window.innerHeight;
    stage.canvas.width = window.innerWidth;
    this.canvas_size = [window.innerHeight,window.innerWidth];

    //// GLOBAL VARIABLES /////
    this.mapData = mainData;
    this.menuData = menuData;
    this.stage = stage;

    // POSITONING
    this.global_offsetX = 0;
    this.global_offsetY = 0;
    this.global_buildXpos;
    this.global_buildYpos;
    this.local_buildXpos = (Math.floor(360/64))*64;
    this.local_buildYpos = (Math.floor(161/32))*32;

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
    this.truthArr = [false,true];
    this.visit = false;

    // Map Container
    this.main_container = new createjs.Container();
    this.main_container.mouseMoveOutside = true;
    this.map_container = new createjs.Container();
    this.map_container.mouseMoveOutside = true;
    this.obj_container = new createjs.Container();
    this.obj_container.mouseMoveOutside = true;

    // Initialize Map
    this.map = new Map(this.mapData,this.map_container);

    // Render Menu
    this.menu_container = new createjs.Container();
    this.menu_container.mouseMoveOutside = true;
    this.buildMenu  = new BuildMenu((function(){self.initializeObject()}),(function(){self.deleteObject()}),(function(){self.moveObject()}),this.menu_container,this.canvas_size);
    this.headMenu = new HeaderMenu(this.menu_container,this.canvas_size);

    // inherit
    this.main_container.addChild(this.map_container,this.obj_container);
    this.stage.addChild(this.main_container, this.menu_container);

    // event listener for main container
    this.main_container.addEventListener("mousedown", (function(evt){self.handleMousedownMain(evt)}));
    // on resize
    window.addEventListener('resize',(function(){self.resize()}), false);
};


// main Event Listener for map interaction
Layer.prototype.handleMousedownMain = function(evt) {
    var self = this;
    this.getCurrentObject();

    if (this.build) { // build object
        if (this.allowedToBuild) {   // collision  detection from server goes here
            this.build = false;
            // send to server
            socket.emit('buildHouse', { buildXpos: this.current_object.x, buildYpos: this.current_object.y } );
        }
    }

    else if (this.destroy) { // delete object
        if (this.hit_object){
            // remove object and directly render it
            this.obj_container.removeChild(this.current_object);
            this.stage.update();
        }
    }

    else if (this.move) { // move object
        if (this.hit_object && !this.visit){
            this.moving = true;
            this.visit = true;
            // get offset
            offset = {
                x:evt.target.x-evt.stageX,
                y:evt.target.y-evt.stageY
            };

            // calculate global offset
            evt.addEventListener("mousemove",function(ev) {
                ev.target.x = ev.stageX+offset.x;
                ev.target.y = ev.stageY+offset.y;
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
            goLayerDown();
        }

        else { // drag main container
            offset = {
                x:evt.target.x-evt.stageX,
                y:evt.target.y-evt.stageY
            };

            evt.addEventListener("mousemove",function(ev) {
                ev.target.x = ev.stageX+offset.x;
                ev.target.y = ev.stageY+offset.y;
                self.global_offsetX = ev.target.x;
                self.global_offsetY = ev.target.y;
            });
        }
    }
};




// initialize  Object
Layer.prototype.initializeObject = function() {  // ObjectID missing

    if (this.build) {     // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n-1); // correct index missing
        this.obj_container.removeChild(del_child);
    }
    else {
        // remove build menu
        var kill_child = this.menu_container.getChildAt(5);
        this.menu_container.removeChild(kill_child);

        // if deleting or moving was still on switch it off
        this.destroy = false;
        del_count =1;
        this.move = false;
        move_count = 1;

        // load image
        var img = new Image();
        img.src = "resources/objects/bank1.png";    // must be dynamic from server data

        // create object
        var object = new createjs.Bitmap(img);
        object.mouseMoveOutside = true;
        object.alpha = 1;

        // calculate global position of map
        this.global_buildXpos = - this.global_offsetX + this.local_buildXpos;
        this.global_buildYpos = - this.global_offsetY + this.local_buildYpos;

        // position in grid
        object.x = (Math.floor(this.global_buildXpos/64)) * 64;
        object.y = (Math.floor(this.global_buildYpos/32)) * 32;

        // set object as current object
        this.current_object = object;

        // add object to object Container
        this.obj_container.addChild(object);

        // start build rendering
       this.build = true;
    }
};


// delete Object
Layer.prototype.deleteObject = function() {

    if (this.build) {  // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n-1); // correct index missing
        this.obj_container.removeChild(del_child);
    }

    // if building or moving was still on switch it off
    this.build = false;
    this.move = false;
    move_count = 1;

    // delete ON or OFF
    this.destroy = this.truthArr[del_count];
    del_count += 1;
    if (del_count >1) {
        del_count = 0;
    }
};


// moving Object
Layer.prototype.moveObject = function() {

    if (this.build) {    // if building is cancelled
        var n = this.obj_container.getNumChildren();
        var del_child = this.obj_container.getChildAt(n-1); // correct index missing
        this.obj_container.removeChild(del_child);
    }

    // if building or deleting was still on switch it off
    this.build = false;
    this.destroy = false;
    del_count =1;

    // move ON or OFF
    this.move = this.truthArr[move_count];
    move_count += 1;
    if (move_count >1) {
        move_count = 0;

    }
};


// get object under mouse position
Layer.prototype.getCurrentObject = function() {
    var l = this.obj_container.getNumChildren(); // Number of Objects
    this.hit_object = false;
    for(var i = 0; i<l; i++){ // loop through all objects
        var child = this.obj_container.getChildAt(i);
        var pt = child.globalToLocal(this.stage.mouseX, this.stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            this.hit_object = true;
            this.current_object = child;

        }
    }
};


 // if browser is resized draw menu again
Layer.prototype.resize = function() {
    stage.canvas.height = window.innerHeight;
    stage.canvas.width = window.innerWidth;
    this.menu_container.removeAllChildren();
    this.buildMenu  = new BuildMenu((function(){self.initializeObject()}),(function(){self.deleteObject()}),(function(){self.moveObject()}),this.menu_container,this.canvas_size);
    this.headMenu = new HeaderMenu(this.menu_container);
    this.canvas_size = [window.innerHeight,window.innerWidth];
};


// move object
Layer.prototype.moveCurrentObject = function() {
    var xoffinreal = (this.stage.mouseX - (this.current_object.x+this.global_offsetX)) + this.current_object.x -100;
    var yoffinreal = (this.stage.mouseY - (this.current_object.y+this.global_offsetY)) + this.current_object.y -100;

    this.current_object.x =(Math.floor(xoffinreal / 32))*32;
    this.current_object.y =(Math.floor(yoffinreal / 16))*16;
};



Layer.prototype.tick = function()  {

    if  (this.moving || this.build) { // move object
        this.moveCurrentObject();

    }


};


