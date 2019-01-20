
var UiGlobalMenu = function ( layerView ) {
    var self = this;


    this.layerView = layerView;
    this.client = layerView.client;
    this.userData = null;
    this.parentLayerId = ko.computed(function(){
        var myMapId = self.layerView.loadedMapId();
        if (myMapId){
            return game.layers.get(myMapId).parentMapId();
        }
        else {
            return 0;
        }
    });

    this.content = $('<div>').addClass("ui-widget");
    this.content.empty();
    this.content.css({
        "min-width": "200px",
        "min-height": "200px"
    });

    this.container = $('<div id="container"></div>').css({'top':0, 'left': 0,'display': 'inline-block'}).appendTo(this.content);
    this.userContainer = $('<div id="container"></div>').appendTo(this.content);

    this.createLayerUpButton();
    this.createAdminButton();



};

UiGlobalMenu.prototype.setUserData = function (userData) {
    this.userData = userData;

    if (userData){
        this.createDivs();
    }
    else {
        this.userContainer.empty();
    }

};

UiGlobalMenu.prototype.createDivs = function() {

    if (this.client.userDataLoaded){
        this.userContainer.empty();
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

    var openParentLayerBtn = $('<input id="openParentLayer" type="button" value="openParentLayer"/>').appendTo(this.container);
    openParentLayerBtn.click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        uc.loadMap(self.parentLayerId());
    });

    var logoutBtn = $('<input id="logout" type="button" value="Logout"/>').appendTo(this.container);
    logoutBtn.click(function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        uc.logout();
    });

};

UiGlobalMenu.prototype.createAdminButton = function() {
    $('<a href="/ui/admin.html" target="_blank">Admin Controls</a>').appendTo(this.container);
};


UiGlobalMenu.prototype.createUserInfo= function(userName) {
    this.imageContainer = $('<div id="imageContainer"></div>').appendTo(this.userContainer);
    this.imageContainer.css({'top':0+'%','left':0%+'%','display': 'inline-block'});
    this.nameContainer = $('<div id="nameContainer"></div>').appendTo(this.userContainer);
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
    this.levelUpContainer = $('<div id="levelUpContainer"></div>').appendTo(this.userContainer);
    this.levelUpContainer.css({'top':0+'%','left':50+'%','display': 'inline-block'});
};

UiGlobalMenu.prototype.createStats = function() {
    this.statsContainer = $('<div id="statsContainer"></div>').appendTo(this.userContainer);
    this.statsContainer.css({'top':25+'%','left':25+'%','display': 'inline-block'});
    //var parentLayerId = game.users.get(this.client.userId).parentMapId;
    this.stats = $('<b>'+this.userName+'</b>');
};


UiGlobalMenu.prototype.createOccupation = function() {
    this.occupationContainer = $('<div id="occupationContainer"></div>').appendTo(this.userContainer);
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

    this.healthContainer = $('<div id="healthContainer"></div>').appendTo(this.userContainer);
    this.healthContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderHP = $('<div  style="white-space:nowrap; id="commanderHP"></div>').appendTo(this.healthContainer);
    commanderHP.progressbar({
        value: commanderHealth
    });

    this.armorContainer = $('<div id="armorContainer"></div>').appendTo(this.userContainer);
    this.armorContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderArm = $('<div  style="white-space:nowrap; id="commanderArm"></div>').appendTo(this.armorContainer);
    commanderArm.progressbar({
        value: commanderArmor
    });

    this.engergyContainer = $('<div id="engergyContainer"></div>').appendTo(this.userContainer);
    this.engergyContainer.css({'width':25+'%','display': 'inline-block'});
    var commanderEngy = $('<div  style="white-space:nowrap; id="commanderEngy"></div>').appendTo(this.engergyContainer);
    commanderEngy.progressbar({
        value: commanderEngergy
    });

};


UiGlobalMenu.prototype.createCoins = function() {
    var blackMarketFunds = 50;
    var credits = 200;
    this.coinContainer = $('<div id="coinContainer"></div>').appendTo(this.userContainer);
    this.coinContainer.css({'width':25+'%','display': 'inline-block'});
    this.credits = $('<b>Credits:'+credits+'</b>').appendTo(this.coinContainer);
    this.blackMarketFunds = $('<b>Black Market Funds:'+blackMarketFunds+'</b>').appendTo(this.coinContainer);
};





