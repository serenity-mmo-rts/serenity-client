var ResAndBgWrapper = function(mapRenderer,container,mapId,type) {
    var self = this;

    this.mapRenderer = mapRenderer;
    this.container = container;
    this.mapId = mapId;
    this.type = type;

    this.mapData = game.layers.get(this.mapId);
    this.mapType = game.layerTypes.get(this.mapData.mapTypeId);

    this.resTypeId = null;
    this.ressourceMap = null;

    this.foregroundContainer = null;
    this.mapBackgroundLoading = null;
    this.backgroundContainer = new createjs.Container();
    this.container.addChild(this.backgroundContainer);



    this.loadOverlay();
};

ResAndBgWrapper.prototype.removeOverlay = function() {
    this.resTypeId = null;

    if (this.ressourceMap != null) {
        this.ressourceMap.updatingDisabled = true;
        this.ressourceMap = null;
        this.container.removeChild(this.foregroundContainer);
        this.foregroundContainer = null;
    }

    if (this.mapBackgroundLoading != null) {
        this.mapBackgroundLoading.updatingDisabled = true;
        this.mapBackgroundLoading = null;
        this.backgroundContainer = null;
    }

};




ResAndBgWrapper.prototype.addOverlay = function(resTypeId) {

    this.removeOverlay();
    this.resTypeId = resTypeId;
    this.loadOverlay();
}


ResAndBgWrapper.prototype.loadOverlay = function() {
    var self = this;




    if (this.resTypeId != null) {
        console.log("start to generate new resource map overlay in background...")

        this.backgroundContainer = new createjs.Container();
        this.mapBackgroundLoading = new ResourceMap(this.mapRenderer, this.mapData.mapProperties, this.mapId, this.backgroundContainer, this.type);
        this.mapBackgroundLoading.initQuadtree(this.resTypeId);
        this.mapBackgroundLoading.enableProgressBar();
        this.mapBackgroundLoading.checkRendering();

        this.mapBackgroundLoading.addFinishedScreenLoadingCallback(function(resMap) {

            if (resMap.updatingDisabled) {
                console.log("canceled loading new map")
            }
            else {
                console.log("finished background-loading of ressource overlay in screen area. now add it to res_container.");
                resMap.finishedLoadingCallback = null;
                resMap.finishedScreenLoadingCallback = null;

            }
        });

        // the following was moved outside of the callback
        if (self.foregroundContainer != null) {
            self.container.removeChild(self.foregroundContainer);
        }
        self.foregroundContainer = self.backgroundContainer;
        self.foregroundContainer.name = 'ressources';
        self.backgroundContainer = null;
        self.ressourceMap = self.mapBackgroundLoading;
        self.mapBackgroundLoading = null;
        self.container.addChild(self.foregroundContainer);
        self.foregroundContainer.mouseMoveOutside = true;
        //this.mapBackgroundLoading.disableProgressBar();
    }

    else{

    }

}

ResAndBgWrapper.prototype.resize = function () {
    this.checkRendering();
};

ResAndBgWrapper.prototype.checkRendering = function () {
    if (this.ressourceMap != null) {
        this.ressourceMap.checkRendering();
    }
};

/**
ResAndBgWrapper.prototype.GetJetColour = function (v, vmin, vmax) {
    var c = {r: 1, g: 1, b: 1};

    if (v < vmin)
        v = vmin;
    if (v > vmax)
        v = vmax;
    var dv = vmax - vmin;

    if (v < (vmin + 0.25 * dv)) {
        c.r = 0;
        c.g = 4 * (v - vmin) / dv;
    } else if (v < (vmin + 0.5 * dv)) {
        c.r = 0;
        c.b = 1 + 4 * (vmin + 0.25 * dv - v) / dv;
    } else if (v < (vmin + 0.75 * dv)) {
        c.r = 4 * (v - vmin - 0.5 * dv) / dv;
        c.b = 0;
    } else {
        c.g = 1 + 4 * (vmin + 0.75 * dv - v) / dv;
        c.b = 0;
    }

    return c;
}
 **/
