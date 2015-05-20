var UiObjectContext = function () {
    var self = this;

    this.mapObjId = null;
    this.mapObj = null;

    this.content = $('<div>').addClass("ui-widget");
    this.content.css({
        "min-width": "200px"
    });

    this.header = $('<div id="objHeader"></div>').appendTo(this.content);
    this.tabs = $('<div id="objContextTabs" class="tabs-bottom"></div>').appendTo(this.content);

    this.tabs.tabs();

    // fix the classes
    $( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
        .removeClass( "ui-corner-all ui-corner-top" )
        .addClass( "ui-corner-bottom" );

    // move the nav to the bottom
    $( ".tabs-bottom .ui-tabs-nav" ).appendTo( ".tabs-bottom" );
}

UiObjectContext.prototype.loadObjectById = function(mapObjId) {
   // this.mapObjId = mapObjId;
    this.mapObjId = mapObjId;
    this.map = game.maps.get(uc.layer.mapId);
    this.mapObj = this.map.mapObjects.get(mapObjId);
     var self= this;
    $(this.header).empty();
    $(this.tabs).empty();
    this.createHeader(this.mapObj);
    this.mapObj.addCallback("renderUI", function(){self.loadObjectById(mapObjId);});
    if (this.mapObj.hasOwnProperty("userId")){
        this.createTabs(this.mapObj);
    }
};


UiObjectContext.prototype.createHeader = function(mapObj) {

    this.headerContent = $('<div></div>');
    if (this.mapObj.hasOwnProperty("healthPoints")){
        var percentHP = this.mapObj.getHealthPointsPercent();
        this.healthPoints = $('<div id="healthPoints"></div>').appendTo(this.headerContent);
        this.healthPoints.progressbar({
            value: percentHP
        })
    }
    var objectType =  game.objectTypes.get(this.mapObj.objTypeId);
    var spritesheet = game.spritesheets.get(objectType._iconSpritesheetId);
    var spriteFrameIcon = spritesheet.frames[objectType._iconSpriteFrame];
    var img = spritesheet.images[spriteFrameIcon[4]];
    //$('<img src='+img+'>').appendTo(this.headerContent);
    var image = $('<span class="buildMenuImg" style="background-image: url('+img+'); background-position:-'+spriteFrameIcon[0]+'px -'+spriteFrameIcon[1]+'px" />').appendTo(this.headerContent);
    var points = this.mapObj.getPoints();
    var level = this.mapObj.getLevel(points);
    var title = $('<span style="white-space:nowrap;">' + this.mapObj.objTypeId + ' Level: ' + level+ '</span><br>')
       // title.style.textAlign = "center";
        title.appendTo(this.headerContent);

    this.progressbar = $('<div id="progressbar"></div>').appendTo(this.headerContent);
    this.progressbar.progressbar({
        value: 0
    });

    this.header.html(this.headerContent)
};

UiObjectContext.prototype.createTabs = function(mapObj) {

    this.tabsHeaders = $('<ul></ul>');
    $('<li><a href="#itemsTab">Items</a></li>').appendTo(this.tabsHeaders);
    $('<li><a href="#sublayerTab">Sublayer</a></li>').appendTo(this.tabsHeaders);
    this.tabs.html(this.tabsHeaders);
   switch(game.objectTypes.get(this.mapObj.objTypeId)._className) {
        case "Factory":
            this.maintab =  new FactoryTab(this.mapObj);
        case "Hub":
            this.maintab =  new HubTab(this.mapObj);
        case "UnitFactory":
            this.maintab =  new UnitFactoryTab(this.mapObj);
        case "ScienceCenter":
            this.maintab = new ScienceCenterTab(this.mapObj);
        case "Sublayer":
            this.maintab = new SublayerTab(this.mapObj);
        }
    this.maintab.content.appendTo(this.tabs)

    this.itemtab = new ItemTab(mapObj);
    this.itemtab.content.appendTo(this.tabs);
    //this.resourcetab = new ResourceTab();
    //this.unittab = new UnitTab();
    //this.upgradetab = new UpgradeTab();
    //this.defensetab = new DefenseTab();
    //this.offensetab = new OffenseTab();



    this.tabs.tabs( "refresh" );
    uc.layer.uiObjectContextPanel.update(0);

};

UiObjectContext.prototype.updateProgress = function(val) {
    this.progressbar.progressbar("value", val);
};

UiObjectContext.prototype.getRessourceContextMenu = function() {

};
UiObjectContext.prototype.getItemsContextMenu = function() {

};

UiObjectContext.prototype.tick = function() {

    if (this.mapObj){
        if (this.mapObj.hasOwnProperty("buildQueue")){
            if (this.mapObj.buildQueue.length>0) {
               this.updateProgress(this.mapObj.buildQueue[0].progress());
            }
            else {
                this.updateProgress(0);
            }
        }
    }
};

