// resize the whole canvas
window.addEventListener('resize', resize, false);

//// GLOBAL VARIABLES ////
var stage;
var socket;
var currentLayer = 1;
var t;

// OBJECTS
var current_object;



// Init function
function init() {

	// initialize stage and main containers
	stage = new createjs.Stage("canvas");
    stage.mouseMoveOutside = true;

    main_container1 = new createjs.Container();
    main_container2 = new createjs.Container();
    main_container3 = new createjs.Container();
    main_container4 = new createjs.Container();
    main_container5 = new createjs.Container();
    main_container6 = new createjs.Container();

    menu_container1 = new createjs.Container();
    menu_container2 = new createjs.Container();
    menu_container3 = new createjs.Container();
    menu_container4 = new createjs.Container();
    menu_container5 = new createjs.Container();
    menu_container6 = new createjs.Container();

    // combine containers
    main = [main_container1,main_container2,main_container3,main_container4,main_container5, main_container6];
    menu = [menu_container1,menu_container2,menu_container3,menu_container4,menu_container5, menu_container6];

	// resize to full window
    stage.canvas.height = window.innerHeight;
    stage.canvas.width = window.innerWidth;
    // load Layer Data
    socket = io.connect('http://localhost:8000');
    socket.on('mapData', onMapDataReceived);    //  from which layer?

}


function onMapDataReceived(data)        {

    mainData = data; // from which layer?
    menuData = [];  // for now
    // Create Layer Object
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,main[currentLayer],menu[currentLayer],stage);
    // Render it once
    stage.update();
    // set FPS and setup tick
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setPaused(true);
}


 // not yet working
function goLayerUp() {

    currentLayer +=1;
    stage.removeAllChildren();
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,main[currentLayer],menu[currentLayer],stage);
    stage.addChild(mainData[currentLayer]);
    stage.addChild(menuData[currentLayer]);
    tick();
}


function goLayerDown() {
    currentLayer -=1;
    stage.removeAllChildren();
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,main[currentLayer],menu[currentLayer]);
    stage.addChild(mainData[currentLayer]);
    stage.addChild(menuData[currentLayer]);
    tick();
}

// get object under mouse position
function getCurrentObject() {
    l = obj_container.getNumChildren();
    var hit_object = false;
    for(var i = 0; i<l; i++){
        child = obj_container.getChildAt(i);
        var pt = child.globalToLocal(stage.mouseX, stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            hit_object = true;
            current_object = obj_container.getChildAt(i);
        }
    }
}


// move object
function moveCurrentObject(current_object) {
    var xoffinreal = (stage.mouseX - (this.x+global_offsetX)) + current_object.x -100;
    var yoffinreal = (stage.mouseY - (this.y+global_offsetY)) + current_object.y -100;

    this.x =(Math.floor(xoffinreal / 32))*32;
    this.y =(Math.floor(yoffinreal / 16))*16;
}

// tick function called every frame
function tick(event) {

    t+=1; // tick counter

		if  (moving || build ) { // move object
            moveCurrentObject();
		}


		else if (t%15 == 0) {  // every 500ms
            getCurrentObject();
		}

}

