var MapControl = function (map) {

    var self = this;
    this.map = map;
   // this.map.mapControl = this;
    // this.minimap = minimap;

    this.controlState = {};
    this.controlState.DEFAULT = 0;
    this.controlState.INITOBJ = 1;
    this.controlState.DELOBJ = 2;
    this.controlState.MOVEOBJ = 3;
    this.controlState.ITEMTARGET = 4;
    this.controlState.ATTACKTARGET = 5;
    this.controlState.SELECTOBJ = 6;

    this.state = this.controlState.DEFAULT;

    // member variable to store a callback function which is executed after selection of object/item on map with the selected object
    this.callbackOnSelect = null;
    // member variable to store a callback function which is executed during a selection operation to check whether the object/item below the cursor is a valid selection target
    this.callbackCheckValidSelection = null;


    // event listener for main container
    this.map.main_container.addEventListener("mousedown", (function (evt) {
        self.handleMousedownMain(evt)
    }));

}


MapControl.prototype.handleMousedownMain = function (evt) {
    var self = this;


    switch (this.state) {


        case this.controlState.DEFAULT:
            var hitObjId = this.map.getCurrentObject();
            if (hitObjId) {     // open Object Menu
                uc.layerView.uiObjectContext.loadObjectById(hitObjId);
                uc.layerView.uiObjectContextPanel.show(200);
            }

            else { // drag main container

                var startDragAt = this.map.main_container.globalToLocal(evt.stageX, evt.stageY);
                var mouseMoved = false;
                var main_container = this.map.main_container;
                evt.addEventListener("mousemove", function (ev) {
                    var mouseAt = main_container.globalToLocal(ev.stageX, ev.stageY);
                    main_container.x += mouseAt.x - startDragAt.x;
                    main_container.y += mouseAt.y - startDragAt.y;
                    mouseMoved = true;
                });


                evt.addEventListener("mouseup", function (ev) {

//                    var minicoords =  self.minimap.render2game.layers.get(uc.layerView.mapId).mapData.mapObjects.hashListMiniCoords(-self.main_container.x,-self.main_container.y);
                    //                  self.minimap.location.x = minicoords[0];
                    //                  self.minimap.location.y = minicoords[1];
                    self.map.checkRendering();

                    if (mouseMoved==false) {
                        uc.layerView.uiObjectContext.loadObjectById(null);
                        uc.layerView.uiObjectContextPanel.hide(200);
                    }
                });
            }

            break;

        case this.controlState.INITOBJ:
            if (this.map.tempGameEvent.isValid()) {
                uc.addEvent(this.map.tempGameEvent);
            }
            this.cancelState();


            break;

        case this.controlState.DELOBJ:

            break;

        case this.controlState.MOVEOBJ:

            break;

        case this.controlState.ITEMTARGET:

            break;

        case this.controlState.ATTACKTARGET:

            break;

        case this.controlState.SELECTOBJ:

            var hitObjId = this.map.getCurrentObject();
            if (this.callbackCheckValidSelection(hitObjId)) {
                document.body.style.cursor='pointer';
                this.callbackOnSelect(hitObjId);
            }
            this.cancelState();
            break;
    }

}

MapControl.prototype.cancelState = function () {
    this.state = this.controlState.DEFAULT;
    this.map.deleteTempObj();

    document.body.style.cursor='default';
    this.callbackOnSelect = null;
    this.callbackCheckValidSelection = null;
}


MapControl.prototype.setStateBuild = function (objTypeId) {

    this.cancelState();
    this.state = this.controlState.INITOBJ;

    //this.map.addTempObj(new MapObject(game, {_id: 'tempObject', mapId: this.map.mapId, x: 0, y: 0, objTypeId: objTypeId, userId: uc.userId, state: mapObjectStates.TEMP}));

    var object = new MapObject(game, {_id: 'tempObject', mapId: this.map.mapId, x: 0, y: 0, objTypeId: objTypeId, userId: uc.userId, state: mapObjectStates.TEMP});

    this.map.addTempObj(object);
    this.map.tempGameEvent = new BuildObjectEvent(game);
    this.map.tempGameEvent.setMapObject(this.map.tempObj);

}

/**
 *
 * @param callbackOnSelect callback(objectId) that is executed after selection of object/item on map with the selected object
 * @param callbackCheckValidSelection callback(objectId){return bool} which is executed during a selection operation to check whether the object/item below the cursor is a valid selection target
 */
MapControl.prototype.setStateSelectObj = function (callbackOnSelect,callbackCheckValidSelection) {
    this.cancelState();
    this.state = this.controlState.SELECTOBJ;

    this.callbackOnSelect = callbackOnSelect;
    this.callbackCheckValidSelection = callbackCheckValidSelection;
}

MapControl.prototype.tick = function () {
    if (this.state == this.controlState.SELECTOBJ) {
        var hitObjId = this.map.getCurrentObject();
        if (this.callbackCheckValidSelection(hitObjId)) {
            document.body.style.cursor='pointer';
        }
        else {
            document.body.style.cursor='default';
        }

    }
}

