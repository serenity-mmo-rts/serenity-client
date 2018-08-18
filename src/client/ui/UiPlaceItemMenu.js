
var UiPlaceItemMenu = function ( layerView ) {

    var self = this;

    this.layerView = layerView;
    this.mapId = ko.computed(function () {
        return self.layerView.loadedMapId();
    });
    this.objectsToPlace =  ko.observableArray([]);
    this.mapObjects = ko.computed(function () {
        if (this.mapId()) {
            return game.layers.hashList[this.mapId()].mapData.mapObjects.hashList;
        }
        else {
            return 0;
        }
    }, this);

    this.mapObjects.subscribe(function (mapTypeId) {

        if (mapTypeId) {
            var tempArr = [];
            var count = 0;
            for (var id in self.mapObjects()) {
                if (self.mapObjects()[id].needsTobePlaced()){
                    var object = self.mapObjects()[id];
                    var objectTypeId = object.objTypeId();
                    var objectType = game.objectTypes.hashList[objectTypeId];
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
                }
            }

            // now update the member variable:
            self.objectsToPlace(tempArr);

        }
    });

};




UiPlaceItemMenu.prototype.initializeObject = function (objectParams) {  // ObjectID missing

    this.tmpEvent = new PlaceObjectEvent(game.layers.hashList[this.mapId()].eventScheduler.events);
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




