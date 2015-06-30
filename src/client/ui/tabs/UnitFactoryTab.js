
var UnitFactoryTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>').css({'display': 'inline-block'});
    this.createUnits();
    this.availableUnits();

}


UnitFactoryTab.prototype.createUnits = function () {
    var self = this;
    var wrap1 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px'});
    var creationTitle =  $('<div>Recruitment</div>').css({});
    var creationBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
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
        var img = spritesheet.images[spriteFrameIcon[4]];
        var gap = 8;

        var container= $('<div style="white-space:nowrap"></div>').css({'width':breite, 'height':hoehe, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
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
    creationTitle.appendTo(wrap1);
    creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

}


UnitFactoryTab.prototype.availableUnits = function () {
    var self = this;
    var wrap2 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px','top':'200','position': 'absolute'});
    var availableTitle =  $('<div>Available Units</div>').css({});
    var availableBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allItems= this.mapObj.getItems();

    for (var i = 0; i<allItems.length; i++){
        var itemId = allItems[i]._itemTypeId;
        var itemType =  game.itemTypes.get(itemId);
        var type =  itemType._type;
        var position = allItems[i].getPosition();
        if (type == "Unit" && position == "Base") {

            var spritesheet = game.spritesheets.get(itemType._iconSpritesheetId);
            var spriteFrameIcon = spritesheet.frames[itemType._iconSpriteFrame];
            var x = spriteFrameIcon[0];
            var y = spriteFrameIcon[1];
            var breite = spriteFrameIcon[2];
            var hoehe = spriteFrameIcon[3];
            var img = spritesheet.images[spriteFrameIcon[4]];
            var gap = 8;

            var container= $('<div style="white-space:nowrap"></div>').css({'width':32, 'height':32, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
            var image = $('<div style="white-space:nowrap" ></div>')
            image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
            image.appendTo(container);
            container.appendTo(availableBox);
            var self = this;
            container.click(function (e) {
                //e.stopImmediatePropagation();
                // e.preventDefault();
            });
        }

        }

    availableTitle.appendTo(wrap2);
    availableBox.appendTo(wrap2);
    wrap2.appendTo(this.content);

}


