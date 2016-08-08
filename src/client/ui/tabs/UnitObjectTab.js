var UnitObjectTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>');
    this.createMainContent();
};


UnitObjectTab.prototype.createMainContent = function () {
    var buttonContainer = $('<div></div>');
    var openSublayerBtn = $('<input id="moveObjectUp" type="button" value="moveObjectUp"/>');
    openSublayerBtn.appendTo(buttonContainer);
    this.moveObjectToUpperLayer(buttonContainer);
    buttonContainer.appendTo(this.content);
};


UnitObjectTab.prototype.moveObjectToUpperLayer = function (container) {
    var self = this;
    container.click(function (e) {
        var evt = new MoveThroughLayerEvent(game);
        evt.setParameters(self.mapObj);
        uc.addEvent(evt);
    });
};


