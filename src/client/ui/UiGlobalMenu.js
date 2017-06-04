
var UiGlobalMenu = function ( layerView ) {
    var self = this;


    this.layerView = layerView;
    this.client = layerView.client;
    this.userData = null;
    this.parentLayerId = ko.observable(0);

    this.content = $('<div>').addClass("ui-widget");
    this.content.empty();
    this.content.css({
        "min-width": "200px",
        "min-height": "200px"
    });

    this.container = $('<div id="container"></div>').css({'top':0, 'left': 0,'display': 'inline-block'}).appendTo(this.content);
    this.createDebugInfo();
    this.createDivs();

};

UiGlobalMenu.prototype.setUserData = function (userData) {
    this.userData = userData;

    this.createDivs();
    /*
    // @Caspar: guck hier mal dr�ber... irgendwie macht das wenig sinn, daher habe ich es auskommentiert:

    // ERROR: userName does not exist in class User
    userData.userName.subscribe(function(newValue) {
        // ERROR: self is not defined
      self.userName(); // update ui conainer
    });
    */
};

UiGlobalMenu.prototype.createDivs = function() {

    //if (this.layerView.mapLoaded) {
        this.createLayerUpButton();
    //}

    if (this.client.userDataLoaded){
        this.createUserInfo("not logged in");
        this.createLevelUpButton();
        this.createOccupation();
        this.createStats();
        this.createCommanderStats();
        this.createCoins();
    }

};

UiGlobalMenu.prototype.createLayerUpButton = function() {

    var self = this;

    this.layerView.loadedMapId.subscribe(function(newValue) {
        if(newValue) {
            self.parentLayerId(game.layers.get(newValue).parentMapId);
        }
        else {
            self.parentLayerId(0);
        }
    });

        var openParentLayerBtn = $('<input id="openParentLayer" type="button" value="openParentLayer"/>').appendTo(this.container);
        openParentLayerBtn.click(function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            uc.loadMap(self.parentLayerId());
        });

};

UiGlobalMenu.prototype.createDebugInfo = function() {
    this.debugContainer = $('<div id="debugContainer"></div>').appendTo(this.container);
    this.debugContainer.css({'top':50+'%','left':50%+'%','display': 'inline-block'});
    this.fps = $('<div>fps: </div>').appendTo(this.debugContainer);
    this.mouseCoord = $('<div>x: , y: </div>').appendTo(this.debugContainer);
};



UiGlobalMenu.prototype.createUserInfo= function(userName) {
    this.imageContainer = $('<div id="imageContainer"></div>').appendTo(this.container);
    this.imageContainer.css({'top':0+'%','left':0%+'%','display': 'inline-block'});
    this.nameContainer = $('<div id="nameContainer"></div>').appendTo(this.container);
    this.nameContainer.css({'top':0+'%','left':25+'%','display': 'inline-block'});
    // commander image
    this.commanderImage = new SpriteImg('cityBuildingsSprite01',5,50,50);
    this.commanderImage.content.appendTo(this.imageContainer);
    this.userName = $('<b></b>');

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


UiGlobalMenu.prototype.createCommanderStats = function() {

    var commanderHealth =10;
    var commanderArmor =10;
    var commanderEngergy =10;

    this.healthContainer = $('<div id="healthContainer"></div>').appendTo(this.container);
    this.healthContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderHP = $('<div  style="white-space:nowrap; id="commanderHP"></div>').appendTo(this.healthContainer);
    commanderHP.progressbar({
        value: commanderHealth
    });

    this.armorContainer = $('<div id="armorContainer"></div>').appendTo(this.container);
    this.armorContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderArm = $('<div  style="white-space:nowrap; id="commanderArm"></div>').appendTo(this.armorContainer);
    commanderArm.progressbar({
        value: commanderArmor
    });

    this.engergyContainer = $('<div id="engergyContainer"></div>').appendTo(this.container);
    this.engergyContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderEngy = $('<div  style="white-space:nowrap; id="commanderEngy"></div>').appendTo(this.engergyContainer);
    commanderEngy.progressbar({
        value: commanderEngergy
    });

};


UiGlobalMenu.prototype.createCoins = function() {
    var blackMarketFunds = 50;
    var credits = 200;
    this.coinContainer = $('<div id="coinContainer"></div>').appendTo(this.container);
    this.coinContainer.css({'width':25+'%','display': 'inline-block'});
    this.credits = $('<b>Credits:'+credits+'</b>').appendTo(this.coinContainer);
    this.blackMarketFunds = $('<b>Black Market Funds:'+blackMarketFunds+'</b>').appendTo(this.coinContainer);
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




