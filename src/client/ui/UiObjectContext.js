var UiObjectContext = function () {
    var self = this;

    this.mapObjId = null;
    this.mapObj = null;
    this.lastUpdateTime = 0;

    var mapObjectMenuX = window.innerWidth/2;
    var mapObjectMenuY = window.innerHeight/3;

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


    this.resourcesTabViewModel = null;

};

UiObjectContext.prototype.loadObjectById = function(mapObjId) {


    if (this.mapObj!=null){
        this.mapObj.removeCallback("renderUI");
    }

    this.mapObj = null;

    if (mapObjId) {
        this.mapObjId = mapObjId;
        this.map = game.layers.get(uc.layerView.mapId);
        this.mapObj = this.map.mapData.mapObjects.get(mapObjId);
        this.objetType = game.objectTypes.get(this.mapObj.objTypeId());
        this.className = this.objetType.className;
        var self = this;
    }

    if (this.mapObj.blocks.hasOwnProperty("Environment")==false) {
        this.mapObj.addCallback("renderUI", function(){self.update();});
        this.update();
        uc.layerView.uiObjectContextPanel.show(200);
    }

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
        if (this.mapObj.blocks.hasOwnProperty("UserObject")) {
            this.mainInfo();
            this.createTabs();
            var itemList = this.mapObj.getItems();
            for (var item in itemList){
                uc.layerView.mapContainer.map.checkRenderingOfItem(itemList[item]);
            }
        }
    }

};


UiObjectContext.prototype.mainInfo = function(mapObj) {

   var headerContent = $('<div></div>');

    // get numeric Information //
    var points = this.mapObj.blocks.UserObject.getPoints();
    var level = this.mapObj.blocks.UserObject.getLevel(points);
    var maxHp = this.mapObj.blocks.UserObject.getMaxHealthPoints();
    var Hp = this.mapObj.blocks.UserObject.getHealthPoints();
    var title = $('<div style="white-space:nowrap;">' + this.mapObj.objTypeId() + ' Level: ' + level+ '</div>').css({'text-align': 'center'});
    var pointDisplay = $('<div style="white-space:nowrap;">' + 'Points: ' + points+ '</div>').css({'text-align': 'left'});
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
    this.objectIcon = new SpriteImg(this.objetType.iconSpritesheetId,this.objetType.iconSpriteFrame,100,100);
    this.objectIcon.content.appendTo(headerContent);

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
    $('<li><a href="#resourcesTab">Resources</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#unitTab">Units</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#defenseTab">Defense</a></li>').css({'width':15.8+'%'}).appendTo(tabsHeaders);
    this.tabs.html(tabsHeaders);

    // select special Tab
    if (this.mapObj.blocks.hasOwnProperty("Gate")) {
        var maintab = new GateTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("ActivityPlace")) {
        var maintab = new LeisureBuildingTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("ResourceProduction")) {
        var resourceProducerTabViewModel = new ResourceProducerTab(this.mapObj);
        var somePanel = createKnockoutPanel(resourceProducerTabViewModel, 'ResourceProducerTab', 'ui/tabs/ResourceProducerTab.html');
        var maintab = {
            content: $('<div id="mainTab"></div>').css({'display': 'inline-block'})
        };
        somePanel.appendTo(maintab.content);
    }
    else if (this.mapObj.blocks.hasOwnProperty("SoilPuller")) {
        this.soilPullerTabViewModel = new SoilPullerTab(this.mapObj);
        var somePanel = createKnockoutPanel(this.soilPullerTabViewModel, 'SoilPullerTab', 'ui/tabs/SoilPullerTab.html');
        var maintab = {
            content: $('<div id="mainTab"></div>').css({'display': 'inline-block'})
        };
        somePanel.appendTo(maintab.content);
    }
    else if (this.mapObj.blocks.hasOwnProperty("TechProduction")) {
        var maintab = new ScienceCenterTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("Sublayer")) {
        var maintab = new SublayerTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("HubNode")) {
        var maintab = new HubTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("Tower")) {
        var maintab = new TowerTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("ResourceManager")) {
        this.storageTabViewModel = new StorageTab(this.mapObj);
        var somePanel = createKnockoutPanel(this.storageTabViewModel, 'StorageTab', 'ui/tabs/StorageTab.html');
        var maintab = {
            content: $('<div id="mainTab"></div>')
        };
        somePanel.appendTo(maintab.content);
    }
    else if (this.mapObj.blocks.hasOwnProperty("Unit"))  {
        var maintab = new UnitObjectTab(this.mapObj);
    }
    else if (this.mapObj.blocks.hasOwnProperty("Field")) {
        var maintab = new FieldTab(this.mapObj);
    }

    var upgradestab = new UpgradesTab(this.mapObj);
    var labortab = new LaborTab(this.mapObj);
    var unitstab = new UnitsTab(this.mapObj);
    var defensetab = new DefenseTab(this.mapObj);

    this.resourcesTabViewModel = new ResourcesTab(this.mapObj);
    var somePanel2 = createKnockoutPanel(this.resourcesTabViewModel, 'resourcesTab', 'ui/tabs/ResourcesTab.html');
    var resourcestab = {
        content: $('<div id="resourcesTab"></div>')
    };
    somePanel2.appendTo(resourcestab.content);

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

        // limit update to 4 Hz:
        var currentTime = Date.now();
        if (currentTime > this.lastUpdateTime + 250) {
            this.lastUpdateTime = currentTime;

            if (this.mapObj.blocks.hasOwnProperty("UpgradeProduction")) {
                if (this.mapObj.blocks["UpgradeProduction"].buildQueueIds().length > 0) {
                    this.updateProgress(this.mapObj.blocks["UpgradeProduction"].progress());
                }
                else {
                    this.updateProgress(0);
                }
            }

            if (this.resourcesTabViewModel) {
                this.resourcesTabViewModel.tick();
            }

            if (this.storageTabViewModel) {
                this.storageTabViewModel.tick();
            }

        }

    }

};

