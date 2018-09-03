
var UiPlaceItemMenu = function ( layerView ) {

    var self = this;
    this.layerView = layerView;
    this.objectsToPlace =  ko.observableArray([]);
    this.mapId = ko.computed(function () {
        return self.layerView.loadedMapId();
    });

    this.mapId.subscribe(function(newValue) {
        if(newValue){
            self.showPlaceObjects();
        }
    });

};

// check Objects to be placed for whole list, executed once for new clients
UiPlaceItemMenu.prototype.showPlaceObjects = function () {
    var mapObjects = game.layers.get(this.mapId()).mapData.mapObjects.hashList;
    var tempArr = [];
    for (var id in mapObjects) {
        if (mapObjects[id].className=="subObject") {
            var object = mapObjects[id];
            if (mapObjects[id].needsTobePlaced()) {
                tempArr.push(this.makeObjectEntry(object));
            }
            this.handleSubscription(object);
        }
    }
    this.objectsToPlace(tempArr);
};

// returns object entry needed to rendering and event processing
UiPlaceItemMenu.prototype.makeObjectEntry = function (object) {
    var objectTypeId = object.objTypeId();
    var objectType = game.objectTypes.get(objectTypeId);
    var self= this;
    var objectEntry = {
        _id: object._id(),
        iconSpritesheetId: objectType.iconSpritesheetId,
        iconSpriteFrame: objectType.iconSpriteFrame,
        clickHandler: function (data, event) {
            self.initializeObject(data);
        }
    };
    return  objectEntry
};

// handles the subscriptions, which either add or remove the object entries
UiPlaceItemMenu.prototype.handleSubscription = function (object) {
    var self = this;
    object.needsTobePlaced.subscribe(function (newValue) {
        if (!newValue) {
            self.removeFromPlaceObjects(object)
        }
        else if (newValue){
            self.addToPlaceObjects(object)
        }
    });
};

// removes object entry from observable array
UiPlaceItemMenu.prototype.removeFromPlaceObjects = function (object) {
    for (var i=0;i<this.objectsToPlace().length; i++){
        var arrayObject = this.objectsToPlace()[i];
        if (arrayObject._id ==object._id()){
            this.objectsToPlace.splice(i,1);
        }
    }
};

// adds object entry to observable array
UiPlaceItemMenu.prototype.addToPlaceObjects = function (object) {
    var pos = this.objectsToPlace().indexOf(object._id());
    if (pos ==-1){
        this.objectsToPlace.push(this.makeObjectEntry(object))
    }
};



UiPlaceItemMenu.prototype.initializeObject = function (objectParams) {  // ObjectID missing

    this.tmpEvent = new PlaceObjectEvent(game.layers.get(this.mapId()).eventScheduler.events);
    this.tmpEvent.setParameters(objectParams);
    var object = game.layers.get(this.mapId()).mapData.mapObjects.get(objectParams._id);
    object.state(State.TEMP);
    this.mapControl = this.layerView.mapContainer.mapControl;
    this.mapControl.map.addTempObj(object);
    var self = this;

    function callbackOnSelect(gameCoord) {
        self.mapControl.map.deleteTempObj();
        uc.addEvent(self.tmpEvent);
        self.tmpEvent = null;
    }

    function callbackCheckValidSelection(gameCoord) {
        object.x(gameCoord.x);
        object.y(gameCoord.y);
        //self.mapControl.map.renderObj(object);
        self.tmpEvent.setCoordinates(gameCoord);
        var valid = self.tmpEvent.isValid();
        if (valid) {
            object.objectBitmap.alpha = 1;
        }
        else {
            object.objectBitmap.alpha = 0.3;
        }
        return valid;
    }

    function callbackCanceled() {
        self.tmpEvent = null;
        self.mapControl.map.deleteTempObj();
    }

    this.mapControl.setStateSelectCoord(callbackOnSelect, callbackCheckValidSelection, callbackCanceled);
};




