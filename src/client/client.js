
var Client = function() {

    this.socket;
    this.userId;
    this.loginForm;
    this.timeoffset = 0;
    // vorübergehend
    this.events = [];
};

// Init function
Client.prototype.init = function() {

    var self = this;


    socket = io.connect(window.location.href);

    socket.socket.on('error', function (reason){
        console.error('Unable to connect Socket.IO', reason);
    });

    socket.on('connect', function (){
        console.info('successfully established a working connection \o/');
        ntp.init(socket);
    });

    loginForm = new Login(socket);

    socket.on('loginPrompt', (function(){
        loginForm.show();
    }));

    socket.on('loggedIn', (function(data){
        self.userId = data.userId;
        loginForm.close();
    }));

    socket.on('spritesheets', (function(spritesheets){
        game.spritesheets = new GameList(Spritesheet,spritesheets);
    }));
    socket.on('mapTypes', (function(mapTypes){
        game.mapTypes = new GameList(MapType,mapTypes);
    }));
    socket.on('objectTypes', (function(objectTypes){
        game.objectTypes = new GameList(ObjectType,objectTypes);
    }));
    //socket.on('map', (function(mapData){
    //    self.layer =  new Layer(self.goLayerUp,self.goLayerDown,[],[],self.stage);
    //}));
   // socket.on('map', (function(mapData){ self.onMapDataReceived(mapData);}));            // where is the implementation???

    socket.on('initGameData',(function(initGameData){ self.onInitGameData(initGameData);}));

    socket.on('BuildObjectEvent', (function(data){
        var newObject = new MapObject(game,data[1]);
        if (self.layer.mapId == data[0]) {
            //self.layer.map.addObject(newObject);        // what is the difference between the two ?
            game.maps.get(data[0]).mapObjects.add(newObject);
        }
        else {
            game.maps.get(data[0]).mapObjects.add(newObject);
        }
    }));

    socket.emit('ready');
}

Client.prototype.loadMap = function(mapId) {
    socket.emit('getMap',mapId);
}

Client.prototype.onInitGameData = function(initGameData) {

    //init all global gameData variables:
    var hans = game;
    game.spritesheets.load(initGameData.spritesheets);
    game.mapTypes.load(initGameData.mapTypes);
    game.objectTypes.load(initGameData.objectTypes);
    // game.events.load(initGameData.events);

    //init only one map
    game.maps.add(new MapData(game,initGameData.initMap));

    // Create Layer Object                                            k
    this.layer =  new Layer(initGameData.initMap._id);

}



// not yet working
Client.prototype.addEvent = function(event) {

    this.event = event;
    this.event.name =  this.event.constructor.name;
    // add to event List
    this.events.push(this.event);
    this.event.initialize(function(){}());
    //socket.emit(this.event.name, [this.layer.mapId, this.currBuildingObj.save()]);

}

// not yet working
Client.prototype.changeLayer = function(initGameData) {
    this.stage.removeAllChildren();
    this.stage.update();
    var self = this;

    game.maps.add(new MapData(game,initGameData.initMap));

    // Create Layer Object                                            k

    this.layer =  new Layer(this,this.stage,game,initGameData.initMap._id);
    // Render it once

}


