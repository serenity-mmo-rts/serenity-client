var UiObjectContext = function () {
    var self = this;

    this.mapObjId = null;
    this.mapObj = null;

    this.content = $('<div>').addClass("ui-widget");
    this.content.css({
        "min-width": "200px"
    });

    this.infos = $('<div id="objInfos"></div>').appendTo(this.content);
    this.tabs = $('<div id="objContextTabs" class="tabs-bottom"></div>').appendTo(this.content);

    this.tabs.tabs();

    // fix the classes
    $( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
        .removeClass( "ui-corner-all ui-corner-top" )
        .addClass( "ui-corner-bottom" );

    // move the nav to the bottom
    $( ".tabs-bottom .ui-tabs-nav" ).appendTo( ".tabs-bottom" );
}

UiObjectContext.prototype.loadObjectId = function(mapObjId) {
   // this.mapObjId = mapObjId;
    this.map = game.maps.get(uc.layer.mapId);
    this.mapObj = this.map.mapObjects.get(mapObjId);

    this.infos.html('<span style="white-space:nowrap;">ObjectId: ' + mapObjId + '</span><br><span style="white-space:nowrap;">TypeId: ' + this.mapObj.objTypeId + '</span><br>');

    var objType = game.objectTypes.get(this.mapObj.objTypeId);
    if (objType._className == "Sublayer") {
        var openSublayerBtn = $('<input id="openSublayer" type="button" value="openSublayer"/>').appendTo(this.infos);
        var sublayerMapId = this.mapObj.sublayerMapId;
        openSublayerBtn.click(function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            uc.loadMap(sublayerMapId);
        });
    }



    this.tabsHeaders = $('<ul></ul>');
    $('<li><a href="#ressourcesTab">Ressources</a></li>').appendTo(this.tabsHeaders);
    $('<li><a href="#itemsTab">Items</a></li>').appendTo(this.tabsHeaders);
    $('<li><a href="#existingItemsTab">Existing Items</a></li>').appendTo(this.tabsHeaders);
    this.tabs.html(this.tabsHeaders);
    $('<div id="ressourcesTab">Ressources</div>').appendTo(this.tabs);
    $('<div id="existingItemsTab">Existing Items</div>').appendTo(this.tabs);

    var itemTab = $('<div id="itemsTab"></div>');
    itemTab.appendTo(this.tabs);

    var allowedItemIds= game.objectTypes.get(this.mapObj.objTypeId)._initProperties._itemIds;

   // for (var i = 0; i<allowedItemIds; i++){
        var itemId = allowedItemIds[0];
        var self = this;
        var createItemButton = $('<input id="itemId" type="button" value="build Item"/>').appendTo(itemTab);
        createItemButton.click(function (e) {
            //e.stopImmediatePropagation();
           // e.preventDefault();
            var tempId = "tempID"+Math.random();
            var item = new ItemModel(game,{_id: tempId,_objectId:mapObjId,_itemTypeId:itemId,_mapId:uc.layer.mapId})
            var evt = new BuildItemEvent(game);
            evt.setItem(item);
            uc.addEvent(evt);
        });

   // }
   this.progressbar = $('<div id="progressbar"></div>').appendTo(itemTab);
        this.progressbar.progressbar({
            value: 0
        });


    this.tabs.tabs( "refresh" );

    uc.layer.uiObjectContextPanel.update(0);
};

UiObjectContext.prototype.getRessourceContextMenu = function() {

};

UiObjectContext.prototype.updateProgress = function(val) {
    this.progressbar.progressbar("value", val);
};

UiObjectContext.prototype.getItemsContextMenu = function() {

};

UiObjectContext.prototype.tick = function() {
    if (this.mapObj){
        if (this.mapObj.buildQueue.length>0) {
           this.updateProgress(this.mapObj.buildQueue[0].progress());
        }
        else {
            this.updateProgress(0);
        }
    }
};
