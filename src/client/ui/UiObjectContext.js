var UiObjectContext = function () {
    var self = this;

    this.mapObjId = null;
    this.mapObj = null;

    var mapObjectMenuX = canvas.width*0.5;
    var mapObjectMenuY = canvas.height-(mapObjectMenuX/4);

    this.content = $('<div>').addClass("ui-widget");
    this.content.css({
        "min-width": "200px"
    });


    this.container = $('<div id="container"></div>').css({'top':mapObjectMenuY, 'left': mapObjectMenuX,'width':mapObjectMenuX,'height':mapObjectMenuX/4,'display': 'inline-block'}).appendTo(this.content);
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

    this.header.empty();
    this.tabs.empty();
    this.mapObj = null;

    if (mapObjId) {
        this.mapObjId = mapObjId;
        this.map = game.maps.get(uc.layer.mapId);
        this.mapObj = this.map.mapObjects.get(mapObjId);
        var self= this;

        this.createHeader(this.mapObj);
        this.mapObj.addCallback("renderUI", function(){self.loadObjectById(mapObjId);});
        if (this.mapObj.hasOwnProperty("userId")){
            this.createTabs(this.mapObj);
        }
    }

};


UiObjectContext.prototype.createHeader = function(mapObj) {

   var headerContent = $('<div></div>');
    var points = this.mapObj.getPoints();
    var level = this.mapObj.getLevel(points);
    var title = $('<div style="white-space:nowrap;">' + this.mapObj.objTypeId + ' Level: ' + level+ '</div>').css({'text-align': 'center'});
    title.appendTo(headerContent);
    $('<br>').appendTo(headerContent);

    if (this.mapObj.hasOwnProperty("healthPoints")){
        var maxHp = this.mapObj.getMaxHealthPoints();
        var Hp = this.mapObj.getHealthPoints();
        var percentHP  = (Hp/maxHp) *100;

        this.healthPoints = $('<div  style="white-space:nowrap; id="healthPoints"></div>').appendTo(headerContent);
        this.healthPoints.progressbar({
            value: percentHP
        })
        this.healthPoints.css({'width':'50%','height':'10px','background': 'green'});
    }

    var HealthDisplay = $('<div style="white-space:nowrap;">' + 'Health Points: ' +Hp+ '/'+maxHp+ '</div>').css({'text-align': 'left'})
    HealthDisplay.appendTo(headerContent);
    var pointDisplay = $('<div style="white-space:nowrap;">' + 'Points: ' + points+ '</div>').css({'text-align': 'left'})
    pointDisplay.appendTo(headerContent);

    var objectType =  game.objectTypes.get(this.mapObj.objTypeId);
    var spritesheet = game.spritesheets.get(objectType._spritesheetId);
    var spriteFrameIcon = spritesheet.frames[objectType._spriteFrame];
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




    this.progressbar = $('<div id="progressbar"></div>').appendTo(headerContent);
    this.progressbar.progressbar({
        value: 0
    });
    //this.progressbar.css({'top':'175px','left':'0px','width':'100%','height':'20px','position':'absolute'});
    this.progressbar.css({'bottom':'-50px','left':'0px','width':'100%','height':'20px','position':'relative'});
    this.header.html(headerContent);
};

UiObjectContext.prototype.createTabs = function(mapObj) {

    var tabsHeaders = $('<ul></ul>').css({'width':100+'%'});
    $('<li><a href="#mainTab">Main</a></li>').css({'width':10+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#upgradeTab">Upgrades</a></li>').css({'width':13+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#storageTab">Storage</a></li>').css({'width':12+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#delandtransTab">Delivery&Transport</a></li>').css({'width':24+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#specialsTab">Specials</a></li>').css({'width':12+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#defenseTab">Defense</a></li>').css({'width':12+'%'}).appendTo(tabsHeaders);
    $('<li><a href="#offenseTab">Offense</a></li>').css({'width':12+'%'}).appendTo(tabsHeaders);

   // $('<span></span>').css({'width': 100+'%','display': 'inline-block','font-size': 0, 'line-height': 0}).appendTo(tabsHeaders);


    this.tabs.html(tabsHeaders);

   // tabsHeaders.width()

    var className = game.objectTypes.get(this.mapObj.objTypeId)._className;
       if (className=="Factory") var maintab = new FactoryTab(this.mapObj);
       else if (className=="Hub") var maintab = new HubTab(this.mapObj);
       else if (className=="UnitFactory")  var maintab = new UnitFactoryTab(this.mapObj);
       else if (className=="ScienceCenter")  var maintab = new ScienceCenterTab(this.mapObj);
       else if (className=="Sublayer")  var maintab = new SublayerTab(this.mapObj);

    var upgradetab = new UpgradeTab(this.mapObj);
    var storagetab = new StorageTab(this.mapObj);
    var delandtranstab = new DeliveryAndTransportationTab(this.mapObj);
    var specialtab = new SpecialTab(this.mapObj);
    var defensetab = new DefenseTab(this.mapObj);
    var offensetab = new OffenseTab(this.mapObj);


    maintab.content.appendTo(this.tabs);
    upgradetab.content.appendTo(this.tabs);
    storagetab.content.appendTo(this.tabs);
    delandtranstab.content.appendTo(this.tabs);
    specialtab.content.appendTo(this.tabs);
    defensetab.content.appendTo(this.tabs);
    offensetab.content.appendTo(this.tabs);





    this.tabs.tabs( "refresh" );
    this.tabs.tabs({ active: 0 });
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

