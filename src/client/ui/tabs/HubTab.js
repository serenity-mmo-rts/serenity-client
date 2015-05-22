var HubTab = function (mapObj) {

    this.mapObj = mapObj;
    var self = this;
    this.content= $('<div id="mainTab"></div>');
    this.nrObjects = $('<div>.html(Number(0))</div>');
    this.nrObjects.appendTo(this.content);
   // this.updateNrObjectsConnected();

}

HubTab.prototype.updateNrObjectsConnected = function() {
    this.nrObjects = this.mapObj.getObjectsConnected();

};