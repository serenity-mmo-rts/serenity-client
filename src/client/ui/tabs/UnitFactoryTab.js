
var UnitFactoryTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>');
    this.createItems();

}





UnitFactoryTab.prototype.createItems = function () {
    var self = this;
    var creationTitle =  $('<div>Recruitment</div>').css({});
    var creationBox =  $('<div></div>').css({'border':'1px solid blue','width':160, 'height':130, 'position': 'relative'});
    var allowedItemIds= game.objectTypes.get(this.mapObj.objTypeId)._initProperties._itemIds;


    for (var i = 1; i<allowedItemIds.length; i++){
        var itemId = allowedItemIds[i-1];
        var itemType =  game.itemTypes.get(itemId);
        var spritesheet = game.spritesheets.get(itemType._iconSpritesheetId);
        var spriteFrameIcon = spritesheet.frames[itemType._iconSpriteFrame];
        var x = spriteFrameIcon[0];
        var y = spriteFrameIcon[1];
        var breite = spriteFrameIcon[2];
        var hoehe = spriteFrameIcon[3];
        var scale = (100/breite);
        var img = spritesheet.images[spriteFrameIcon[4]];
        var gap = 8;

       // var createItemButton = $('<input id="itemId" type="button" value="build Item"/>').appendTo(this.content);

        var container= $('<div style="white-space:nowrap"></div>').css({'width':32, 'height':32, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
        //var container= $('<div style="white-space:nowrap"></div>').css({'top':'0','left':i,'width':32, 'height':32,'display': 'inline'});
        var image = $('<div style="white-space:nowrap" ></div>')
        image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
        image.appendTo(container);
        container.appendTo(creationBox);
        var self = this;
        container.click(function (e) {
            //e.stopImmediatePropagation();
            // e.preventDefault();
            var tempId = "tempID"+Math.random();
            var item = new ItemModel(game,{_id: tempId,_objectId:self.mapObj._id,_itemTypeId:itemId,_mapId:uc.layer.mapId})
            var evt = new BuildItemEvent(game);
            evt.setItem(item);
            uc.addEvent(evt);
        });
    }
    creationTitle.appendTo(this.content)
    creationBox.appendTo(this.content);

}



