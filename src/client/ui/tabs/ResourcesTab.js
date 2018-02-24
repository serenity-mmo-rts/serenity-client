var ResourcesTab = function (mapObj) {

    this.mapObj = mapObj;
    var resObservables = [];

    if (this.mapObj.blocks.hasOwnProperty("ResourceStorage")) {
        this.resStorageBlock = this.mapObj.blocks.ResourceStorage;

        // type vars:
        var resTypeIds = this.resStorageBlock.ressourceTypeIds;
        var resCap = this.resStorageBlock.ressourceCapacity;

        // state vars:
        var resStored = this.resStorageBlock.ressourceStoredAmount();
        var resLastUpdate = this.resStorageBlock.ressourceLastUpdated();
        var resChangePerSec = this.resStorageBlock.ressourceChangePerSec();


        for (var i = 0, len = resTypeIds.length; i < len; i++) {
            var resType = game.ressourceTypes.hashList[resTypeIds[i]];
            var storedAmount = resStored[i];
            if (!storedAmount) {
                storedAmount = 0;
            }
            var res = {
                id: ko.observable(resTypeIds[i]),
                iconSpritesheetId: resType.iconSpritesheetId,
                iconSpriteFrame: resType.iconSpriteFrame,
                amount: storedAmount,
                cap: resCap[i]
            };
            resObservables.push(res);
        }
    }


    this.resTypes = ko.observableArray(resObservables);




};


