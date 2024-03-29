
var UpgradesTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="upgradeTab"></div>').css({'display': 'inline-block'});
    if (this.mapObj.blocks.hasOwnProperty("UpgradeProduction")){
        this.listAvailableUpgrades();
        this.listProducedUpgrades();
    }

};


UpgradesTab.prototype.listAvailableUpgrades = function () {
    var self = this;
    var wrap1 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px'});
    this.creationTitle =  $('<div>Available Upgrades</div>').css({});
    this.creationBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allowedItemIds = this.mapObj.blocks.UpgradeProduction.itemTypeIds;

    for (var i = 0; i<allowedItemIds.length; i++){
        var itemId = allowedItemIds[i];
        var itemType =  game.itemTypes.get(itemId);
        var spritesheet = game.spritesheets.get(itemType.iconSpritesheetId);
        var spriteFrameIcon = spritesheet.frames[itemType.iconSpriteFrame];
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

    }
    this.creationTitle.appendTo(wrap1);
    this.creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

};

UpgradesTab.prototype.listProducedUpgrades = function () {
    var self = this;
    var wrap2 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px','top':'200','position': 'absolute'});
    this.availableTitle =  $('<div>Produced Upgrades</div>').css({});
    this.availableBox =  $('<div id="availableBox"></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allItems= this.mapObj.getItems();

    var countItems = 0;
    for (var itemId in allItems) {
        if (allItems.hasOwnProperty(itemId)) {
            var item = allItems[itemId];
            if (item.state() != State.HIDDEN && item.state() != State.TEMP && item.state() != State.CONSTRUCTION) {
                var level = allItems[itemId].getLevel();
                countItems=countItems+1;
                if (item.itemType.blocks.hasOwnProperty("Feature")) {
                    var maxLevel = item.itemType.blocks.Feature.length;
                }
                var itemType = allItems[itemId].itemType;
                var spritesheet = game.spritesheets.get(itemType.iconSpritesheetId);
                var spriteFrameIcon = spritesheet.frames[itemType.iconSpriteFrame];
                var x = spriteFrameIcon[0];
                var y = spriteFrameIcon[1];
                var breite = spriteFrameIcon[2];
                var hoehe = spriteFrameIcon[3];
                var img = spritesheet.images[spriteFrameIcon[4]];
                var gap = 10;

                var dispItemoffset = countItems*110;

                var menuWrapper = $('<div class="context-menu-one box menu-1"></div>').css({
                    'position': 'relative',
                    'top': 0,
                    'left':dispItemoffset,
                    'display': 'inline-block',
                    'padding-right': gap + 'px'
                });


                var iconContainer = $('<div style="white-space:nowrap"></div>').css({
                    'width': 32,
                    'height': 32,
                    'position': 'relative',
                    'top': 0,
                    'left':-dispItemoffset,
                    'display': 'inline-block',
                    'padding-right': gap + 'px'
                });
                iconContainer.css('cursor', 'pointer');

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

                    //this.levelUpgrade(upgradeContainer, item);
                    upgradeContainer.css('cursor', 'pointer');
                    upgradeContainer.appendTo(iconContainer);
                }
                iconContainer.appendTo(menuWrapper);
                menuWrapper.appendTo(this.availableBox);
                var self = this;
                this.triggerMenu(iconContainer, item);

                // iconContainer.on('click', function(){
                //    uc.layerView.itemContextMenu.setItem(item);
                // });


            }
        }
    }
    this.availableTitle.appendTo(wrap2);
    this.availableBox.appendTo(wrap2);
    wrap2.appendTo(this.content);



};

UpgradesTab.prototype.buildUpgrade = function (container,itemTypeId) {
    var self = this;
    container.click(function (e) {
        var evt = new BuildUpgradeEvent(self.mapObj.getMap().eventScheduler.events);
        evt.setParameters(itemTypeId,self.mapObj);
        uc.addEvent(evt);
    });
};

UpgradesTab.prototype.triggerMenu = function (container,item) {
    var self = this;
    container.click(function (e) {
        uc.layerView.itemContextMenu.setItem(item);
        uc.layerView.itemContextMenu.init();
        //$(document).contextmenu("open", $(container), item);
        uc.layerView.itemContextMenu.menu.contextmenu({
            position: {my: "left top", at: "center", of: e, collision: "fit"}
        });
        uc.layerView.itemContextMenu.menu.contextmenu("open", $(container), item);

    });
};



