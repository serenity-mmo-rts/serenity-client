var ResourceViewModel = function(resStorage){

    var self = this;

    var resTypeId = resStorage.id();
    var resType = game.ressourceTypes.hashList[resTypeId];

    this.resStorage = resStorage;
    this.name = resTypeId;
    this.iconSpritesheetId = resType.iconSpritesheetId;
    this.iconSpriteFrame = resType.iconSpriteFrame;
    this.amount = ko.observable(0);
    this.cap = resStorage.capacity;

    this.timeIntervalMillisecond = ko.computed(function() {
        var resChangePerHour = self.resStorage.changePerHour();
        return 3600000 / Math.abs(resChangePerHour);
    });
    resStorage.lastUpdated.subscribe(function(){
        self.refresh();
    }, this);

    this.lastRefreshTime = 0;
    this.refresh();

};

ResourceViewModel.prototype.refresh = function() {
    var currentTime = Date.now();
    var resStoredAmount = this.resStorage.getCurrentAmount(currentTime);
    this.amount(resStoredAmount);
};





var ResourcesTab = function (mapObj) {

    var self = this;

    this.mapObj = mapObj;
    var resObservables = [];

    if (this.mapObj.blocks.hasOwnProperty("ResourceStorageManager")) {
        this.resStorageBlock = this.mapObj.blocks.ResourceStorageManager;

        // type vars:
        var resTypeIds = this.resStorageBlock.ressourceTypeIds;
        var resCap = this.resStorageBlock.ressourceCapacity;
        var resList = this.resStorageBlock.resList;

        resList.each(function(resStorage) {
            var resViewModel = new ResourceViewModel(resStorage);
            resObservables.push(resViewModel);
        });

    }


    this.resTypes = ko.observableArray(resObservables);

};

ResourcesTab.prototype.tick = function() {
    ko.utils.arrayForEach(this.resTypes(), function(resType) {
        resType.refresh();
    });
};