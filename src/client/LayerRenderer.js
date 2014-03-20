


var Layer = function(goLayerUp,goLayerDown,mainData,menuData,stage) {

    //// GLOBAL VARIABLES /////
    this.mainData = mainData;
    this.menuData = menuData;
    this.stage = stage;


    // CANVAS
    this.canvas_height;
    this.canvas_width;

    // POSITONING
    this.global_offsetX = 0;
    this.global_offsetY = 0;
    this.global_buildXpos;
    this.global_buildYpos;
    this.local_buildXpos = (Math.floor(360/64))*64;
    this.local_buildYpos = (Math.floor(161/32))*32;

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

    // Render Map
    this.main_container = new createjs.Container();
    this.main_container.mouseMoveOutside = true;
    this.map_container = new createjs.Container();
    this.map_container.mouseMoveOutside = true;
    this.obj_container = new createjs.Container();
    this.obj_container.mouseMoveOutside = true;

    this.mapData = mainData;     // objects missing
    this.tileset = new Image();
    this.tileset.src = mapData.tilesets[0].image;
    this.tileset.onLoad = new Map(mapData,map_container);

    // Render Menu
    this.menu_container = new createjs.Container();
    this.menu_container.mouseMoveOutside = true;
    this.buildMenu  = new BuildMenu(initializeObject,deleteObject,moveObject,menu_container);
    this.headMenu = new HeaderMenu(menu_container);

    // inherit

    this.main_container.addChild(this.map_container,this.obj_container);
    this.stage.addChild(this.main_container, this.menu_container);

    // event listener for main container
    this.main_container.addEventListener("mousedown", handleMousedownMap);


// main Event Listener for map interaction

    function handleMousedownMap(evt) {

        if (build) { // build object
            if (allowedToBuild) {   // collision  detection from server goes here
                build = false;
                // turn rendering off
                createjs.Ticker.setPaused(true);
                // send to server
                socket.emit('buildHouse', { buildXpos2: local_buildXpos2, local_buildYpos2: local_buildYpos2 } );
            }
        }

        else if (destroy) { // delete object
            if (hit_object){
                // remove object and directly render it
                obj_container.removeChild(current_object);
                stage.update();
            }
        }

        else if (move) { // move object
            if (hit_object && !visit){
                moving = true;
                visit = true;

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
                    global_offsetX = ev.target.x;
                    global_offsetY = ev.target.y;
                });

            }
            else if (hit_object && visit && allowedToBuild) {

                moving = false;
                // turn rendering off
                createjs.Ticker.setPaused(true);

            }
        }


        //  change Layer or drag main container
        else if (!build && !move) {

            if (hit_object) { // move in house (submenu missing)
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
                    global_offsetX = ev.target.x;
                    global_offsetY = ev.target.y;
                });

                // turn rendering off
                createjs.Ticker.setPaused(true);

            }

        }


    }

// initialize  Object
    function initializeObject()  {  // ObjectID missing

        if (build) {     // if building is cancelled
            n = obj_container.getNumChildren();
            var del_child = obj_container.getChildAt(n-1); // correct index missing
            obj_container.removeChild(del_child);
        }
        else {
            // remove build menu
            kill_child = menu_container.getChildAt(5);
            menu_container.removeChild(kill_child);

            // if deleting or moving was still on switch it off
            destroy = false;
            del_count =1;
            move = false;
            move_count = 1;

            // load image
            img = new Image();
            img.src = "resources/objects/bank1.png";    // must be dynamic from server data

            // create object
            var object = new createjs.Bitmap(img);
            object.mouseMoveOutside = true;
            object.alpha = 0.5;

            // calculate global position of map
            global_buildXpos = - global_offsetX + local_buildXpos;
            global_buildYpos = - global_offsetY + local_buildYpos;

            // position in grid
           object.x = (Math.floor(global_buildXpos/64)) * 64;
           object.y = (Math.floor(global_buildYpos/32)) * 32;

            // add object to object Container
            obj_container.addChild(object);

            // start build rendering
            build = true;
            // turn rendering on
            createjs.Ticker.setPaused(false);

        }
    }

// delete Object
    function deleteObject() {

        if (build) {  // if building is cancelled
            n = obj_container.getNumChildren();
            var del_child = obj_container.getChildAt(n-1); // correct index missing
            obj_container.removeChild(del_child);
        }

        // if building or moving was still on switch it off
        build = false;
        move = false;
        move_count = 1;

        // delete ON or OFF
        destroy = truthArr[del_count];
        del_count += 1;
        if (del_count >1) {
            del_count = 0;
        }


    }


// moving Object
    function moveObject() {

        if (build) {    // if building is cancelled
            n = obj_container.getNumChildren();
            var del_child = obj_container.getChildAt(n-1); // correct index missing
            obj_container.removeChild(del_child);
        }

        // if building or deleting was still on switch it off
        build = false;
        destroy = false;
        del_count =1;

        // move ON or OFF
        move = truthArr[move_count];
        move_count += 1;
        if (move_count >1) {
            move_count = 0;

        }

    }

    // resize the whole canvas
    window.addEventListener('resize', resize, false);

     // if browser is resized draw menu again
    function resize() {
        stage.canvas.height = window.innerHeight;
        stage.canvas.width = window.innerWidth;
        canvas_height = window.innerHeight;
        canvas_width = window.innerWidth;
        menu_container.removeAllChildren();
        buildMenu  = new BuildMenu(initializeObject,deleteObject,moveObject,menu_container);
        headMenu = new HeaderMenu(menu_container);
    }


}