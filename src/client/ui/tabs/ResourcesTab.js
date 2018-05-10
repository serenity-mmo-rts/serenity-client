var ResourcesTab = function (mapObj) {

    this.mapObj = mapObj;
    var resObservables = [];

    if (this.mapObj.blocks.hasOwnProperty("ResourceStorageManager")) {
        this.resStorageBlock = this.mapObj.blocks.ResourceStorageManager;

        // type vars:
        var resTypeIds = this.resStorageBlock.ressourceTypeIds;
        var resCap = this.resStorageBlock.ressourceCapacity;




        for (var i = 0, len = resTypeIds.length; i < len; i++) {

            var res = this.resStorageBlock.resList.get(resTypeIds[i]);

            // state vars:
            var resStored = res.storedAmount();
            var resLastUpdate = res.lastUpdated();
            var resChangePerSec = res.changePerSec();

            var resType = game.ressourceTypes.hashList[resTypeIds[i]];
            var storedAmount = resStored;
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


