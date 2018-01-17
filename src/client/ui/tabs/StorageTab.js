var StorageTab = function (mapObj) {

    this.mapObj = mapObj;
    this.resStorageBlock = this.mapObj.blocks.ResourceStorage;

    // type vars:
    var resTypeIds = this.resStorageBlock.ressourceTypeIds;
    var resCap = this.resStorageBlock.ressourceCapacity;

    // state vars:
    var resStored = this.resStorageBlock.ressourceStored();
    var resLastUpdate = this.resStorageBlock.ressourceLastUpdated();
    var resChangePerSec = this.resStorageBlock.ressourceChangePerSec();

    var resObservables = [];
    for (var i= 0, len=resTypeIds.length; i<len; i++){
        var resType = game.ressourceTypes.hashList[resTypeIds[i]];
        var storedAmount = resStored[i];
        if (!storedAmount){
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
    this.resTypes = ko.observableArray(resObservables);




};


