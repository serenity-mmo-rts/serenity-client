var ResourcesTab = function (mapObj) {

    this.mapObj = mapObj;
    var resObservables = [];

    if (this.mapObj.blocks.hasOwnProperty("ResourceStorageManager")) {
        this.resStorageBlock = this.mapObj.blocks.ResourceStorageManager;

        // type vars:
        var resTypeIds = this.resStorageBlock.ressourceTypeIds;
        var resCap = this.resStorageBlock.ressourceCapacity;

        // state vars:
        var resStored = this.resStorageBlock.storedAmount();
        var resLastUpdate = this.resStorageBlock.storedLastUpdated();
        var resChangePerSec = this.resStorageBlock.storedChangePerSec();


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


