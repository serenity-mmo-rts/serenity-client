
var Client = function() {

    // WARNING: here, the html content is not yet fully loaded! Therefore do most of the initialization later in init()

    this.socket;
    this.userId = null;
    this.loginForm;
    // vorübergehend

    this.layerView = null; // this is created later...
    this.loadqueue = new createjs.LoadQueue(false);

    this.spritesLoaded = false;
    this.onSpriteLoadedCallback = {};

    this.gameDataLoaded = false;
    this.onGameDataLoaded = {};

    this.userDataLoaded = false;

    this.spritesheets = {};

    this.tempEvents = [];

};

// Init function
Client.prototype.init = function() {

    var self = this;

    this.layerView = new LayerView( this );
    this.registerComponents();

    //socket = io.connect(window.location.href);
    socket = io.connect("http://localhost:8080/");

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
        loginForm.close();
        console.log("logged in");
        self.userId = data.userId;
        self.name = data.userName;
        uc.layerView.uiGlobalMenu.updateUserName(data.userName);

        console.log("check if gameData loaded: "+self.gameDataLoaded);
        if (self.gameDataLoaded) {
            self.loadUserdata();
        }
        else {
            self.onGameDataLoaded['loggedIn'] = function () {
                self.loadUserdata();
                delete self.onGameDataLoaded['loggedIn'];
            };
            console.log("added callback to onGameDataLoaded")
        }

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
        var event = EventFactory(game,data);
        event.setPointers();
        var layer = game.layers.get(event.mapId);

        //game.layers.get(event.mapId).eventScheduler.addEvent(event);
        console.info("received a new event from server via "+socket.socket.transport.name);

        // check if this is an event that was originating from this client:
        var originalId = event.oldId;
        //var originalEventPos = null;
        for (var i = 0, len=self.tempEvents.length; i<len; i++) { // normally this event should be in the first position of the array, right?
            if (self.tempEvents[i]._id == originalId){
                // found the original event:
                //originalEventPos = i;

                // remove it:
                self.tempEvents.splice(i, 1);

                break;
            }
        }

        // revert to the last state that was broadcasted by the server:
        layer.lockObject.isLocked = true;
        console.log("********************** starting revert ****************************");
        layer.revertChanges();
        console.log("********************** revert finished ****************************");
        layer.lockObject.isLocked = false;

        // apply callbacks up to the new broadcasted event time:
        console.log("################# starting with timeScheduler events #####################");
        layer.timeScheduler.finishAllTillTime(event.startedTime);
        console.log("################# finished with timeScheduler events #####################");

        event.isFinished = false;
        layer.eventScheduler.addEvent(event);

        // apply the new event:
        console.log("++++++++++++++++ starting execution of event from server ++++++++++++++");
        layer.currentTime = event.startedTime;
        event.executeOnOthers();
        console.log("++++++++++++++++ finished execution of event from server ++++++++++++++");

        // save new snapshot:
        layer.newSnapshot();

        // reapply all the other following temporary events:
        var currentTime = event.startedTime;
        for (var i = 0, len = self.tempEvents.length; i<len; i++){

            // make sure that the other temp events have a time that is later than the last event broadcasted by the server:
            if (self.tempEvents[i].startedTime <= currentTime) {
                self.tempEvents[i].startedTime = currentTime+1;
                currentTime++;
            }

            // apply callbacks:
            layer.timeScheduler.finishAllTillTime(self.tempEvents[i].startedTime);
            layer.currentTime = self.tempEvents[i].startedTime;
            self.tempEvents[i].executeOnClient();
        }


    }));

    socket.emit('ready');
}

Client.prototype.loadUserdata = function() {
    var self = this;
    socket.emit('getUserData',{}, function(user) {
        if (user) {
            var userObj = new User(game, user.internal);
            game.users.add(userObj);
            self.userDataLoaded = true;
            console.log("userdata was loaded...");
            self.layerView.setUserData(userObj);
        }
    });
};

Client.prototype.registerComponents = function(){

    require.config({
        paths: {
            "text": "text",
            "knockout": "lib/knockout-3.3.0.debug"
        }
    });
    //require(["knockout","text"], function (ko) {
        /*ko.components.register('build-menu', {
            viewModel: BuildMenu,
            //template: { element: 'build-menu-template' }
            template: { require: 'text!BuildMenu.html' }

        });*/

    /*
    ko.components.register('build-Menu', { require: 'ui/buildMenu' });
    var correctRegisterd = ko.components.isRegistered("build-menu");
    */

    /*
    this.testComponentInstance = new testComponent();
    ko.components.register('testComponent', {
        viewModel: { instance: this.testComponentInstance },
        template: { require: 'text!ui/testComponent.html' }
    });
    ko.applyBindings(this.testComponentInstance, document.getElementById("testComponentDiv"));

    ko.components.register('layerView', {
        viewModel: { instance: this.layerView },
        template: { require: 'text!layerView.html' }
    });
    ko.applyBindings(this.layerView, document.getElementById("layerView"));

    ko.components.register('build-menu', {
        viewModel: BuildMenu,
        template: {element: 'build-menu-template'}
    });
    */

    ko.components.register('spritecomponent', {
        viewModel: SpriteComponent,
        template: { require: 'text!ui/SpriteComponent.html' }
    });

};

Client.prototype.loadMap = function(mapId) {
    var self = this;
    socket.emit('getMap',{mapId: mapId}, function(mapData) {
        //init only one map
        var myNewMap = new Layer(game,mapData.initMap);
        game.layers.add(myNewMap);

        // TODO: this should be the same as in load db, or not?

        // add all objects
        myNewMap.eventScheduler.setEvents(mapData.initMapEvents);
        myNewMap.mapData.mapObjects.load(mapData.initMapObjects);
        myNewMap.mapData.items.load(mapData.initItems);

        myNewMap.currentTime = mapData.currentTime;



        // now set pointers and
        myNewMap.initialize();


        myNewMap.newSnapshot();


        if (self.spritesLoaded) {
            self.layerView.loadMap(myNewMap._id());
        }
        else {
            self.onSpriteLoadedCallback['loadMap'] = function() {
                self.layerView.loadMap(myNewMap._id());
                delete self.onSpriteLoadedCallback['loadMap'];
            };
        }

    });
}

Client.prototype.onInitGameData = function(initGameData) {
    var self = this;

    //init all global gameData variables:
    game.spritesheets.load(initGameData.spritesheets);

    // start preloadJS:
    var imagesToLoadHashList = {}, imagesToLoad = [];
    for (var spritesheetId in game.spritesheets.hashList) {
        var spritesheet = game.spritesheets.hashList[spritesheetId];
        for (var i=0, l=spritesheet.images.length; i<l; i++ ) {
            if(!imagesToLoadHashList.hasOwnProperty(spritesheet.images[i])) {
                imagesToLoad.push({id: "sheet"+spritesheetId+"image"+i, src:spritesheet.images[i]});
                imagesToLoadHashList[spritesheet.images[i]] = 1;
            }
        }
    }
    this.loadqueue.loadManifest(imagesToLoad);
    this.loadqueue.addEventListener("complete", function() {
        for (var spritesheetId in game.spritesheets.hashList) {
            self.spritesheets[spritesheetId] = new createjs.SpriteSheet(game.spritesheets.hashList[spritesheetId]);
        }
        self.spritesLoaded = true;
        for (var key in self.onSpriteLoadedCallback){
            self.onSpriteLoadedCallback[key]();
        }
    });
    game.layerTypes.load(initGameData.layerTypes);
    game.objectTypes.load(initGameData.objectTypes);
    game.ressourceTypes.load(initGameData.ressourceTypes);
    game.technologyTypes.load(initGameData.technologyTypes);
    game.itemTypes.load(initGameData.itemTypes);
    game.userTypes.load(initGameData.userTypes);

    console.log("gameData loaded successfully...");
    this.gameDataLoaded = true;
    for (var key in self.onGameDataLoaded){
        self.onGameDataLoaded[key]();
    }

    this.loadMap(initGameData.initMapId);


};


Client.prototype.addEvent = function(event) {

    var self = this;
    var currentTime = Date.now() + ntp.offset();
    event.startedTime = currentTime;

    // check if event is valid:
    if(event.isValid()) {

        var layer = game.layers.get(event.mapId);
        layer.currentTime = currentTime;

        // add to event List:
        this.tempEvents.push(event);
        layer.eventScheduler.addEvent(event);

        // execute locally:
        event.executeOnClient();



        // transmit to server:
        socket.emit("newGameEvent", [event.mapId , event.save()], function(response) {
            if(response.success){
                console.log("sent event was successfully applied by server.");
                //var updatedEvent = EventFactory(game,response.updatedEvent);
                //event.updateFromServer(updatedEvent);
            }
            else {
                console.log("sent event was NOT successful. server returned error! now revert the event...");

                // remove the invalid temp event:
                var pos = self.tempEvents.indexOf(event);
                self.tempEvents.splice(pos, 1);
                layer.eventScheduler.removeEvent(event._id);

                // revert to the last state that was broadcasted by the server:
                layer.lockObject.isLocked = true;
                layer.revertChanges();
                layer.lockObject.isLocked = false;

                // reapply all the other temporary events:
                for (var i = 0, len=self.tempEvents.length; i<len; i++){
                    layer.timeScheduler.finishAllTillTime(self.tempEvents[i].startedTime);
                    layer.currentTime = self.tempEvents[i].startedTime;
                    self.tempEvents[i].executeOnClient();
                }

                /*
                if(event.revert()) {
                    console.log("revert successful");
                }
                else {
                    console.log("... please reconnect ...");
                }
                */
            }
        });
    }
    else {
        console.log("invalid event.");
    }


}
