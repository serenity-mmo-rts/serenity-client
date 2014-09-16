// make button and add it to button container

var BuildMenu = function initMenu(eventBuild,eventDelete,eventMove,canvas_size,gameData,mapId){

    // canvas size and reference
    var self = this;
    this.gameData = gameData;
    this.mapId = mapId;
    this.canvas_height = canvas_size[0];
    this.canvas_width = canvas_size[1];
    // callbacks
    this.eventBuild = eventBuild;
    this.eventDelete = eventDelete;
    this.eventMove = eventMove;
    // upper container reference


    //this.nr =  this.BuildMenuData.submenus.length;
    var mapTypeId =  this.gameData.maps.hashList[this.mapId].mapTypeId;
    this.BuildMenuData = this.gameData.mapTypes.hashList[mapTypeId].buildCategories;
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
            var objectType = this.gameData.objectTypes.hashList[objectTypeId];
            var spritesheet = this.gameData.spritesheets.hashList[objectType.spritesheetId];
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
