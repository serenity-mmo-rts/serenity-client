var BuildMenu = function ( layerView ) {
    var self = this;

    this.layerView = layerView;
    this.mapId = ko.computed(function () {
        return self.layerView.loadedMapId();
    });
    this.mapControl = null;
    this.buildMenuData = ko.observableArray([]);
    this.mapTypeId = ko.computed(function () {
        if (this.mapId()) {
            return game.layers.hashList[this.mapId()].mapTypeId();
        }
        else {
            return 0;
        }
    }, this);

    this.mapTypeId.subscribe(function (mapTypeId) {
        if (mapTypeId) {
            var buildCategories = game.layerTypes.hashList[mapTypeId].buildCategories;
            var objectTypes = [];

            // Now create all menu entries of all categories:
            var numCat = buildCategories.length;
            for (var i = 0; i < numCat; i++) {
                var objectTypesOfThisCategory = [];
                var numTypes = buildCategories[i].objectTypeIds.length;
                for (var k = 0; k < numTypes; k++) {
                    var objectTypeId = buildCategories[i].objectTypeIds[k];
                    var objectType = game.objectTypes.hashList[objectTypeId];
                    var objectEntry = {
                        tooltip: 'buildTime: '+objectType.buildTime,
                        buildMenuItemId: k,
                        objectTypeId: objectTypeId,
                        name: objectType.name,
                        iconSpritesheetId: objectType.iconSpritesheetId,
                        iconSpriteFrame: objectType.iconSpriteFrame,
                        clickHandler: function(data, event) {
                            self.initializeObject(data.objectTypeId);
                        }
                    };
                    objectTypesOfThisCategory.push(objectEntry);
                }
                objectTypes.push({ name: buildCategories[i].name, objectTypes: ko.observableArray(objectTypesOfThisCategory)});
            }

            // now update the member variable:
            self.buildMenuData(objectTypes);

            // refresh the accordion:
            $("#buildMenu" ).accordion();
            $("#buildMenu").accordion({
                heightStyle: "fill"
            });
            $("#buildMenu").accordion( "refresh" );

        }
    });

    this.afterRenderCb = null;
};

BuildMenu.prototype.afterRender = function () {
    if (this.afterRenderCb) {
        this.afterRenderCb();
    }
};

BuildMenu.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

    $("#bottomLeftUi").toggleClass("hidden", 500, "easeOutSine");

    var object = new MapObject(game.layers.hashList[this.mapId()].mapData.mapObjects, {
        _id: 'tempObject',
        mapId: this.mapId(),
        x: 0,
        y: 0,
        objTypeId: objectTypeId,
        userId: uc.userId,
        state: State.TEMP
    });
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

