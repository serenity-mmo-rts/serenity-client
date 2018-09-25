var ResourceViewModel = function(resStorage){

    var self = this;

    var resTypeId = resStorage._id();
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


