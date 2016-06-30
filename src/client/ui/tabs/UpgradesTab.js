
var UpgradesTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="upgradeTab"></div>').css({'display': 'inline-block'});
    if (this.mapObj._blocks.hasOwnProperty("UpgradeProduction")){
        this.listAvailableUpgrades();
        this.listProducedUpgrades();
    }

};


UpgradesTab.prototype.listAvailableUpgrades = function () {
    var self = this;
    var wrap1 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px'});
    this.creationTitle =  $('<div>Available Upgrades</div>').css({});
    this.creationBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allowedItemIds = this.mapObj._blocks.UpgradeProduction.itemTypeIds;

    for (var i = 0; i<allowedItemIds.length; i++){
        var itemId = allowedItemIds[i];
        var itemType =  game.itemTypes.get(itemId);
        var spritesheet = game.spritesheets.get(itemType._iconSpritesheetId);
        var spriteFrameIcon = spritesheet.frames[itemType._iconSpriteFrame];
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

        this.buildUpgrade(container,itemId);
        container.css('cursor', 'pointer');
        container.appendTo(this.creationBox);

        // check which properties will be changed to on hover
        /**
         for (var i = 0; i<itemType._blocks.Feature[0]._stack.length; i++){
           if(Object.keys(itemType._blocks.Feature[0]._stack[i])[0]=="AddToProp"){
               var varnames = itemType._blocks.Feature[0]._stack[i].AddToProp.vars;
               var varvalues = itemType._blocks.Feature[0]._stack[i].AddToProp.values;
               var varoperator = itemType._blocks.Feature[0]._stack[i].AddToProp.operators;
           }
        }

        $(container).tooltip({
            content: "Awesome title!"
        });
         **/
    }
    this.creationTitle.appendTo(wrap1);
    this.creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

};

UpgradesTab.prototype.listProducedUpgrades = function () {
    var self = this;
    var wrap2 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px','top':'200','position': 'absolute'});
    this.availableTitle =  $('<div>Produced Upgrades</div>').css({});
    this.availableBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allItems= this.mapObj.getItems();

    for (var itemId in allItems) {
        if (allItems.hasOwnProperty(itemId)) {
            var item = allItems[itemId];
            var level = allItems[itemId].getLevel();
            if (item._itemType._blocks.hasOwnProperty("Feature")){
                var maxLevel = item._itemType._blocks.Feature.length;
            }
            var itemType = allItems[itemId]._itemType;
            var spritesheet = game.spritesheets.get(itemType._iconSpritesheetId);
            var spriteFrameIcon = spritesheet.frames[itemType._iconSpriteFrame];
            var x = spriteFrameIcon[0];
            var y = spriteFrameIcon[1];
            var breite = spriteFrameIcon[2];
            var hoehe = spriteFrameIcon[3];
            var img = spritesheet.images[spriteFrameIcon[4]];
            var gap = 10;

            var iconContainer = $('<div style="white-space:nowrap"></div>').css({
                'width': 32,
                'height': 32,
                'position': 'relative',
                'display': 'inline-block',
                'padding-right': gap + 'px'
            });
            var image = $('<div style="white-space:nowrap" ></div>');
            image.css({
                'background-image': 'url(' + img + ')',
                'background-position-x': -x,
                'background-position-y': -y,
                'background-repeat': 'no-repeat',
                'width': breite,
                'height': hoehe
            });
            image.appendTo(iconContainer);

            // check if item can be activated
            var spell = $('<div style="white-space:nowrap" ></div>');
            if(item._blocks.Feature._processedStack[item._blocks.Feature._executeIndex]==false) {
                this.activatePerClick(spell, item);
                iconContainer.css('cursor', 'pointer');
            }
            spell.appendTo(iconContainer);

            var levelShowContainer = $('<div><b>' + level + '</b></div>').css({
                'width': 6,
                'height': 6,
                'position': 'relative',
                'display': 'inline-block',
                'left': 32 + 'px',
                'top': -14 + 'px'
            });
            levelShowContainer.appendTo(iconContainer);

            if (level < maxLevel) {
                var upgradeContainer = $('<div><b>+</b></div>').css({
                    'width': 6,
                    'height': 6,
                    'position': 'relative',
                    'display': 'inline-block',
                    'left': 27 + 'px',
                    'top': -32 + 'px'
                });

                this.levelUpgrade(upgradeContainer, item);
                upgradeContainer.css('cursor', 'pointer');
                upgradeContainer.appendTo(iconContainer);
            }

            iconContainer.appendTo(this.availableBox);
        }
    }
    this.availableTitle.appendTo(wrap2);
    this.availableBox.appendTo(wrap2);
    wrap2.appendTo(this.content);
};

UpgradesTab.prototype.buildUpgrade = function (container,itemTypeId) {
    var self = this;
    container.click(function (e) {
        var evt = new BuildUpgradeEvent(game);
        evt.setItemTypeId(itemTypeId);
        evt.setParentObject(self.mapObj);
        uc.addEvent(evt);
    });
};

UpgradesTab.prototype.levelUpgrade = function (container,item) {
    var self = this;
    container.click(function (e) {
        self.mapObj._blocks.UpgradeProduction.levelUpgrade(item);
    });
};


UpgradesTab.prototype.activatePerClick = function (container,item) {
    container.click(function (e) {
        item._blocks.Feature.checkStackExecution(true);
    });
};
