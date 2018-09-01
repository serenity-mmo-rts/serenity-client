
var UiPlaceItemMenu = function ( layerView ) {

    var self = this;

    this.layerView = layerView;
    this.mapId = ko.computed(function () {
        return self.layerView.loadedMapId();
    });
    this.objectsToPlace =  ko.observableArray([]);

    this.mapId.subscribe(function(newValue) {
        if(newValue){
            self.showPlaceObjects();
        }
    });

};

UiPlaceItemMenu.prototype.showPlaceObjects = function () {  // ObjectID missing
    var self = this;
    var mapObjects = game.layers.get(this.mapId()).mapData.mapObjects.hashList;
    var tempArr = [];
    var count = 0;
    for (var id in mapObjects) {
        if (mapObjects[id].needsTobePlaced()){
            var object = mapObjects[id];
            var objectTypeId = object.objTypeId();
            var objectType = game.objectTypes.get(objectTypeId);
            var objectEntry = {
                _id: object._id(),
                buildMenuItemId: count,
                objectTypeId: objectTypeId,
                iconSpritesheetId: objectType.iconSpritesheetId,
                iconSpriteFrame: objectType.iconSpriteFrame,
                clickHandler: function(data, event) {
                    self.initializeObject(data);
                }
            };
            tempArr.push(objectEntry);
            count ++;
            object.needsTobePlaced.subscribe(function(newValue) {
                if(!newValue){
                    self.removeFromPlaceObjects(object)
                }
            });
        }
    }
    // now update the member variable:
    this.objectsToPlace(tempArr);
};

UiPlaceItemMenu.prototype.removeFromPlaceObjects = function (object) {
    for (i=0;i<this.objectsToPlace().length; i++){
        var arrayObject = this.objectsToPlace()[i];
        if (arrayObject._id ==object._id()){
            this.objectsToPlace.splice(i,1);
        }

    }
};

UiPlaceItemMenu.prototype.addToPlaceObjects = function (object) {
    var pos = this.objectsToPlace().indexOf(object._id);
    if (pos ==-1){
        this.objectsToPlace.push(object)
    };
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




