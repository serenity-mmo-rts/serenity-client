// make button and add it to button container

var BuildMenu = function initMenu(eventBuild,eventDelete,eventMove,menu_container,canvas_size){

    // canvas size and reference
    var self = this;
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

    // buildMenu   with J-Query
    this.clickcount = 0;
    $(function() {
        $( "#accordion" ).accordion({
            heightStyle: "fill"
        });
        $("#buildMenu").hide();
        $("#accordion").hide();

    });

    var types  = ['Resource','Production','Military'];
    var images = {
        'image1':'resources/objects/test1.png',
        'image2':'resources/objects/bank1.png',
        'image3':'resources/objects/bakery1.png',
        'image4':'resources/objects/butcher1.png',
        'image5':'resources/objects/burger1.png'
    };

    for (var i = 0; i< types.length; i++) {
        $( "#accordion" ).append('<h3 id="header'+i+'"></h3>').addClass("buildSubmenu");
        $("#header"+i+"").text(types[i]);
    }

    $.each(images, function(){
        $(".buildSubmenu").add('<div><p><img src="' + this + '" height=64 width=64></p></div>');
    });



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


    if  (this.clickcount == 0){
        $("#accordion").show();
        $("#buildMenu").show();
        this.clickcount = 1;
    }
    else{
        $("#accordion").hide();
        $("#buildMenu").hide();
        this.clickcount = 0;
    }


};
