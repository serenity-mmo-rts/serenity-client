
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
    var allowedItemIds = this.mapObj._blocks.UpgradeProduction._itemIds;

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

        var container= $('<div style="white-space:nowrap"></div>').css({'width':breite, 'height':hoehe, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
        var image = $('<div style="white-space:nowrap" ></div>')
        image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
        image.appendTo(container);

        this.bindClickEvent(container,itemId);
    }
    this.creationTitle.appendTo(wrap1);
    this.creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

};

UpgradesTab.prototype.listProducedUpgrades = function () {
    var self = this;
    var wrap2 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px','top':'200','position': 'absolute'});
    var availableTitle =  $('<div>Produced Upgrades</div>').css({});
    var availableBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allItems= this.mapObj.getItems();

    for (var i = 0; i<allItems.length; i++){
        var itemType =  allItems[i]._itemType;
            var spritesheet = game.spritesheets.get(itemType._iconSpritesheetId);
            var spriteFrameIcon = spritesheet.frames[itemType._iconSpriteFrame];
            var x = spriteFrameIcon[0];
            var y = spriteFrameIcon[1];
            var breite = spriteFrameIcon[2];
            var hoehe = spriteFrameIcon[3];
            var img = spritesheet.images[spriteFrameIcon[4]];
            var gap = 8;

            var container= $('<div style="white-space:nowrap"></div>').css({'width':32, 'height':32, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
            var image = $('<div style="white-space:nowrap" ></div>')
            image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
            image.appendTo(container);
            container.appendTo(availableBox);
            var self = this;
            container.click(function (e) {
                //e.stopImmediatePropagation();
                // e.preventDefault();
            });
    }
    availableTitle.appendTo(wrap2);
    availableBox.appendTo(wrap2);
    wrap2.appendTo(this.content);
};

UpgradesTab.prototype.bindClickEvent = function (container,itemId) {
    var self = this;
    container.click(function (e) {
        self.mapObj._blocks.UpgradeProduction.startUpgrade(itemId);
    });
    container.appendTo(this.creationBox);
    container = null;

};





