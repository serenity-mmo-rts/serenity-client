
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(){
    var self = this;

    this.mapContainer = null;





    window.addEventListener('resize',function(){self.resize()}, false);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function () {self.tick()});

}

Layer.prototype.loadMap = function (mapId) {
    var self = this;

    this.mapId = mapId;

    this.mapContainer =  new MapContainer(this.mapId);

    this.testPanel = new UiSlidingPanel(0,3,"<p>TestTestTestTestTestTestTest TestTest Test asdfsdf asddf asdaf sd</p>");
    this.testPanel.hide(0);
    this.testPanel2 = new UiSlidingPanel(0,2,"gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk");
    this.testPanel2.hide(0);

    this.buildMenu = new BuildMenu(this.mapId,this.mapContainer.mapControl);

    this.testPanel.addNextPanel(this.testPanel2);

    this.minimap = new Minimap(this.mapContainer.mapControl);
    this.minimapPanel = new UiSlidingPanelRight(0,3,this.minimap.canvas);
    this.minimap.init();
    this.minimapPanel.hide(0);

    this.uiRessourceMap = new UiRessourceMap(this.mapContainer.map.ressourceMapWrapper);
    this.uiRessourceMapPanel = new UiSlidingPanelRight(150,2,this.uiRessourceMap.content );
    this.uiRessourceMapPanel.show(0);

    this.uiBgMap = new UiBgMap(this.mapContainer.map.bgMapWrapper);
    this.uiBgMapPanel = new UiSlidingPanelRight(150,2,this.uiBgMap.content );
    this.uiBgMapPanel.show(0);

    this.uiObjectContext = new UiObjectContext();
    this.uiObjectContextPanel = new UiSlidingPanelRight(150,2,this.uiObjectContext.content );
    this.uiObjectContextPanel.show(0);

    this.minimapPanel.addNextPanel(this.uiRessourceMapPanel);
    this.uiRessourceMapPanel.addNextPanel(this.uiBgMapPanel);
    this.uiBgMapPanel.addNextPanel(this.uiObjectContextPanel);

};

Layer.prototype.resize = function () {
    if(this.mapContainer) this.mapContainer.resize();
    if(this.minimap) this.minimap.resize();
    if(this.minimapPanel) this.minimapPanel.update(0);
};

Layer.prototype.tick = function() {
    if(this.mapContainer) this.mapContainer.tick();
    if(this.minimap) this.minimap.tick();

    var currGameTime = Date.now() - ntp.offset();
    if (this.mapId) game.maps.get(this.mapId).eventScheduler.finishAllTillTime(currGameTime);
};
