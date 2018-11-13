
/** Upper Most Layer object. Initiates and handles all Div elements*/
var LayerView = function(client){
    var self = this;

    this.client = client;
    this.mapContainer = null;
    this.mapContainerTempLoading = null;

    this.lastTick = 0;
    this.tickCounter = 0;
    this.userData = null;
    this.mapLoaded = false;

    this.loadedMapId = ko.observable(0);

    window.addEventListener('resize',function(){self.resize()}, false);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", function () {self.tick()});

    this.uiContainer = new UIContainer();



    /**
     * GUI Menu
     * @type {UiGlobalMenu}
     */
    this.uiGlobalMenu = new UiGlobalMenu( this );
    this.uiContainer.addContentPanel(this.uiGlobalMenu.content, {visible: true, barPos: 'topleft', posInBar: 0});

    this.uiPlaceItemMenu = new UiPlaceItemMenu( this );
    this.uiContainer.addContentPanel(createKnockoutPanel(this.uiPlaceItemMenu, 'uiPlaceItemMenu', 'ui/UiPlaceItemMenu.html'), {visible: true, barPos: 'topleft', posInBar: 1});

    this.testComponent = new testComponent();
    this.uiContainer.addContentPanel(createKnockoutPanel(this.testComponent, 'testComponent', 'ui/testComponent.html'), {visible: true, barPos: 'topleft', posInBar: 2});

    this.buildMenu = new BuildMenu( this );
    var buildMenuPanel = createKnockoutPanel(this.buildMenu, 'buildMenu', 'ui/buildMenu.html');
    $("#buildMenuPlaceholder").append(buildMenuPanel);

    this.itemContextMenu = new ItemContextMenu();
    var itemContextMenuPanel = createKnockoutPanel(this.itemContextMenu, 'itemContextMenu', 'ui/ItemContextMenu.html');
    $("#itemContextMenuPlaceholder").append(itemContextMenuPanel);
    this.itemContextMenu.init();



    this.uiObjectContext = new UiObjectContext();
    this.uiObjectContextPanel = new UiSlidingPanelRightBottom(0,2,this.uiObjectContext.content );
    this.uiObjectContextPanel.hide(0);


    this.minimap = new Minimap();
    this.minimapPanel = new UiSlidingPanelRight(0,3,this.minimap.canvas);
    this.minimap.init();

    this.uiRessourceMap = new UiRessourceMap();
    this.uiRessourceMapPanel = new UiSlidingPanelRight(150,2,this.uiRessourceMap.content );
    this.uiRessourceMapPanel.show(0);

    this.uiBgMap = new UiBgMap();
    this.uiBgMapPanel = new UiSlidingPanelRight(150,2,this.uiBgMap.content );
    this.uiBgMapPanel.show(0);

    this.minimapPanel.addNextPanel(this.uiRessourceMapPanel);
    this.uiRessourceMapPanel.addNextPanel(this.uiBgMapPanel);

};


LayerView.prototype.loadMap = function (mapId) {
    var self = this;
    this.mapContainerTempLoading = new MapContainer(mapId);
    this.mapContainerTempLoading.map.callbackFinishedLoading = function (){
        self.finishedLoadingMap();
    };
};

LayerView.prototype.finishedLoadingMap = function () {

    // destruct old layer if it exists:
    if (this.mapContainer) {
        var oldMapContainer = this.mapContainer;
        oldMapContainer.removeFromCanvas();
        game.layers.deleteById(oldMapContainer.mapId);
    }

    this.mapContainer = this.mapContainerTempLoading;
    this.mapContainerTempLoading = null;
    this.mapLoaded = true;

    var mapId = this.mapContainer.mapId;
    this.mapId = mapId;
    this.loadedMapId(this.mapId);

    this.buildMenu.mapControl = this.mapContainer.mapControl;


    this.minimap.setMapControl(this.mapContainer.mapControl);
    this.uiRessourceMap.setResMap(this.mapContainer.map.resourceMap);
    this.uiBgMap.setResMap(this.mapContainer.map.bgMap);
};

LayerView.prototype.setUserData = function (userData) {
    this.userData = userData;
    this.uiGlobalMenu.setUserData(userData);
    // updateUserInfo();
};

LayerView.prototype.resize = function () {
    if(this.mapContainer) this.mapContainer.resize();
    if(this.minimap) this.minimap.resize();
    if(this.minimapPanel) this.minimapPanel.update(0);
};

LayerView.prototype.tick = function() {
    if(this.mapContainer) this.mapContainer.tick();
    if(this.minimap) this.minimap.tick();
    if(this.uiObjectContext) this.uiObjectContext.tick();

    this.tickCounter += 1;
    if (this.tickCounter == 13) {
        this.tickCounter = 0;

        if (this.uiGlobalMenu != undefined) {

            // set FPS display:
            var dateDiff = Date.now() - this.lastTick;
           // this.uiGlobalMenu.setFPS(Math.round(1000 / dateDiff));
             this.testComponent.setFPS(Math.round(1000 / dateDiff));

            // set mouse coordinate display:
            if(this.mapContainer) {
                mouseCoord = this.mapContainer.getMouseInGameCoord();
               // this.uiGlobalMenu.setMouseCoord(mouseCoord);
                this.testComponent.setMouseCoord(mouseCoord);
            }

        }

    }
    this.lastTick = Date.now();

    var currGameTime = Date.now() - ntp.offset();
    if (this.mapId){
        game.layers.get(this.mapId).timeScheduler.finishAllTillTime(currGameTime);
    }
};
