
var Client = function() {

    this.socket;
    this.userId;
    this.loginForm;
    this.timeoffset = 0;
    // vorübergehend
    this.events = [];
    this.layer = null;

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
        console.log("logged in")
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

    socket.on('newGameEvent', (function(data){
        var gameEvent = createGameEvent(game,data[1]);
        self.events.push(gameEvent);
        gameEvent.applyToGame();
    }));

    socket.emit('ready');
}

Client.prototype.loadMap = function(mapId) {
    socket.emit('getMap',mapId);
}

Client.prototype.onInitGameData = function(initGameData) {

    //init all global gameData variables:
    game.spritesheets.load(initGameData.spritesheets);
    game.mapTypes.load(initGameData.mapTypes);
    game.objectTypes.load(initGameData.objectTypes);
    game.ressourceTypes.load(initGameData.ressourceTypes);
    game.technologyTypes.load(initGameData.technologyTypes);
    game.unitTypes.load(initGameData.unitTypes);
    game.itemTypes.load(initGameData.itemTypes);
    game.upgradeTypes.load(initGameData.upgradeTypes);
    // game.events.load(initGameData.events);

    //init only one map
    var initMap = new MapData(game,initGameData.initMap);
    initMap.mapObjects.load(initGameData.initMapObjects);
    initMap.rebuildQuadTree();
    game.maps.add(initMap);

    // Create Layer Object                                            k
    this.layer =  new Layer(initGameData.initMap._id);

}



// not yet working
Client.prototype.addEvent = function(event) {
    // add to event List
    if(event.isValid()) {
        event.execute();
        this.events.push(event);
        socket.emit("newGameEvent", [event._mapId , event.save()], function(response) {
            if(response.success){
                console.log("sent event was successfully applied by server.");
                var updatedEvent = createGameEvent(game,response.updatedEvent);
                event.updateFromServer(updatedEvent);
            }
            else {
                console.log("sent event was not successful. server returned error! now revert the event...");
                if(event.revert()) {
                    console.log("revert successful");
                }
                else {
                    console.log("... please reconnect ...");
                }
            }
        });
    }
    else {
        console.log("invalid event.");
    }


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


