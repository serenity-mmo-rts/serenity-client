var SublayerTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>');
    var openSublayerBtn = $('<input id="openSublayer" type="button" value="openSublayer"/>').appendTo(this.content);
    this.sublayerMapId = this.mapObj.sublayerId();
    var self = this;

    openSublayerBtn.click(function (e) {

        e.stopImmediatePropagation();
        e.preventDefault();
        uc.loadMap(self.sublayerMapId);
    });


}
