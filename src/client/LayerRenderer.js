


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
    this.object;

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
    this.buildMenu  = new BuildMenu(initializeObject,deleteObject,moveObject,this.menu_container,this.canvas_size);
    this.headMenu = new HeaderMenu(this.menu_container,this.canvas_size);

    // inherit
    this.main_container.addChild(this.map_container,this.obj_container);
    this.stage.addChild(this.main_container, this.menu_container);

    // event listener for main container
    this.main_container.addEventListener("mousedown", handleMousedownMap);


// main Event Listener for map interaction
    function handleMousedownMap(evt) {

        if (self.build) { // build object
            if (self.allowedToBuild) {   // collision  detection from server goes here
                self.build = false;
                // turn rendering off
                createjs.Ticker.setPaused(true);
                // send to server
                socket.emit('buildHouse', { buildXpos: self.object.x, buildYpos: self.object.y } );
            }
        }

        else if (self.destroy) { // delete object
            if (self.hit_object){
                // remove object and directly render it
                self.obj_container.removeChild(self.current_object);
                self.stage.update();
            }
        }

        else if (self.move) { // move object
            if (self.hit_object && !self.visit){
                self.moving = true;
                self.visit = true;

                // turn rendering on
                createjs.Ticker.setPaused(false);
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
            else if (self.hit_object && self.visit && self.allowedToBuild) {

                self.moving = false;
                // turn rendering off
                createjs.Ticker.setPaused(true);

            }
        }


        //  change Layer or drag main container
        else if (!self.build && !self.move) {

            if (self.hit_object) { // move in house (submenu missing)
                goLayerDown();
            }

            else { // drag main container
                // turn rendering on
                createjs.Ticker.setPaused(false);
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

                // turn rendering off
                createjs.Ticker.setPaused(true);

            }

        }


    }

// initialize  Object
    function initializeObject()  {  // ObjectID missing

        if (self.build) {     // if building is cancelled
            var n = self.obj_container.getNumChildren();
            var del_child = self.obj_container.getChildAt(n-1); // correct index missing
            self.obj_container.removeChild(del_child);
        }
        else {
            // remove build menu
            var kill_child = self.menu_container.getChildAt(5);
            self.menu_container.removeChild(kill_child);

            // if deleting or moving was still on switch it off
            self.destroy = false;
            del_count =1;
            self.move = false;
            move_count = 1;

            // load image
            self.img = new Image();
            self.img.src = "resources/objects/bank1.png";    // must be dynamic from server data

            // create object
            self.object = new createjs.Bitmap(self.img);
            self.object.mouseMoveOutside = true;
            self.object.alpha = 0.5;

            // calculate global position of map
            self.global_buildXpos = - self.global_offsetX + self.local_buildXpos;
            self.global_buildYpos = - self.global_offsetY + self.local_buildYpos;

            // position in grid
            self.object.x = (Math.floor(self.global_buildXpos/64)) * 64;
            self.object.y = (Math.floor(self.global_buildYpos/32)) * 32;

            // add object to object Container
            self.obj_container.addChild(self.object);

            // start build rendering
            self.build = true;
            // turn rendering on
            createjs.Ticker.setPaused(false);

        }
    }

// delete Object
    function deleteObject() {

        if (self.build) {  // if building is cancelled
            var n = self.obj_container.getNumChildren();
            var del_child = self.obj_container.getChildAt(n-1); // correct index missing
            self.obj_container.removeChild(del_child);
        }

        // if building or moving was still on switch it off
        self.build = false;
        self.move = false;
        move_count = 1;

        // delete ON or OFF
        self.destroy = truthArr[del_count];
        del_count += 1;
        if (del_count >1) {
            del_count = 0;
        }


    }


// moving Object
    function moveObject() {

        if (self.build) {    // if building is cancelled
            var n = self.obj_container.getNumChildren();
            var del_child = self.obj_container.getChildAt(n-1); // correct index missing
            self.obj_container.removeChild(del_child);
        }

        // if building or deleting was still on switch it off
        self.build = false;
        self.destroy = false;
        del_count =1;

        // move ON or OFF
        self.move = truthArr[move_count];
        move_count += 1;
        if (move_count >1) {
            move_count = 0;

        }

    }

    // on resize
    window.addEventListener('resize', resize, false);

     // if browser is resized draw menu again
    function resize() {
        self.stage.canvas.height = window.innerHeight;
        self.stage.canvas.width = window.innerWidth;
        self.menu_container.removeAllChildren();
        self.buildMenu  = new BuildMenu(initializeObject,deleteObject,moveObject,self.menu_container);
        self.headMenu = new HeaderMenu(self.menu_container);
        self.canvas_size = [window.innerHeight,window.innerWidth];
    }


}