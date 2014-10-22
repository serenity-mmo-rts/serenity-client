// make button and add it to button container

var BuildMenu = function initMenu(mapId){

    // canvas size and reference
    var self = this;
   // game = gameData;
    this.mapId = mapId;
    this.canvas_height = window.innerHeight;
    this.canvas_width = window.innerWidth;
    // callbacks
//    this.eventBuild = eventBuild;
 //   this.eventDelete = eventDelete;
  //  this.eventMove = eventMove;
    // upper container reference


    //this.nr =  this.BuildMenuData.submenus.length;
    var mapTypeId =  game.maps.hashList[this.mapId].mapTypeId;
    this.BuildMenuData = game.mapTypes.hashList[mapTypeId].buildCategories;
    this.nr =  this.BuildMenuData.length;

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
            var spritesheet = game.spritesheets.hashList[objectType.spritesheetId];
            var spriteFrameIcon = spritesheet.frames[objectType.spriteFrameIcon];
            var img = spritesheet.images[spriteFrameIcon[4]];
            var objectname = objectType.name;

            var buildMenuItemId = 'cat' + i + 'obj' + k;
            $("#ui-accordion-accordion-panel-"+i+"").append('<li class="buildMenuItem"><a href="#" id="'+buildMenuItemId+'" name="'+objectTypeId+'" title="Text"></a></li>');
            $("#"+buildMenuItemId).append('<p class="buildMenuText">'+objectname+'</p>');
            $("#"+buildMenuItemId).append('<span class="buildMenuImg" style="background-image: url('+img+'); background-position:-'+spriteFrameIcon[0]+'px -'+spriteFrameIcon[1]+'px" />');
            $("#"+buildMenuItemId).click(function()  {
                //$("#buildMenu").hide();
                //self.clickcount = 0;
                self.eventBuild(this.name);
            });
        }
    }

};



BuildMenu.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

    $( "#bottomLeftUi" ).toggleClass( "hidden", 500, "easeOutSine" );

    // if deleting or moving was still on switch it off
    this.destroy = false;
    this.del_count = 1;
    this.move = false;
    this.move_count = 1;

    this.currBuildingObj = new MapObject(game, {_id: 'tempObject', x: this.main_container.x, y: this.main_container.y, objTypeId: objectTypeId, userId: this.client.userId});
    game.maps.get(this.mapId).mapObjects.add(this.currBuildingObj);
    this.map.renderObj(this.currBuildingObj);

    this.currBuildingObj.objectBitmap.mouseMoveOutside = true;
    this.currBuildingObj.objectBitmap.alpha = 1;

    //this.current_object = this.currentlyBuildingBitmap;
    this.build = true;
    //   }
};