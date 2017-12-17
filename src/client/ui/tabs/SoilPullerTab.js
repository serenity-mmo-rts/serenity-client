var SoilPullerTab = function (mapObj) {

    this.mapObj = mapObj;
    this.soilPullerBlock = this.mapObj._blocks.SoilPuller;

    // type vars:
    var resTypeIds = this.soilPullerBlock.ressourceTypeIds;

    // state vars:
    var soilEffectiveIn = this.soilPullerBlock.soilEffectiveIn();

    var resObservables = [];
    for (var i= 0, len=resTypeIds.length; i<len; i++){
        var resType = game.ressourceTypes.hashList[resTypeIds[i]];
        var effectiveIn = soilEffectiveIn[i];
        if (!effectiveIn){
            effectiveIn = 0;
        }
        var res = {
            id: ko.observable(resTypeIds[i]),
            _iconSpritesheetId: resType._iconSpritesheetId,
            _iconSpriteFrame: resType._iconSpriteFrame,
            productionRate: effectiveIn
        }
        resObservables.push(res);
    }
    this.resTypes = ko.observableArray(resObservables);




};


