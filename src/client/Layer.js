
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(mapID){

      var self = this;



    this.testPanel = new UiSlidingPanel(0,3,"<p>TestTestTestTestTestTestTest TestTest Test asdfsdf asddf asdaf sd</p>");
    this.testPanel.hide();
    this.testPanel2 = new UiSlidingPanel(0,2,"gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk");
    this.testPanel2.hide();
    this.testPanel3 = new UiSlidingPanel(0,1,"gsdfgk jdfsgsdfgfk");
    this.testPanel3.hide();
    this.testPanel4 = new UiSlidingPanel(0,0,"gadfgsfd fdg sdfg sdfgfdgs gsdk");
    this.testPanel4.hide();

    this.testPanel.addNextPanel(this.testPanel2);
    this.testPanel2.addNextPanel(this.testPanel3);
    this.testPanel3.addNextPanel(this.testPanel4);


    this.canvas = document.createElement('canvas');
    this.canvas.style.width = (window.innerWidth/4) + "px";
    this.canvas.id = "minimap";
    this.canvas.border = "none";
    this.minimapPanel = new UiSlidingPanelRight(0,3,this.canvas);
    this.minimapPanel.hide();


    this.testPanelRight = new UiSlidingPanelRight(150,2,"<p>TestTest<br>Test<br>Test<br>Test<br>Test<br>Test<br>Test<br>Test<br>Test<br>Test<br>TestTestTestTestTest TestTest Test asdfsdf asddf asdaf sd</p>");
    this.testPanelRight.hide();
    this.testPanel2Right = new UiSlidingPanelRight(0,1,"<p>gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk</p>");
    this.testPanel2Right.hide();
    this.minimapPanel.addNextPanel(this.testPanelRight);
    this.testPanelRight.addNextPanel(this.testPanel2Right);

    // EaselJS

        this.mapId = mapID;


        this.mapContainer =  new MapContainer(this.mapId);
        this.buildMenu = new BuildMenu(this.mapId,this.mapContainer.mapControl);

       //this.resize();


        // other J-query objects ....

    // resize
     window.addEventListener('resize',function(){self.resize()}, false);
}

// if browser is resized draw menu again
Layer.prototype.resize = function () {


    this.mapContainer.resize();
};


