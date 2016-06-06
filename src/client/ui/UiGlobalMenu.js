var UiGlobalMenu = function () {
    var self = this;

    this.content = $('<div>').addClass("ui-widget");

    if (uc.userId) {
        $('<b>userId: '+uc.userId+'</b>').appendTo(this.content);
    }
    else {
        $('<b>not logged in</b>').appendTo(this.content);
    }

    this.fps = $('<div>fps: </div>');
    this.fps.appendTo(this.content);

    this.mouseCoord = $('<div>x: , y: </div>');
    this.mouseCoord.appendTo(this.content);

    this.debugText = $('<div></div>');
    this.debugText.appendTo(this.content);

    var parentLayerId = game.layers.get(uc.layerView.mapId).parentMapId;
    if (parentLayerId) {
        var openParentLayerBtn = $('<input id="openParentLayer" type="button" value="openParentLayer"/>').appendTo(this.content);
        openParentLayerBtn.click(function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            uc.loadMap(parentLayerId);
        });
    }

    this.testImage = new SpriteImg('cityBuildingsSprite01',5,50,50);
    this.testImage.content.appendTo(this.content);

}

UiGlobalMenu.prototype.setFPS = function(fps) {
    this.fps.text("fps: " + fps.toString());
}

UiGlobalMenu.prototype.setMouseCoord = function(mouseCoord) {
    this.mouseCoord.text("x: " + Math.round(mouseCoord.x).toString() + ", y: " + Math.round(mouseCoord.y).toString());
}

UiGlobalMenu.prototype.setDebugText = function(debugText) {
    this.debugText.text(debugText);
}
