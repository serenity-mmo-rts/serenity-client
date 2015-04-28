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
    this.mapObjId = mapObjId;
    this.mapObj = game.maps.get(uc.layer.mapId).mapObjects.get(mapObjId);

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
    this.tabs.html(this.tabsHeaders);
    $('<div id="ressourcesTab">afsd fasldf asdf afdsgsdfgh sdg </div>').appendTo(this.tabs);
    $('<div id="itemsTab">asd fasd fasdfasdf as dfjkas hdfh asdjkfh kjasdh fjklasdh fjkasd h</div>').appendTo(this.tabs);

    this.tabs.tabs( "refresh" );

    uc.layer.uiObjectContextPanel.update(0);
};

UiObjectContext.prototype.getRessourceContextMenu = function() {

};

UiObjectContext.prototype.getItemsContextMenu = function() {

};