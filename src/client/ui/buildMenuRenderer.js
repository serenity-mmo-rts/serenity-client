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
    var mapTypeId =  game.maps.hashList[this.mapId].mapTypeId;
    this.BuildMenuData = game.mapTypes.hashList[mapTypeId]._buildCategories;
    this.nr = this.BuildMenuData.length;

    // buildMenu   with J-Query
    // weather to show menu or not
    this.clickcount = 0;

    for (var i = 0; i< this.nr; i++) {
        $("#accordion").append('<h3>Building Category</h3><ol class="build-menu-list"></ol>');
    }

    // initialize correct one
    $( "#accordion" ).accordion({
        heightStyle: "fill"
    });
    //$("#buildMenu").hide();

    // fill it
    for (var i = 0; i< this.nr; i++) {
        $("#ui-accordion-accordion-header-"+i+"").text(this.BuildMenuData[i].name);
        for (var k=0; k<this.BuildMenuData[i].objectTypeIds.length; k ++) {
            var objectTypeId = this.BuildMenuData[i].objectTypeIds[k];
            var objectType = game.objectTypes.hashList[objectTypeId];
            var spritesheet = game.spritesheets.hashList[objectType._iconSpritesheetId];
            var spriteFrameIcon = spritesheet.frames[objectType._iconSpriteFrame];
            var img = spritesheet.images[spriteFrameIcon[4]];
            var objectname = objectType._name;

            var buildMenuItemId = 'cat' + i + 'obj' + k;
            $("#ui-accordion-accordion-panel-"+i+"").append('<li class="buildMenuItem"><a href="#" id="'+buildMenuItemId+'" name="'+objectTypeId+'" title="buildTime: '+objectType._buildTime+'"></a></li>');
            $("#"+buildMenuItemId).append('<p class="buildMenuText">'+objectname+'</p>');
            $("#"+buildMenuItemId).append('<span class="buildMenuImg" style="background-image: url('+img+'); background-position:-'+spriteFrameIcon[0]+'px -'+spriteFrameIcon[1]+'px" />');
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

    this.mapControl.setStateBuild(objectTypeId);


};