
var ScienceCenterTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="upgradeTab"></div>').css({'display': 'inline-block'});
    if (this.mapObj._blocks.hasOwnProperty("Technologies")){
        this.listProduceableTechnologies();
    }

};


ScienceCenterTab.prototype.listProduceableTechnologies = function () {

    var wrap1 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px'});
    this.creationTitle =  $('<div>Technologies</div>').css({});
    this.creationBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allowedTechnologies = this.mapObj._blocks.Technologies.producableTechnologies;

    for (var i = 0; i<allowedTechnologies.length; i++){
        var techId = allowedTechnologies[i];
        var techType =  game.technologyTypes.get(techId);
        var spritesheet = game.spritesheets.get(techType._iconSpritesheetId);
        var spriteFrameIcon = spritesheet.frames[techType._iconSpriteFrame];
        var x = spriteFrameIcon[0];
        var y = spriteFrameIcon[1];
        var breite = spriteFrameIcon[2];
        var hoehe = spriteFrameIcon[3];
        var img = spritesheet.images[spriteFrameIcon[4]];
        var gap = 8;

        var container= $('<div style="white-space:nowrap" ></div>').css({'width':breite, 'height':hoehe, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
        var image = $('<div style="white-space:nowrap" ></div>');
        image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
        image.appendTo(container);

        this.buildUpgrade(container,techId);
        container.css('cursor', 'pointer');
        container.appendTo(this.creationBox);

    }
    this.creationTitle.appendTo(wrap1);
    this.creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

};


ScienceCenterTab.prototype.buildUpgrade = function (container,techTypeId) {
    var self = this;
    container.click(function (e) {
        var evt = new ResearchEvent(game);
        evt.setParameters(techTypeId,self.mapObj);
        uc.addEvent(evt);
    });
};

ScienceCenterTab.prototype.levelUpgrade = function (container,item) {
    var self = this;
    container.click(function (e) {
        var evt = new LevelUpgradeEvent(game);
        evt.setParameters(item);
        uc.addEvent(evt);
        //self.mapObj._blocks.UpgradeProduction.levelUpgrade(item);
    });
};


ScienceCenterTab.prototype.activatePerClick = function (container,item) {
    container.click(function (e) {
        var evt = new ActivateFeatureEvent(game);
        var operation = item._blocks.Feature._processedStack().currentOperation();
        evt.setParameters(item,operation);
        var targetType = item._blocks.Feature._processedStack().targetType();
        if (targetType=="self"){
            uc.addEvent(evt);
        }
        else if (targetType=="object"){

            function callbackOnSelect(){
                uc.addEvent(evt);
            }
            function callbackCheckValidSelection(objId){
                evt.setTarget(objId);
                var valid = evt.isValid();
                return valid;
            }
            function callbackCanceled(){
                evt = null;
            }
            uc.layerView.mapContainer.mapControl.setStateSelectObj(callbackOnSelect,callbackCheckValidSelection,callbackCanceled);
        }

    });
};
