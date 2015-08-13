
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(){
    var self = this;

    this.mapContainer = null;
    this.mapContainerTempLoading = null;

    window.addEventListener('resize',function(){self.resize()}, false);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function () {self.tick()});

}

Layer.prototype.loadMap = function (mapId) {
    var self = this;
    this.mapContainerTempLoading =  new MapContainer(mapId);
    this.mapContainerTempLoading.map.callbackFinishedLoading = function (){
        self.finishedLoadingMap();
    };

};

Layer.prototype.finishedLoadingMap = function () {

    if (this.mapContainer) {
        var oldMapContainer = this.mapContainer;
        oldMapContainer.removeFromCanvas();
    }

    this.mapContainer = this.mapContainerTempLoading;
    this.mapContainerTempLoading = null;

    this.mapId = this.mapContainer.mapId;

    if (this.uiGlobalMenuPanel) this.uiGlobalMenuPanel.remove();
    this.uiGlobalMenu = new UiGlobalMenu();
    this.uiGlobalMenuPanel = new UiSlidingPanel(0,3,this.uiGlobalMenu.content);
    this.uiGlobalMenuPanel.show(0);

    if (this.uiGlobalMenuPanel2) this.uiGlobalMenuPanel2.remove();
    this.uiGlobalMenuPanel2 = new UiSlidingPanel(0,2,"gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk");
    this.uiGlobalMenuPanel2.hide(0);

    this.uiGlobalMenuPanel.addNextPanel(this.uiGlobalMenuPanel2);

    this.buildMenu = new BuildMenu(this.mapId,this.mapContainer.mapControl);




    this.minimap = new Minimap(this.mapContainer.mapControl);
    if (this.minimapPanel) this.minimapPanel.remove();
    this.minimapPanel = new UiSlidingPanelRight(0,3,this.minimap.canvas);
    this.minimap.init();
    this.minimapPanel.hide(0);

    this.uiRessourceMap = new UiRessourceMap(this.mapContainer.map.ressourceMapWrapper);
    if (this.uiRessourceMapPanel) this.uiRessourceMapPanel.remove();
    this.uiRessourceMapPanel = new UiSlidingPanelRight(150,2,this.uiRessourceMap.content );
    this.uiRessourceMapPanel.show(0);

    this.uiBgMap = new UiBgMap(this.mapContainer.map.bgMapWrapper);
    if (this.uiBgMapPanel) this.uiBgMapPanel.remove();
    this.uiBgMapPanel = new UiSlidingPanelRight(150,2,this.uiBgMap.content );
    this.uiBgMapPanel.show(0);

    var mapObjectMenuX = canvas.width*0.5;
    var mapObjectMenuY = canvas.height-(mapObjectMenuX/4);

    this.uiObjectContext = new UiObjectContext();
    if (this.uiObjectContextPanel) this.uiObjectContextPanel.remove();
    this.uiObjectContextPanel = new UiSlidingPanelRightBottom(0,2,this.uiObjectContext.content );
    this.uiObjectContextPanel.hide(0);

    this.minimapPanel.addNextPanel(this.uiRessourceMapPanel);
    this.uiRessourceMapPanel.addNextPanel(this.uiBgMapPanel);
   // this.uiBgMapPanel.addNextPanel(this.uiObjectContextPanel);
}

Layer.prototype.resize = function () {
    if(this.mapContainer) this.mapContainer.resize();
    if(this.minimap) this.minimap.resize();
    if(this.minimapPanel) this.minimapPanel.update(0);
};

Layer.prototype.tick = function() {
    if(this.mapContainer) this.mapContainer.tick();
    if(this.minimap) this.minimap.tick();
    if(this.uiObjectContext) this.uiObjectContext.tick();

    var currGameTime = Date.now() - ntp.offset();
    if (this.mapId) game.maps.get(this.mapId).eventScheduler.finishAllTillTime(currGameTime);
};
