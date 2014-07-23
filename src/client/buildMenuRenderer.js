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


    // build menu data sample
    this.BuildMenuData = {
        submenus: [
        {
            'name': 'Resources',
            'images': ['button.gif','bank1.gif','bakery1.gif','butcher1.gif','burger1.gif'],
            'objNames': ['building1','building2','building3','building4','building5'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']
        },
        {
            'name': 'Production',
            'images': ['test1.gif','bank1.gif','bakery1.gif','butcher1.gif','burger1.gif'],
            'objNames':  ['building6','building7','building8','building9','building10'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']
        },
        {
            'name': 'Military',
            'images': ['test1.gif','bank1.gif','bakery1.gif','butcher1.gif','burger1.gif'],
            'objNames':  ['building11','building12','building13','building14','building15'],
            'tooltips': ['this house is very nice','this house is rich','this house is delicous','this house is brutal','this house is fat']

        }]

    };

    this.nr =  this.BuildMenuData.submenus.length;
	// button
        $( "#testbutton").button({
                icons: {
                    primary:  'ui-icon-custom',
                    secondary: null
                },
                text: "this is some icon"
        });




    // buildMenu   with J-Query
    // weather to show menu or not
    this.clickcount = 0;

    // initialize correct one
    $( "#accordion"+this.nr+"" ).accordion({
        heightStyle: "fill"
    });
    // hide all wrappers
    $("#buildMenu3").hide();
    $("#buildMenu4").hide();

    // fill it
    this.allObj = [];
    this.counter = 0;
    for (var i = 0; i< this.nr; i++) {
        $("#ui-accordion-accordion"+this.nr+"-header-"+i+"").text(this.BuildMenuData.submenus[i].name);
        for (var k=0; k<this.BuildMenuData.submenus[i].images.length; k ++) {
            var img = this.BuildMenuData.submenus[i].images[k];
            var objectname = this.BuildMenuData.submenus[i].objNames[k];
            this.allObj[this.counter] = objectname;

            $("#ui-accordion-accordion"+this.nr+"-panel-"+i+"").append('<div id =' + objectname +'><img  src="resources/objects/' + img + '" id="Img'+objectname+'" height=64 width=64 ></div>');
            $("#ui-accordion-accordion"+this.nr+"-panel-"+i+"").append('<div class = "buildMenuText' + k +'"><p>'+objectname+'</p></div>');
            $("#"+objectname+"").addClass("buildMenuImg" + k +"");
            this.counter +=1;

        }
    }

    $(document).ready(function(){
        for (var counter = 0; counter<self.allObj.length; counter++) {
            $("#Img"+self.allObj[counter]+"").click(function()  {
                $("#buildMenu3").hide();
                self.clickcount = 0;
                self.eventBuild();
            });


            $("#Img"+self.allObj[counter]+"").mouseover(function()  {
                document.body.style.cursor="pointer";
            });

            $("#Img"+self.allObj[counter]+"").mouseout(function()  {
                document.body.style.cursor="default";
            });



        }

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
    var self = this;

    if  (this.clickcount == 0){
        $("#buildMenu"+self.nr+"").show();
        this.clickcount = 1;

    }
    else{
        $("#buildMenu"+self.nr+"").hide();
        this.clickcount = 0;
    }
};
