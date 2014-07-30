// make button and add it to button container

var BuildMenu = function initMenu(eventBuild,eventDelete,eventMove,menu_container,canvas_size,gameData,mapId){

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
    this.menu_container = menu_container;

    //  local build containers
	this.baseMenu_container = new createjs.Container();
	this.baseMenu_container.name = "mainBuildButton";

    this.build_button_container = new createjs.Container();
    this.build_button_container.name = "buildButton";
    this.move_button_container = new createjs.Container();
    this.move_button_container.name = "moveButton";
    this.delete_button_container = new createjs.Container();
    this.delete_button_container.name = "deleteButton";

	this.build_menu_container = new createjs.Container();
    this.build_menu_container.name = "buildMenu";
	

	// base menu	
	this.base_menu_img = new createjs.Bitmap("resources/icons/Globe.png");
	this.base_menu_img.x = 0;
	this.base_menu_img.y = this.canvas_height - 128;
    this.baseMenu_container.addChild(this.base_menu_img);
	
	// delete button
	this.delete_button_img = new createjs.Bitmap("resources/icons/destroy.png");
	this.delete_button_img.scaleX = 0.5;
	this.delete_button_img.scaleY = 0.5;
    this.delete_button_container.addChild(this.delete_button_img);
	
	// move button
	this.move_button_img = new createjs.Bitmap("resources/icons/move.png");
    this.move_button_img.scaleX = 0.5;
	this.move_button_img.scaleY = 0.5;
    this.move_button_container.addChild(this.move_button_img);
	
	// build button
	this.build_button_img = new createjs.Bitmap("resources/icons/build.png");
	this.build_button_img.scaleX = 0.5;
	this.build_button_img.scaleY = 0.5;
    this.build_button_container.addChild(this.build_button_img);


    // build menu data sample
    /*this.BuildMenuData = {
        submenus: [
        {
            'name': 'Resources',
            'images': ['test1.png','bank1.png','bakery1.png','butcher1.png','burger1.png'],
            'objNames': ['building1','building2','building3','building4','building5'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']
        },
        {
            'name': 'Production',
            'images': ['test1.png','bank1.png','bakery1.png','butcher1.png','burger1.png'],
            'objNames':  ['building6','building7','building8','building9','building10'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']
        },
        {
            'name': 'Military',
            'images': ['test1.png','bank1.png','bakery1.png','butcher1.png','burger1.png'],
            'objNames':  ['building11','building12','building13','building14','building15'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']

        }]

    };*/

    //this.nr =  this.BuildMenuData.submenus.length;
    var mapTypeId =  this.gameData.maps.hashList[this.mapId].mapTypeId;
    this.BuildMenuData = this.gameData.mapTypes.hashList[mapTypeId].buildCategories;
    this.nr =  this.BuildMenuData.length;

    // buildMenu   with J-Query
    // weather to show menu or not
    this.clickcount = 0;

    // initialize correct one
    $( "#accordion" ).accordion({
        heightStyle: "fill"
    });
    $("#buildMenu").hide();

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
                $("#buildMenu").hide();
                self.clickcount = 0;
                self.eventBuild(this.name);
            });
        }
    }

    // add base image to menu
    this.menu_container.addChild(this.baseMenu_container);

    // event listener for base menu
    this.base_menu_img.addEventListener("click",(function(){self.click_main_menu()}));

    // menu buttons
    this.menu_buttons =  [this.delete_button_container,this.move_button_container,this.build_button_img];

    this.menu_buttons[0].addEventListener("click", (function(){self.eventDelete()}));
    this.menu_buttons[1].addEventListener("click", (function(){self.eventMove()}));
    this.menu_buttons[2].addEventListener("click", (function(){self.click_build_menu()}));
   // this.menu_buttons[3].children[6].addEventListener("click",(function(){self.eventBuild()}));

};

BuildMenu.prototype.click_main_menu = function() {

    var nr_child = this.baseMenu_container.getNumChildren();
    if (nr_child < 2){

        this.menu_buttons[0].x =  5;
        this.menu_buttons[0].y = this.canvas_height - 128 -84;

        this.menu_buttons[1].x =  64 +5;
        this.menu_buttons[1].y = this.canvas_height - 128 -64;

        this.menu_buttons[2].x = 128 +5;
        this.menu_buttons[2].y = this.canvas_height - 128 -44;

        this.baseMenu_container.addChild(this.menu_buttons[0],this.menu_buttons[1],this.menu_buttons[2]);

    }
    else {
        for (var c = 1; c<4; c++) {
        var kill_child = this.baseMenu_container.getChildAt(1);
            this.baseMenu_container.removeChild(kill_child);

        }

    }
};


BuildMenu.prototype.click_build_menu = function() {
    var self = this;

    if  (this.clickcount == 0){
        $("#buildMenu").show();
        this.clickcount = 1;

    }
    else{
        $("#buildMenu").hide();
        this.clickcount = 0;
    }
};
