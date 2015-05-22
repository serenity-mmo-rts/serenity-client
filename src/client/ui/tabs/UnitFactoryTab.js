
var UnitFactoryTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>');
    this.createItems();

}


UnitFactoryTab.prototype.createItems = function () {
    var self = this;
    var allowedItemIds= game.objectTypes.get(this.mapObj.objTypeId)._initProperties._itemIds;
    for (var i = 0; i<allowedItemIds.length; i++){
        var itemId = allowedItemIds[0];
        var createItemButton = $('<input id="itemId" type="button" value="build Item"/>').appendTo(this.content);
        var self = this;
        createItemButton.click(function (e) {
            //e.stopImmediatePropagation();
            // e.preventDefault();
            var tempId = "tempID"+Math.random();
            var item = new ItemModel(game,{_id: tempId,_objectId:self.mapObj._id,_itemTypeId:itemId,_mapId:uc.layer.mapId})
            var evt = new BuildItemEvent(game);
            evt.setItem(item);
            uc.addEvent(evt);
        });
    }

}



