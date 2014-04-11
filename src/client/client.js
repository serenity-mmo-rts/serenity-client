

//// GLOBAL VARIABLES ////
var stage;
var socket;
var currentLayer = 1;      // Layers number
var t = 0;                     // Tick counter
var render = false;        // whether to render or not
var current_object;        // current object under mouse
var canvas_size;           // size of canvas at start


// Init function
function init() {

	// initialize stage and main containers
	stage = new createjs.Stage("canvas");
    stage.mouseMoveOutside = true;

    // load Data
    socket = io.connect('http://localhost:8000');
    socket.on('mapData', onMapDataReceived);    //  from which layer?

}


function onMapDataReceived(data)        {

    mainData = data; // from which layer?
    menuData = [];  // for now
    // Create Layer Object
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
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
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
    stage.addChild(mainData[currentLayer]);
    stage.addChild(menuData[currentLayer]);
    tick();
}


function goLayerDown() {
    currentLayer -=1;
    stage.removeAllChildren();
    layerData =  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
    stage.addChild(mainData[currentLayer]);
    stage.addChild(menuData[currentLayer]);
    tick();
}


///// TICK METHODS /////

// get object under mouse position
function getCurrentObject() {
    var l = stage.getChildAt(0).getChildAt(1).getNumChildren(); // Number of Objects
    var hit_object = false;
    for(var i = 0; i<l; i++){ // loop through all objects
        var child = stage.getChildAt(0).getChildAt(1).getChildAt(i);
        var pt = child.globalToLocal(stage.mouseX, stage.mouseY);
        if (child.hitTest(pt.x, pt.y)) {
            hit_object = true;
            current_object = child;
        }
    }
}


// move object
function moveCurrentObject(current_object) {
    var xoffinreal = (stage.mouseX - (this.x+layerData.global_offsetX)) + this.x -100;
    var yoffinreal = (stage.mouseY - (this.y+layerData.global_offsetY)) + this.y -100;

    this.x =(Math.floor(xoffinreal / 32))*32;
    this.y =(Math.floor(yoffinreal / 16))*16;
}


// tick function called every frame
function tick(event) {

    t+=1; // tick counter
    render = createjs.Ticker.getPaused();    // check whether there is something to render

		if  (layerData.moving || layerData.build ) { // move object
            moveCurrentObject(current_object);
		}


		else if (t == 6) {  // every 200ms
            getCurrentObject();
            t = 0;
		}

     if (render) {

         stage.update();

     }

}

