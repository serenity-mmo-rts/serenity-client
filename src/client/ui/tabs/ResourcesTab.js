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