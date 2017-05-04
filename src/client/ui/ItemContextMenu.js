

var ItemContextMenu =  function () {


    $(function(){
        $.contextMenu({
            selector: '.context-menu-one',
            trigger: 'left',
            delay: 10,
            zIndex: 1,
            autoHide: false,
            callback: function(key, options) {
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m);
            },
            items: {
                "edit": {name: "activate", icon: "edit"},
                "cut": {name: "upgrade", icon: "cut"},
                "sep1": "---------",

                "fold1": {
                    "name": "move to...",
                    "items": {
                        "fold1-key1": {"name": "attack squad"},
                        "fold1-key2": {"name": "defense squad"},
                        "fold1-key3": {"name": "select target"}
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
    $(".context-menu-one").hide();
};

ItemContextMenu.prototype.make = function () {

};

ItemContextMenu.prototype.setPosition = function (iconContainer) {

    var contextMenu = $( ".context-menu-one" );
    contextMenu.position({
        my: "left top",
        at: "right top",
        of: iconContainer, //$( "#availableBox"),
        collision: "fit"
    });
};

ItemContextMenu.prototype.setItem = function (item) {
   this.item= item;
};

ItemContextMenu.prototype.moveToAttackSquad = function (container) {
    var self = this;
    container.click(function (e) {
        // TODO fire event
    });
};

ItemContextMenu.prototype.moveToDefenseSquad = function (container) {
    var self = this;
    container.click(function (e) {
        // TODO fire event
    });
};

ItemContextMenu.prototype.moveToOtherMapObject = function (container) {
    var self = this;
    container.click(function (e) {
        // TODO fire event
    });
};

ItemContextMenu.prototype.levelUpgrade = function (container) {
    var self = this;
    container.click(function (e) {
        var evt = new LevelUpgradeEvent(game);
        evt.setParameters(self.item);
        uc.addEvent(evt);
        //self.mapObj._blocks.UpgradeProduction.levelUpgrade(item);
    });
};

ItemContextMenu.prototype.activatePerClick = function (container) {
    container.click(function (e) {
        var evt = new ActivateFeatureEvent(game);
        var operation = self.item._blocks.Feature._processedStack().currentOperation();
        evt.setParameters(self.item,operation);
        var targetType = self.item._blocks.Feature._processedStack().targetType();
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




