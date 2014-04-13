

//// GLOBAL VARIABLES ////
var stage;
var socket;
var currentLayer = 1;      // Layers number
var t200 = 0;              // Tick counter resets every 200ms
var current_object;        // current object under mouse
var layer;

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
    layer =  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
    // Render it once
    stage.update();
    // set FPS and setup tick
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", tick);
}


 // not yet working
function goLayerUp() {

    currentLayer +=1;
    stage.removeAllChildren();
    layer=  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
}


function goLayerDown() {
    currentLayer -=1;
    stage.removeAllChildren();
    layer=  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
}




// tick function called every frame
function tick() {

    t200+=1; // tick counter
    layer.tick();


    stage.update();


}

