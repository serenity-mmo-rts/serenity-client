

var ItemContextMenu =  function () {

 var self = this;
  this.menu=$(function(){
            $.contextMenu({
                selector: '.context-menu-one',
                trigger: 'left',
                delay: 10,
                zIndex: 1,
                autoHide: false,
                callback: function(key, options) {
                    switch(key) {
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
                },
                items: {
                    "activate": {
                        name: "activate",
                        icon: "edit",
                        disabled: function() {
                            //self.setItem(item);
                            if (!self
                                    .item._blocks.Feature._processedStack().canBeActivated()) {
                                return true;
                            }
                            else {
                                return false;
                            }

                        }
                    },
                    "upgrade": {
                        name: "upgrade",
                        icon: "cut",
                        disabled: function() {
                            var currLvl = self.item.getLevel();
                            var maxLvl = self.item._itemType._blocks.Feature.length;
                            //self.setItem(item);
                            if (currLvl >= maxLvl) {
                                return true;
                            }
                            else {
                                return false;
                            }

                        }
                    },

                    "sep1": "---------",

                    "fold1": {
                        "name": "move to...",
                        "items": {
                            "moveToAtack": {"name": "attack squad"},
                            "moveToDefense": {"name": "defense squad"},
                            "moveToTarget": {"name": "select target"}
                        }
                    },
                    "fold1a": {
                        "name": "in the end...",
                        "items": {
                            "fold1a-key1": {"name": "everything"},
                            "fold1a-key2": {"name": "works"},
                            "fold1a-key3": {"name": "fine"}
                        }
                    }
                }
            });
    });
    $(".context-menu-one").contextMenu();
};




ItemContextMenu.prototype.setItem = function (item) {
   this.item= item;
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
    evt.setParameters(this.item);
    uc.addEvent(evt);
};

ItemContextMenu.prototype.activatePerClick = function () {

    var evt = new ActivateFeatureEvent(game);
    var operation = this.item._blocks.Feature.getCurrentOp();
    evt.setParameters(this.item,operation);
    var targetType = this.item._blocks.Feature._processedStack().targetType();
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




