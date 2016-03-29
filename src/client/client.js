
var Client = function() {

    this.socket;
    this.userId;
    this.loginForm;
    // vorübergehend
    this.layerView = new LayerView();
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
    socket.on('layerTypes', (function(mapTypes){
        game.layerTypes = new GameList(LayerType,mapTypes);
    }));
    socket.on('objectTypes', (function(objectTypes){
        game.objectTypes = new GameList(ObjectType,objectTypes);
    }));
    //socket.on('map', (function(mapData){
    //    self.layerView =  new Layer(self.goLayerUp,self.goLayerDown,[],[],self.stage);
    //}));
   // socket.on('map', (function(mapData){ self.onMapDataReceived(mapData);}));            // where is the implementation???

    socket.on('initGameData',(function(initGameData){ self.onInitGameData(initGameData);}));

   /* socket.on('BuildObjectEvent', (function(data){
        var newObject = new MapObject(game,data[1]);
        if (self.layerView.mapId == data[0]) {
            //self.layerView.map.addObject(newObject);        // what is the difference between the two ?
            game.layers.get(data[0]).mapData.mapObjects.add(newObject);
        }
        else {
            game.layers.get(data[0]).mapData.mapObjects.add(newObject);
        }
    }));*/

    socket.on('newGameEvent', (function(data){
        var event = EventFactory(game,data[1]);
        //game.layers.get(event._mapId).eventScheduler.addEvent(event);
        console.info("received a new event from server via "+socket.socket.transport.name);
        event.executeOnOthers();
    }));

    socket.emit('ready');
}

Client.prototype.loadMap = function(mapId) {
    var self = this;
    socket.emit('getMap',{mapId: mapId}, function(mapData) {
        //init only one map
        var myNewMap = new Layer(game,mapData.initMap);
        game.layers.add(myNewMap);
        myNewMap.mapData.mapObjects.load(mapData.initMapObjects);
        myNewMap.mapData.rebuildQuadTree();
        myNewMap.mapData.items.load(mapData.initItems);
        //myNewMap.mapData.items.each(function(item){
        //    item._mapObj.deployedItems.push(item); // set link from mapObj to item
        //});

        myNewMap.mapData.setPointers();

        myNewMap.eventScheduler.setEvents(mapData.initMapEvents);

        myNewMap.mapData.mapObjects.each(function(mapObject){
            mapObject.setPointers();
        });

        // Create Layer Object
        self.layerView.loadMap(myNewMap._id);
    });
}

Client.prototype.onInitGameData = function(initGameData) {
    //init all global gameData variables:
    game.spritesheets.load(initGameData.spritesheets);
    game.layerTypes.load(initGameData.layerTypes);
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
        //game.layers.get(event._mapId).eventScheduler.addEvent(event);

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

    var oldMapId = this.layerView.mapId;

    game.layers.add(new LayerView(game,initGameData.initMap));

    // Create Layer Object                                            k

    this.layerView =  new LayerView(this,this.stage,game,initGameData.initMap._id);


    game.layers.deleteById(oldMapId);

}


