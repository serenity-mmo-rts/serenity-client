

//// GLOBAL VARIABLES ////
var stage;
var socket;


var userid;
var currentLayer = 1;      // Layers number
var t200 = 0;              // Tick counter resets every 200ms
var layer;
var loginForm;

// Init function
function init() {

	// initialize stage and main containers
	stage = new createjs.Stage("canvas");
    stage.mouseMoveOutside = true;


    socket = io.connect('http://localhost:8080');

    loginForm = new Login(socket);

    socket.emit('ready');

    socket.on('mapData', (function(msg){ onMapDataReceived(msg.message);}));

    socket.on('loginPrompt', (function(){
        loginForm.show();
    }));

    socket.on('loggedIn', (function(data){
        userId = data.userId;
        loginForm.close();
    }));

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

