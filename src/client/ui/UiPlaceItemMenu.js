
var UiPlaceItemMenu = function ( layerView ) {

    var self = this;

    this.layerView = layerView;
    this.mapId = ko.computed(function () {
        return self.layerView.loadedMapId();
    });
    this.mapControl = null;
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
            for (var id in self.mapObjects()  ) {
                if (self.mapObjects()[id].needsTobePlaced()){
                    var object = self.mapObjects()[id];
                    var objectTypeId = object.objectTypeId();
                    var objectType = game.objectTypes.hashList[objectTypeId];
                    var objectEntry = {
                        tooltip: 'buildTime: '+objectType.buildTime,
                        buildMenuItemId: k,
                        objectTypeId: objectTypeId,
                        name: objectType.name,
                        iconSpritesheetId: objectType.iconSpritesheetId,
                        iconSpriteFrame: objectType.iconSpriteFrame,
                        clickHandler: function(data, event) {
                            self.initializeObject(data.object);
                        }
                    };
                    tempArr.push(objectEntry);
                }
            }

            // now update the member variable:
            self.objectsToPlace(tempArr);

        }
    });

};




UiPlaceItemMenu.prototype.initializeObject = function (object) {  // ObjectID missing
    $("#buttonPlaceItemMenuUi").toggleClass("hidden", 500, "easeOutSine");


    this.tmpEvent = new BuildObjectEvent(game.layers.hashList[this.mapId()].eventScheduler.events);
    this.tmpEvent.setParameters(object);
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




