var UiGlobalMenu = function () {
    var self = this;

    this.content = $('<div>').addClass("ui-widget");

    if (uc.userId) {
        $('<b>userId: '+uc.userId+'</b>').appendTo(this.content);
    }
    else {
        $('<b>not logged in</b>').appendTo(this.content);
    }

    var parentLayerId = game.layers.get(uc.layerView.mapId).parentMapId;
    if (parentLayerId) {
        var openParentLayerBtn = $('<input id="openParentLayer" type="button" value="openParentLayer"/>').appendTo(this.content);
        openParentLayerBtn.click(function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            uc.loadMap(parentLayerId);
        });
    }

}
