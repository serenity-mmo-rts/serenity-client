
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(mapID){

      var self = this;



    this.testPanel = new UiSlidingPanel(0,2,"<p>TestTestTestTestTestTestTest TestTest Test asdfsdf asddf asdaf sd</p>");
    this.testPanel2 = new UiSlidingPanel(50,1,"gsdfgk jafkldg klsdjafkj klgj fj klgj sdfkljglk sdfk");
    this.testPanel3 = new UiSlidingPanel(50,1,"gsdfgk jdfsgsdfgfk");
    this.testPanel4 = new UiSlidingPanel(50,1,"gadfgsfd fdg sdfg sdfgfdgs gsdk");

    this.testPanel.addNextPanel(this.testPanel2);
    this.testPanel2.addNextPanel(this.testPanel3);
    this.testPanel3.addNextPanel(this.testPanel4);

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


