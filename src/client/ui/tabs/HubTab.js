var HubTab = function (mapObj) {

    this.mapObj = mapObj;
    var self = this;
    this.content= $('<div id="mainTab"></div>');

    var freePorts = this.mapObj._blocks.HubConnectivity.getFreePorts();
    if (freePorts>0) {
        var buildConnectionBtn = $('<input id="buildConn" type="button" value="Build Connection"/>').appendTo(this.content);
    }
    else {
        var buildConnectionBtn = $('<input id="buildConn" type="button" value="Build Connection" disabled />').appendTo(this.content);
    }

    this.tmpEvent = null;
    var self = this;
    buildConnectionBtn.click(function (e) {

        e.stopImmediatePropagation();
        e.preventDefault();

        var connectionObjTypeId = self.mapObj._blocks.HubNode.canBuildConnectionTypeId;

        var object = new MapObject(game, {_id: 'tempObject', mapId: self.mapObj.mapId(), x: 0, y: 0, objTypeId: connectionObjTypeId, userId: uc.userId, state: mapObjectStates.TEMP});
        object._blocks.Connection.connectedFrom(self.mapObj._id());

        self.tmpEvent = new BuildObjectEvent(game);
        self.tmpEvent.setParameters(object,self.mapObj._id());
        uc.layerView.mapContainer.mapControl.map.addTempObj(object);

        function callbackOnSelect(objId){
            uc.layerView.mapContainer.mapControl.map.deleteTempObj();
            uc.addEvent(self.tmpEvent);
            self.tmpEvent = null;
        }
        function callbackCheckValidSelection(objId){
            self.tmpEvent.setTargetConnection(objId);
            object._blocks.Connection.connectedTo(objId);
            uc.layerView.mapContainer.mapControl.map.renderObj(object);
            var valid = self.tmpEvent.isValid();
            if (valid) {
                object.objectBitmap.alpha = 1;
            }
            else {
                object.objectBitmap.alpha = 0.2;
            }
            return valid;
        }
        function callbackCanceled(){
            self.tmpEvent = null;
            uc.layerView.mapContainer.mapControl.map.deleteTempObj();
        }
        uc.layerView.mapContainer.mapControl.setStateSelectObj(callbackOnSelect,callbackCheckValidSelection,callbackCanceled);

    });

    this.freePorts = $('<div>free ports: ' + freePorts + '</div>');
    this.freePorts.appendTo(this.content);
   // this.updateNrObjectsConnected();

}

HubTab.prototype.updateNrObjectsConnected = function() {
    this.nrObjects = this.mapObj.getObjectsConnected();

};