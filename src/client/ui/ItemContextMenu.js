

var ItemContextMenu =  function () {

 var self = this;
    this.item = ko.observable(false);
    this.activatedDisabled = ko.pureComputed(function() {
        if (this.item()) {
            return !this.item()._blocks.Feature._processedStack().canBeActivated();
        }
        else {
            return true;
        }
    }, this);

    this._iconSpritesheetId = ko.pureComputed(function() {
        if (this.item()) {
            var itemType = this.item()._itemType;
            return itemType._iconSpritesheetId;
        }
        else {
            return "";
        }
    }, this);

    this._iconSpriteFrame = ko.pureComputed(function() {
        if (this.item()) {
            var itemType = this.item()._itemType;
            return itemType._iconSpriteFrame;
        }
        else {
            return "";
        }
    }, this);

};



ItemContextMenu.prototype.init = function () {
    var self = this;

    this.menu = $(document).contextmenu({
        delegate: ".context-menu-one",
        menu: "#options",
        autoTrigger: false,
        show: false,
        select: function (event, ui) {
            switch (ui.cmd) {
                case "activate":
                    self.activatePerClick();
                    break;
                case "upgrade":
                    self.levelUpgrade();
                    break;
                case "moveToAttack":
                    break;
                case "moveToDefense":
                    break;
                case "moveToTarget":
                    break;
            }
        }
    });
};






ItemContextMenu.prototype.setItem = function (item) {
   this.item(item);
    var itemType = item._itemType;
};

ItemContextMenu.prototype.moveToAttackSquad = function () {

        // TODO fire event

};

ItemContextMenu.prototype.moveToDefenseSquad = function () {

        // TODO fire event

};

ItemContextMenu.prototype.moveToOtherMapObject = function () {

        // TODO fire event

};

ItemContextMenu.prototype.levelUpgrade = function () {
    var evt = new LevelUpgradeEvent(game);
    evt.setParameters(this.item());
    uc.addEvent(evt);
};

ItemContextMenu.prototype.activatePerClick = function () {

    var evt = new ActivateFeatureEvent(game);
    var operation = this.item()._blocks.Feature.getCurrentOp();
    evt.setParameters(this.item(),operation);
    var targetType = this.item()._blocks.Feature._processedStack().targetType();
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
};




