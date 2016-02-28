var UiObjectContext = function () {
    var self = this;

    this.mapObjId = null;
    this.mapObj = null;

    var mapObjectMenuX = canvas.width/2;
    var mapObjectMenuY = canvas.height/3;

    this.content = $('<div>').addClass("ui-widget");
    this.content.css({
        "min-width": "200px"
    });

    this.container = $('<div id="container"></div>').css({'top':mapObjectMenuY, 'left': mapObjectMenuX,'width':mapObjectMenuX,'height':mapObjectMenuY,'display': 'inline-block'}).appendTo(this.content);
    this.header = $('<div id="objHeader"></div>').appendTo(this.container);
    this.tabs = $('<div id="objContextTabs" class="tabs-bottom"></div>').appendTo(this.container);
    this.header.css({'width':25+'%','display': 'inline-block'});
    this.tabs.css({'width':75+'%','display': 'inline-block','position': 'absolute','white-space':'nowrap','overflow':'hidden'});
    this.tabs.tabs();

    // fix the classes
    $( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
        .removeClass( "ui-corner-all ui-corner-bottom" )
        .addClass( "ui-corner-bottom" );

    // move the nav to the bottom
    $( ".tabs-bottom .ui-tabs-nav" ).appendTo( ".tabs-bottom" );
}

UiObjectContext.prototype.loadObjectById = function(mapObjId) {

    if (this.mapObj!=null){
        this.mapObj.removeCallback("renderUI");
    }

    this.mapObj = null;

    if (mapObjId) {
        this.mapObjId = mapObjId;

        this.map = game.layers.get(uc.layerView.mapId);
        this.mapObj = this.map.mapData.mapObjects.get(mapObjId);
        this.objetType = game.objectTypes.get(this.mapObj.objTypeId);
        this.className = this.objetType._className;

        var self= this;

        this.mapObj.addCallback("renderUI", function(){self.update();});

    }

    this.update();

};



UiObjectContext.prototype.update = function() {

    if (this.tabs!=undefined) {
        this.activeTab= this.tabs.tabs('option', 'active');
        if (!this.activeTab){
            this.activeTab = 0;
        }
    }
    this.header.empty();
    this.tabs.empty();
    if (this.mapObj) {
        if (this.mapObj._blocks.hasOwnProperty("UserObject")) {
            if (this.mapObj._blocks.hasOwnProperty("FeatureManager")) {
                if (this.mapObj._blocks.FeatureManager.getState()){
                    this.mapObj._blocks.FeatureManager.updateObjectProperties();
                }

            }
            this.mainInfo();
            this.createTabs();


        }
    }

};


UiObjectContext.prototype.mainInfo = function(mapObj) {

   var headerContent = $('<div></div>');

    // get numeric Information //
    var points = this.mapObj._blocks.UserObject.getPoints();
    var level = this.mapObj._blocks.UserObject.getLevel(points);
    var maxHp = this.mapObj._blocks.UserObject.getMaxHealthPoints();
    var Hp = this.mapObj._blocks.UserObject.getHealthPoints();
    var title = $('<div style="white-space:nowrap;">' + this.mapObj.objTypeId + ' Level: ' + level+ '</div>').css({'text-align': 'center'});
    var pointDisplay = $('<div style="white-space:nowrap;">' + 'Points: ' + points+ '</div>').css({'text-align': 'left'})
    var HealthDisplay = $('<div style="white-space:nowrap;">' + 'Health Points: ' +Hp+ '/'+maxHp+ '</div>').css({'text-align': 'left'});
    var percentHP  = (Hp/maxHp) *100;
    var healthPoints = $('<div  style="white-space:nowrap; id="healthPoints"></div>');
    healthPoints.progressbar({
        value: percentHP
    });
    healthPoints.css({'width':'50%','height':'10px','background': 'green'});

    // append numeric info
    title.appendTo(headerContent);
    $('<br>').appendTo(headerContent);
    healthPoints.appendTo(headerContent);
    HealthDisplay.appendTo(headerContent);
    pointDisplay.appendTo(headerContent);

    // Graphics //
    var spritesheet = game.spritesheets.get(this.objetType._spritesheetId);
    var spriteFrameIcon = spritesheet.frames[this.objetType._spriteFrame];
    var x = spriteFrameIcon[0];
    var y = spriteFrameIcon[1];
    var breite = spriteFrameIcon[2];
    var hoehe = spriteFrameIcon[3];
    var scale = (100/breite);
    var img = spritesheet.images[spriteFrameIcon[4]];
    var container= $('<div style="white-space:nowrap"></div>').css({'width':100, 'height':100,'zoom':scale});
    var image = $('<div style="white-space:nowrap"></div>');
    image.css({'background-image': 'url('+img+')' ,'background-position-x':-x , 'background-position-y':-y,'background-repeat':'no-repeat','width':breite+'%','height':hoehe+'%','background-size':'auto'});
    image.appendTo(container);
    container.appendTo(headerContent);


    // Upgrade progress bar
    this.progressbar = $('<div id="progressbar"></div>');
    this.progressbar.progressbar({
        value: 0
    });
    this.progressbar.css({'bottom':'-50px','left':'0px','width':'100%','height':'20px','position':'relative'});
    this.progressbar.appendTo(headerContent)

    // append to HTML
    this.header.html(headerContent);
};

UiObjectContext.prototype.createTabs = function() {

    // initialize Tabs
    var tabsHeaders = $('<ul></ul>').css({'width':100+'%'});
    $('<li><a href="#mainTab">Main</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#upgradeTab">Upgrades</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#laborTab">Labor</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#resourceTab">Resources</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#unitTab">Units</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#defenseTab">Defense</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    this.tabs.html(tabsHeaders);

    // select special Tab
    if (this.mapObj._blocks.hasOwnProperty("Gate")) {
        var maintab = new GateTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("ActivityPlace")) {
        var maintab = new LeisureBuildingTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("ResourceProduction") || this.mapObj._blocks.hasOwnProperty("SoilProduction")) {
        var maintab = new ResourceProducerTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("TechProduction")) {
        var maintab = new ScienceCenterTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("Sublayer")) {
        var maintab = new SublayerTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("HubNode")) {
        var maintab = new HubTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("Tower")) {
        var maintab = new TowerTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("ResourceStorage")) {
        var maintab = new StorageTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("Unit"))  {
        var maintab = new UnitObjectTab(this.mapObj);
    }
    else if (this.mapObj._blocks.hasOwnProperty("Field")) {
        var maintab = new FieldTab(this.mapObj);
    }

    var upgradestab = new UpgradesTab(this.mapObj);
    var labortab = new LaborTab(this.mapObj);
    var resourcestab = new ResourcesTab(this.mapObj);
    var unitstab = new UnitsTab(this.mapObj);
    var defensetab = new DefenseTab(this.mapObj);

    maintab.content.appendTo(this.tabs);
    upgradestab.content.appendTo(this.tabs);
    labortab.content.appendTo(this.tabs);
    resourcestab.content.appendTo(this.tabs);
    unitstab.content.appendTo(this.tabs);
    defensetab.content.appendTo(this.tabs);

    this.tabs.tabs( "refresh" );
    this.tabs.tabs({ active: this.activeTab });
    uc.layerView.uiObjectContextPanel.update(0);

};

UiObjectContext.prototype.updateProgress = function(val) {
    this.progressbar.progressbar("value", val);
};

UiObjectContext.prototype.getResourceContextMenu = function() {

};
UiObjectContext.prototype.getItemsContextMenu = function() {

};

UiObjectContext.prototype.tick = function() {

    if (this.mapObj!=undefined) {

        if (this.mapObj._blocks.hasOwnProperty("UpgradeProduction")) {

            if (this.mapObj._blocks["UpgradeProduction"].buildQueue.length > 0) {
                this.updateProgress(this.mapObj._blocks["UpgradeProduction"].buildQueue[0].progress());
            }
            else {
                this.updateProgress(0);
            }
        }
    }

};

