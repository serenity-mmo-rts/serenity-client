
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(mapID){

    var self = this;

    this.mapId = mapID;

    this.mapContainer =  new MapContainer(this.mapId);

    this.buildMenu = new BuildMenu(this.mapId,this.mapContainer.mapControl);

    this.testPanel = new UiSlidingPanel(0,3,"<p>TestTestTestTestTestTestTest TestTest Test asdfsdf asddf asdaf sd</p>");
    this.testPanel.hide(0);
    this.testPanel2 = new UiSlidingPanel(0,2,"gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk");
    this.testPanel2.hide(0);

    this.testPanel.addNextPanel(this.testPanel2);

    this.minimap = new Minimap(this.mapContainer.mapControl);
    this.minimapPanel = new UiSlidingPanelRight(0,3,this.minimap.canvas);
    this.minimap.init();
    this.minimapPanel.hide(0);

    this.uiRessourceMap = new UiRessourceMap(this.mapContainer.map,this.mapContainer.map.resMap.resTypes);
    this.uiRessourceMapPanel = new UiSlidingPanelRight(150,2,this.uiRessourceMap.content);
    this.uiRessourceMapPanel.show(0);

    this.minimapPanel.addNextPanel(this.uiRessourceMapPanel);


    window.addEventListener('resize',function(){self.resize()}, false);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function () {self.tick()});

}

Layer.prototype.resize = function () {
    this.mapContainer.resize();
    this.minimap.resize();
    this.minimapPanel.update(0);
};

Layer.prototype.tick = function() {
    this.mapContainer.tick();
    this.minimap.tick();
};
