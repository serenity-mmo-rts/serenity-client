var MapControl = function (map) {

    var self = this;
    this.map = map;
    this.map.mapControl = this;
    // this.minimap = minimap;
    this.stage = map.stage;
    this.main_container = map.main_container;


    this.controlState = {};
    this.controlState.DEFAULT = 0;
    this.controlState.INITOBJ = 1;
    this.controlState.DELOBJ = 2;
    this.controlState.MOVEOBJ = 3;
    this.controlState.ITEMTARGET = 4;
    this.controlState.ATTACKTARGET = 5;

    this.state = this.controlState.DEFAULT;

    // event listener for main container
    this.main_container.addEventListener("mousedown", (function (evt) {
        self.handleMousedownMain(evt)
    }));

}


MapControl.prototype.handleMousedownMain = function (evt) {
    var self = this;


    switch (this.state) {


        case this.controlState.DEFAULT:
            var hitObjId = this.map.getCurrentObject();
            if (hitObjId) {     // open Object Menu
                uc.layer.uiObjectContext.loadObjectById(hitObjId);
            }

            else { // drag main container

                var startDragAt = this.main_container.globalToLocal(evt.stageX, evt.stageY);
                evt.addEventListener("mousemove", function (ev) {
                    var mouseAt = self.main_container.globalToLocal(ev.stageX, ev.stageY);
                    self.main_container.x += mouseAt.x - startDragAt.x;
                    self.main_container.y += mouseAt.y - startDragAt.y;
                });


                evt.addEventListener("mouseup", function (ev) {

//                    var minicoords =  self.minimap.render2game.maps.get(uc.layer.mapId).mapObjects.hashListMiniCoords(-self.main_container.x,-self.main_container.y);
                    //                  self.minimap.location.x = minicoords[0];
                    //                  self.minimap.location.y = minicoords[1];
                    self.map.checkRendering();
                    var mouseAt = self.main_container.globalToLocal(ev.stageX, ev.stageY);
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
    }

}

MapControl.prototype.cancelState = function () {
    this.state = this.controlState.DEFAULT;
    this.map.deleteTempObj();
}


MapControl.prototype.setStateBuild = function (objTypeId) {

    this.cancelState();
    this.state = this.controlState.INITOBJ;

    //this.map.addTempObj(new MapObject(game, {_id: 'tempObject', mapId: this.map.mapId, x: 0, y: 0, objTypeId: objTypeId, userId: uc.userId, state: mapObjectStates.TEMP}));

    var object = createMapObject(game, {_id: 'tempObject', mapId: this.map.mapId, x: 0, y: 0, objTypeId: objTypeId, userId: uc.userId, state: mapObjectStates.TEMP});

    this.map.addTempObj(object);
    this.map.tempGameEvent = new BuildObjectEvent(game);
    this.map.tempGameEvent.setMapObject(this.map.tempObj);

}

MapControl.prototype.tick = function () {

}

