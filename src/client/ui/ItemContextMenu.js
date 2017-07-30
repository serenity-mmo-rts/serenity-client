

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

    this.updateDisabled = ko.pureComputed(function() {

        if (this.item()) {
            if (this.item()._level() < this.item()._itemType._blocks.Feature.length) {
                return false
            }
            else {
                return true;
            }
        }
        else{
            return true
        }
    }, this);

    this.moveDisabled= ko.pureComputed(function() {
        if (this.item()) {
            if (this.item()._blocks.hasOwnProperty("Movable")) {
                return false
            }
            else {
                return true;
            }
        }
        else{
            return true
        }
    }, this);

    this.iconSpritesheetId = ko.pureComputed(function() {
        if (this.item()) {
            var itemType = this.item()._itemType;
            return itemType._iconSpritesheetId;
        }
        else {
            return false;
        }
    }, this);

    this.iconSpriteFrame = ko.pureComputed(function() {
        if (this.item()) {
            var itemType = this.item()._itemType;
            return itemType._iconSpriteFrame;
        }
        else {
            return false;
        }
    }, this);


    this.level = ko.pureComputed(function() {
        if (this.item()) {
            return this.item()._level();
        }
        else {
            return false;
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
                    self.moveToAttackSquad();
                    break;
                case "moveToDefense":
                    self.moveToDefenseSquad();
                    break;
                case "moveToTarget":
                    self.moveToOtherMapObject();
                    break;
            }
        }
    });
};






ItemContextMenu.prototype.setItem = function (item) {
   this.item(item);
};

ItemContextMenu.prototype.moveToAttackSquad = function () {

        // TODO fire event

};

ItemContextMenu.prototype.moveToDefenseSquad = function () {

        // TODO fire event

};

ItemContextMenu.prototype.moveToOtherMapObject = function () {

    var evt = new MoveItemEvent(game);
    evt.setParameters(this.item());

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




