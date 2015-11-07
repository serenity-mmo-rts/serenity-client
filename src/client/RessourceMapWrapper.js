var RessourceMapWrapper = function(mapRenderer,res_container,mapId,resColorFcn) {
    var self = this;

    this.mapRenderer = mapRenderer;
    this.res_container = res_container;
    this.mapId = mapId;
    this.resColorFcn = resColorFcn;

    this.res_containerForeground = null;
    this.res_containerBackgroundLoading = new createjs.Container();
    this.res_container.addChild(this.res_containerBackgroundLoading);

    this.mapData = game.layers.get(this.mapId);
    this.mapType = game.mapTypes.get(this.mapData.mapTypeId);

    this.resMap = new MapGenerator('3',this.mapData.width,this.mapData.height);
    this.resTypeId = null;
    this.ressourceMap = null;
    this.ressourceMapBackgroundLoading = null;

    if (arguments.length < 4) {
        this.resColorFcn = function(res) {
            //return self.GetJetColour(res, 0, 1);
            return self.GetHotColour(res, 0, 1);
        };
    }

};

RessourceMapWrapper.prototype.removeRessourceOverlay = function() {
    this.resTypeId = null;

    if (this.ressourceMap != null) {
        this.ressourceMap.updatingDisabled = true;
        this.ressourceMap = null;
        this.res_container.removeChild(this.res_containerForeground);
        this.res_containerForeground = null;
    }

    this.cancelRessourceOverlayLoading();

}

RessourceMapWrapper.prototype.addRessourceOverlay = function(resTypeId) {
    this.removeRessourceOverlay();
    this.resTypeId = resTypeId;
    this.loadRessourceOverlay();
}

RessourceMapWrapper.prototype.cancelRessourceOverlayLoading = function() {
    if (this.ressourceMapBackgroundLoading != null) {
        this.ressourceMapBackgroundLoading.updatingDisabled = true;
        this.ressourceMapBackgroundLoading = null;
        this.res_containerBackgroundLoading = null;
    }
    if (this.ressourceMap != null) {
        this.ressourceMap.updatingDisabled = true;
    }
}

RessourceMapWrapper.prototype.loadRessourceOverlay = function() {
    var self = this;

    this.cancelRessourceOverlayLoading();

    if (this.resTypeId != null) {
        console.log("start to generate new ressource map overlay in background...")

        this.res_containerBackgroundLoading = new createjs.Container();
        this.ressourceMapBackgroundLoading = new RessourceMap(this.mapRenderer, this.resMap, this.mapId, this.res_containerBackgroundLoading, this.resColorFcn );
        this.ressourceMapBackgroundLoading.initQuadtree(this.resTypeId);
        this.ressourceMapBackgroundLoading.enableProgressBar();
        this.ressourceMapBackgroundLoading.checkRendering();
        this.ressourceMapBackgroundLoading.addFinishedScreenLoadingCallback(function(resMap) {
            if (resMap.updatingDisabled) {
                console.log("canceled loading new map")
            }
            else {
                console.log("finished background-loading of ressource overlay in screen area. now add it to res_container.");
                resMap.finishedLoadingCallback = null;
                resMap.finishedScreenLoadingCallback = null;
                if (self.res_containerForeground != null) {
                    self.res_container.removeChild(self.res_containerForeground);
                }
                self.res_containerForeground = self.res_containerBackgroundLoading;
                self.res_containerForeground.name = 'ressources';
                self.res_containerBackgroundLoading = null;
                self.ressourceMap = self.ressourceMapBackgroundLoading;
                self.ressourceMapBackgroundLoading = null;
                self.res_container.addChild(self.res_containerForeground);
                self.res_containerForeground.mouseMoveOutside = true;
                resMap.disableProgressBar();
            }
        });
    }
}

RessourceMapWrapper.prototype.resize = function () {
    this.loadRessourceOverlay();
};

RessourceMapWrapper.prototype.checkRendering = function () {
    if (this.ressourceMap != null) {
        this.ressourceMap.checkRendering();
    }
};

RessourceMapWrapper.prototype.GetJetColour = function (v, vmin, vmax) {
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

RessourceMapWrapper.prototype.GetHotColour = function (v, vmin, vmax) {
    var resDataScaled = Math.round(255 * (v-vmin)/(vmax - vmin));
    return {r: resDataScaled, g: 0, b: 255 - resDataScaled};
}