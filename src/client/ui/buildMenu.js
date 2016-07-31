// make button and add it to button container

var BuildMenu = function(mapId,MapControl){

    // canvas size and reference
    var self = this;
   // game = gameData;
    this.mapId = mapId;
    this.mapControl = MapControl;


    this.canvas_height = window.innerHeight;
    this.canvas_width = window.innerWidth;

    //this.nr =  this.BuildMenuData.submenus.length;
    var mapTypeId =  game.layers.hashList[this.mapId].mapTypeId;
    this.BuildMenuData = game.layerTypes.hashList[mapTypeId]._buildCategories;
    this.nr = this.BuildMenuData.length;

    // buildMenu   with J-Query
    // weather to show menu or not
    this.clickcount = 0;

    $("#accordion").html('');
    for (var i = 0; i< this.nr; i++) {
        $("#accordion").append('<h3>Building Category</h3><ol class="build-menu-list"></ol>');
    }

    // initialize correct one
    $( "#accordion" ).accordion({
        heightStyle: "fill"
    });
    //$("#buildMenu").hide();

    $( "#accordion" ).accordion( "refresh" );

    // fill it
    for (var i = 0; i< this.nr; i++) {
        $("#ui-accordion-accordion-header-"+i+"").text(this.BuildMenuData[i].name);
        for (var k=0; k<this.BuildMenuData[i].objectTypeIds.length; k ++) {
            var objectTypeId = this.BuildMenuData[i].objectTypeIds[k];
            var objectType = game.objectTypes.hashList[objectTypeId];
            var spritesheet = game.spritesheets.hashList[objectType._iconSpritesheetId];
            var spriteFrameIcon = spritesheet.frames[objectType._iconSpriteFrame];
            var imgSrc = spritesheet.images[spriteFrameIcon[4]];
            var objectname = objectType._name;

            var buildMenuItemId = 'cat' + i + 'obj' + k;
            $("#ui-accordion-accordion-panel-"+i+"").append('<li class="buildMenuItem"><a href="#" id="'+buildMenuItemId+'" name="'+objectTypeId+'" title="buildTime: '+objectType._buildTime+'"></a></li>');
            $("#"+buildMenuItemId).append('<p class="buildMenuText">'+objectname+'</p>');

            var sprite = new SpriteImg(objectType._iconSpritesheetId, objectType._iconSpriteFrame, 32, 32);
            $("#"+buildMenuItemId).append(sprite.content);
            //$("#"+buildMenuItemId).append('<span class="buildMenuImg" style="background-image: url('+imgSrc+'); background-position:-'+spriteFrameIcon[0]+'px -'+spriteFrameIcon[1]+'px; background-repeat: no-repeat;" />');

            $("#"+buildMenuItemId).click(function()  {
                //$("#buildMenu").hide();
                //self.clickcount = 0;
                self.initializeObject(this.name);
            });
        }
    }

};


BuildMenu.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

    $( "#bottomLeftUi" ).toggleClass( "hidden", 500, "easeOutSine" );

    //this.mapControl.setStateBuild(objectTypeId);

    var object = new MapObject(game, {_id: 'tempObject', mapId: this.mapId, x: 0, y: 0, objTypeId: objectTypeId, userId: uc.userId, state: mapObjectStates.TEMP});
    this.tmpEvent = new BuildObjectEvent(game);
    this.tmpEvent.setParameters(object);
    this.mapControl.map.addTempObj(object);
    var self = this;

    function callbackOnSelect(gameCoord){
        self.mapControl.map.deleteTempObj();
        uc.addEvent(self.tmpEvent);
        self.tmpEvent = null;
    }

    function callbackCheckValidSelection(gameCoord){
        object.x = gameCoord.x;
        object.y = gameCoord.y;
        self.mapControl.map.renderObj(object);
        self.tmpEvent.setCoordinates(gameCoord);
        var valid = self.tmpEvent.isValid();
        if (valid) {
            object.objectBitmap.alpha = 1;
        }
        else {
            object.objectBitmap.alpha = 0.3;
        }
        return valid;
    }

    function callbackCanceled(){
        self.tmpEvent = null;
        self.mapControl.map.deleteTempObj();
    }
    this.mapControl.setStateSelectCoord(callbackOnSelect,callbackCheckValidSelection,callbackCanceled);


};