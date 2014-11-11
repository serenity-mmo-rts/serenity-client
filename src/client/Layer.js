
/** Upper Most Layer object. Initiates and handles all Div elements*/
var Layer = function(mapID){

      var self = this;



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


