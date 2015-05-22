var SublayerTab = function (mapObj) {

    this.mapObj = mapObj;
    var self = this;
    this.content= $('<div id="mainTab"></div>');

    var openSublayerBtn = $('<input id="openSublayer" type="button" value="openSublayer"/>').appendTo(this.content);
    var sublayerMapId = this.mapObj.sublayerMapId;
    openSublayerBtn.click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        uc.loadMap(sublayerMapId);
    });


}
