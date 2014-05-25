
var Client = function() {
    this.stage;
    this.socket;
    this.userid;
    this.currentLayer = 1;      // Layers number
    this.t200 = 0;              // Tick counter resets every 200ms
    this.layer;
    this.loginForm;
    this.gameData = new GameData();
};

// Init function
Client.prototype.init = function() {
    var self = this;

	// initialize stage and main containers
    this.stage = new createjs.Stage("canvas");
    this.stage.mouseMoveOutside = true;

    socket = io.connect('http://localhost:8080');

    loginForm = new Login(socket);

    socket.emit('ready');

    socket.on('loginPrompt', (function(){
        loginForm.show();
    }));

    socket.on('loggedIn', (function(data){
        self.userId = data.userId;
        loginForm.close();
    }));

    socket.on('spritesheets', (function(spritesheets){
        self.gameData.spritesheets = new GameList(Spritesheet,spritesheets);
    }));
    socket.on('mapTypes', (function(mapTypes){
        self.gameData.mapTypes = new GameList(MapType,mapTypes);
    }));
    socket.on('objectTypes', (function(objectTypes){
        self.gameData.objectTypes = new GameList(ObjectType,objectTypes);
    }));
    //socket.on('map', (function(mapData){
    //    self.layer =  new Layer(self.goLayerUp,self.goLayerDown,[],[],self.stage);
    //}));
    socket.on('map', (function(mapData){ self.onMapDataReceived(mapData);}));

    socket.on('initGameData',(function(initGameData){ self.onInitGameData(initGameData);}));
}

Client.prototype.loadMap = function(mapId) {
    socket.emit('getMap',mapId);
}

Client.prototype.onInitGameData = function(initGameData) {
    var self = this;

    //init all global gameData variables:
    this.gameData.spritesheets = new GameList(Spritesheet,initGameData.spritesheets);
    this.gameData.mapTypes = new GameList(MapType,initGameData.mapTypes);
    this.gameData.objectTypes = new GameList(ObjectType,initGameData.objectTypes);

    //init only one map
    this.gameData.maps = new GameList(MapData,[initGameData.initMap]);

    // Create Layer Object
    this.layer =  new Layer(this,this.stage,this.gameData,initGameData.initMap._id);
    // Render it once
    this.stage.update();

    // set FPS and setup tick
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function() {
        self.t200+=1; // tick counter
        self.layer.tick();
        self.stage.update();
    });
}


 // not yet working
Client.prototype.goLayerUp = function() {
    currentLayer +=1;
    stage.removeAllChildren();
    layer=  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
}


Client.prototype.goLayerDown = function() {
    currentLayer -=1;
    stage.removeAllChildren();
    layer=  new Layer(goLayerUp,goLayerDown,mainData,menuData,stage);
}