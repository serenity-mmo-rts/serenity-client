
var Client = function() {

    this.socket;
    this.userId;
    this.loginForm;
    // vorübergehend
    this.layer = new Layer();
};

// Init function
Client.prototype.init = function() {

    var self = this;

    socket = io.connect(window.location.href);

    socket.socket.on('error', function (reason){
        console.error('Unable to connect Socket.IO', reason);
    });

    socket.on('connect', function (){
        console.info('successfully established a working connection with type '+socket.socket.transport.name);
        ntp.init(socket);
        //setInterval(function () {
        //    console.log("time offset "+ntp.offset());
        //}, 5000);
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

   /* socket.on('BuildObjectEvent', (function(data){
        var newObject = new MapObject(game,data[1]);
        if (self.layer.mapId == data[0]) {
            //self.layer.map.addObject(newObject);        // what is the difference between the two ?
            game.maps.get(data[0]).mapObjects.add(newObject);
        }
        else {
            game.maps.get(data[0]).mapObjects.add(newObject);
        }
    }));*/

    socket.on('newGameEvent', (function(data){
        var event = EventFactory(game,data[1]);
        game.maps.get(event._mapId).eventScheduler.addEvent(event);
        console.info("received a new event from server via "+socket.socket.transport.name);
        event.applyToGame();
    }));

    socket.emit('ready');
}

Client.prototype.loadMap = function(mapId) {
    var self = this;
    socket.emit('getMap',{mapId: mapId}, function(mapData) {
        //init only one map
        var myNewMap = new MapData(game,mapData.initMap);
        game.maps.add(myNewMap);
        myNewMap.mapObjects.load(mapData.initMapObjects);
        myNewMap.rebuildQuadTree();
        myNewMap.eventScheduler.setEvents(mapData.initMapEvents);
        myNewMap.mapObjects.each(function(mapObject){
            mapObject.setPointers();
        });

        // Create Layer Object
        self.layer.loadMap(myNewMap._id);
    });
}

Client.prototype.onInitGameData = function(initGameData) {
    //init all global gameData variables:
    game.spritesheets.load(initGameData.spritesheets);
    game.mapTypes.load(initGameData.mapTypes);
    game.objectTypes.load(initGameData.objectTypes);
    game.ressourceTypes.load(initGameData.ressourceTypes);
    game.technologyTypes.load(initGameData.technologyTypes);
    game.itemTypes.load(initGameData.itemTypes);

    this.loadMap(initGameData.initMapId);
}


Client.prototype.addEvent = function(event) {

    // check if event is valid:
    if(event.isValid()) {
        event.setValid();

        // execute locally:
        event.execute();

        // add to event List:
        game.maps.get(event._mapId).eventScheduler.addEvent(event);

        // transmit to server:
        socket.emit("newGameEvent", [event._mapId , event.save()], function(response) {
            if(response.success){
                console.log("sent event was successfully applied by server.");
                var updatedEvent = EventFactory(game,response.updatedEvent);
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


