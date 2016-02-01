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

        self.tmpEvent = new BuildConnectionEvent(game);
        self.tmpEvent.setHubObject(self.mapObj);

        function callbackOnSelect(objId){
            uc.addEvent(self.tmpEvent);
            self.tmpEvent = null;
        }
        function callbackCheckValidSelection(objId){
            self.tmpEvent.setMapObjectById(objId);
            return self.tmpEvent.isValid();
        }
        uc.layerView.mapContainer.mapControl.setStateSelectObj(callbackOnSelect,callbackCheckValidSelection);

    });

    this.freePorts = $('<div>free ports: ' + freePorts + '</div>');
    this.freePorts.appendTo(this.content);
   // this.updateNrObjectsConnected();

}

HubTab.prototype.updateNrObjectsConnected = function() {
    this.nrObjects = this.mapObj.getObjectsConnected();

};