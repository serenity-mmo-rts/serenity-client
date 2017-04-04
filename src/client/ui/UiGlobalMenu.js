
var UiGlobalMenu = function ( layerView ) {
    var self = this;


    this.layerView = layerView;
    this.client = layerView.client;

    this.content = $('<div>').addClass("ui-widget");
    this.content.empty();
    this.content.css({
        "min-width": "200px",
        "min-height": "200px"
    });

    this.container = $('<div id="container"></div>').css({'top':0, 'left': 0,'display': 'inline-block'}).appendTo(this.content);
    this.createDebugInfo();

    if (this.client.userDataLoaded) {
        this.createContent();
    }


};

UiGlobalMenu.prototype.createContent = function() {
    this.createUserInfo("not logged in");
    this.createLevelUpButton();
    this.createOccupation();
    this.createStats();


/**
    this.healthContainer = $('<div id="healthContainer"></div>').appendTo(this.container);
    this.healthContainer.css({'width':25+'%','display': 'inline-block'});

    this.armorContainer = $('<div id="armorContainer"></div>').appendTo(this.container);
    this.armorContainer.css({'width':25+'%','display': 'inline-block'});

    this.engergyContainer = $('<div id="engergyContainer"></div>').appendTo(this.container);
    this.engergyContainer.css({'width':25+'%','display': 'inline-block'});

    this.coinContainer = $('<div id="coinContainer"></div>').appendTo(this.container);
    this.coinContainer.css({'width':25+'%','display': 'inline-block'});
 **/
};

UiGlobalMenu.prototype.createDebugInfo = function() {
    this.debugContainer = $('<div id="debugContainer"></div>').appendTo(this.container);
    this.debugContainer.css({'top':50+'%','left':50%+'%','display': 'inline-block'});
    this.fps = $('<div>fps: </div>');
    this.fps.appendTo(this.debugContainer);

    this.mouseCoord = $('<div>x: , y: </div>');
    this.mouseCoord.appendTo(this.debugContainer);
};



UiGlobalMenu.prototype.createUserInfo= function(userName) {
    this.imageContainer = $('<div id="imageContainer"></div>').appendTo(this.container);
    this.imageContainer.css({'top':0+'%','left':0%+'%','display': 'inline-block'});
    this.nameContainer = $('<div id="nameContainer"></div>').appendTo(this.container);
    this.nameContainer.css({'top':0+'%','left':25+'%','display': 'inline-block'});
    // commander image
    this.commanderImage = new SpriteImg('cityBuildingsSprite01',5,50,50);
    this.commanderImage.content.appendTo(this.imageContainer);
    // user name
    this.updateUserName(userName);
};


UiGlobalMenu.prototype.updateUserName = function(userName) {
    //this.nameContainer.empty();
    this.userName = $('<b>'+userName+'</b>');
    this.userName.appendTo(this.nameContainer);
};


UiGlobalMenu.prototype.createLevelUpButton = function() {
    // layer up button
    this.levelUpContainer = $('<div id="levelUpContainer"></div>').appendTo(this.container);
    this.levelUpContainer.css({'top':0+'%','left':50+'%','display': 'inline-block'});
    var parentLayerId = game.layers.get(uc.layerView.mapId).parentMapId;
    if (parentLayerId) {
        var openParentLayerBtn = $('<input id="openParentLayer" type="button" value="openParentLayer"/>').appendTo(this.levelUpContainer);
        openParentLayerBtn.click(function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            uc.loadMap(parentLayerId);
        });
    }
};

UiGlobalMenu.prototype.createStats = function() {
    this.statsContainer = $('<div id="statsContainer"></div>').appendTo(this.container);
    this.statsContainer.css({'top':25+'%','left':25+'%','display': 'inline-block'});
    //var parentLayerId = game.users.get(this.client.userId).parentMapId;
    this.stats = $('<b>'+this.userName+'</b>');
};


UiGlobalMenu.prototype.createOccupation = function() {
    this.occupationContainer = $('<div id="occupationContainer"></div>').appendTo(this.container);
    this.occupationContainer.css({'width':25+'%','display': 'inline-block'});

    $(function() {
        $( "#radio" ).buttonset();
    });

    var selectionMenu = $('<div id="occupationSelectionMenu">' +
    '<form>' +
    '<div id="radio">' +
    '<input type="radio" id="radio1" name="radio" /><label for="radio1">Pilot</label>' +
    '<input type="radio" id="radio2" name="radio" /><label for="radio2">Merchant</label>' +
    '<input type="radio" id="radio3" name="radio" /><label for="radio3">Soldier</label>' +
    '</div>' +
    '</form>' +
    '</div>');

    selectionMenu.appendTo(this.occupationContainer);

};

UiGlobalMenu.prototype.setFPS = function(fps) {
    this.fps.text("fps: " + fps.toString());
}

UiGlobalMenu.prototype.setMouseCoord = function(mouseCoord) {
    this.mouseCoord.text("x: " + Math.round(mouseCoord.x).toString() + ", y: " + Math.round(mouseCoord.y).toString());
}

UiGlobalMenu.prototype.setDebugText = function(debugText) {
    this.debugText.text(debugText);
}




