


var Layer = function(goLayerUp,goLayerDown,mainData,menuData,main_container,menu_container,stage) {

    //// GLOBAL VARIABLES /////

    // CANVAS
    var canvas_height;
    var canvas_width;

    // POSITONING
    var global_offsetX = 0;
    var global_offsetY = 0;
    var global_buildXpos;
    var global_buildYpos;
    var local_buildXpos = (Math.floor(360/64))*64;
    var local_buildYpos = (Math.floor(161/32))*32;

    //BOOLEANS
    var build = false;
    var allowedToBuild = true;         // collision detection need to be included
    var hit_object = false;
    var destroy = false;
    var move = false;
    var moving = false;
    var destroyed = false;
    var truthArr = [false,true];
    var visit = false;

     // setup containers
    map_container = new createjs.Container();
    obj_container = new createjs.Container();
    map_container.mouseMoveOutside = true;
    obj_container.mouseMoveOutside = true;

    // Render Map
    mapData = mainData;     // objects missing
    tileset = new Image();
    tileset.src = mapData.tilesets[0].image;
    tileset.onLoad = new Map(mapData,map_container);

    // Render Menu
    buildMenu  = new BuildMenu(initializeObject,deleteObject,moveObject,menu_container);
    headMenu = new HeaderMenu(menu_container);

    // inherit

    main_container.addChild(map_container,obj_container);
    stage.addChild(main_container, menu_container);

    // event listener for main container
    main_container.addEventListener("mousedown", handleMousedownMap);


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