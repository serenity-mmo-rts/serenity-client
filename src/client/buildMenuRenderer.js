// make button and add it to button container


var BuildMenu = function initMenu(eventBuild,eventDelete,eventMove,menu_container,canvas_size){

    var self = this;
	this.canvas_height = canvas_size[0];
    this.canvas_width = canvas_size[1];

    this.menu_container = menu_container;

	this.baseMenu_container = new createjs.Container();
	this.baseMenu_container.name = "menu";
	
	this.build_button_container = new createjs.Container();
	this.build_menu_container = new createjs.Container();
	this.build_menu_grid_container = new createjs.Container();
	

	// base menu	
	this.base_menu_img = new createjs.Bitmap("resources/icons/Globe.png");
	this.base_menu_img.x = 0;
	this.base_menu_img.y = this.canvas_height - 128;
	
	// delete button
	this.delete_button_img = new createjs.Bitmap("resources/icons/destroy.png");
	this.delete_button_img.scaleX = 0.5;
	this.delete_button_img.scaleY = 0.5;
	
	// move button
	this.move_button_img = new createjs.Bitmap("resources/icons/move.png");
    this.move_button_img.scaleX = 0.5;
	this.move_button_img.scaleY = 0.5;
	
	// build button
	this.build_button_img = new createjs.Bitmap("resources/icons/build.png");
	this.build_button_img.scaleX = 0.5;
	this.build_button_img.scaleY = 0.5;
	
	// build menu	
	this.build_menu_main_rect = new createjs.Shape();
    this.build_menu_main_rect.graphics.beginFill("#F5F7C4").drawRoundRect(220,120,665,437,30);

    this.build_menu_header_rect1 = new createjs.Shape();
    this.build_menu_header_rect1.graphics.beginFill("#eee081").drawRoundRectComplex(220,120,280,30,30,0,0,0);

    this.build_menu_header_rect2 = new createjs.Shape();
    this.build_menu_header_rect2.graphics.beginFill("#eed781").drawRoundRectComplex(410,120,280,30,0,0,0,0);

    this.build_menu_header_rect3 = new createjs.Shape();
    this.build_menu_header_rect3.graphics.beginFill("#eece81").drawRoundRectComplex(600,120,285,30,0,30,0,0);
	
	// grid	
		// horizontal
		xstart = 230; ystart = 160; yend = 547; 
	for (var x = 0; x<6; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xstart,yend);	
		xstart += 129;
		menu_grid.alpha = 0.75;
        this.build_menu_grid_container.addChild(menu_grid);
	}
		// vertical
	xstart = 230; xend = 875; ystart = 160;  
	for (var x = 0; x<4; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xend,ystart);	
		ystart += 129;
		menu_grid.alpha = 0.75;
        this.build_menu_grid_container.addChild(menu_grid);
	}
	
	// images 	
    this.bakery_preview = new createjs.Bitmap("resources/objects/bakery1.png");
    this.bakery_preview.x = 231;
    this.bakery_preview.y = 161;

    this.bank_preview = new createjs.Bitmap("resources/objects/bank1.png");
    this.bank_preview.x = 231 + 129;
    this.bank_preview.y = 161;
    this.bank_preview.scaleX = (2/3);
    this.bank_preview.scaleY = (2/3);

    this.burger_preview = new createjs.Bitmap("resources/objects/burger1.png");
    this.burger_preview.x = 231 + (2*129);
    this.burger_preview.y = 161;

    this.butcher_preview = new createjs.Bitmap("resources/objects/butcher1.png");
    this.butcher_preview.x = 231 + (3*129);
    this.butcher_preview.y = 161;

    this.build_menu_container.addChild(this.build_menu_main_rect,this.build_menu_header_rect3,this.build_menu_header_rect2,this.build_menu_header_rect1,this.build_menu_grid_container,this.bakery_preview,this.bank_preview,this.burger_preview,this.butcher_preview);
    this.build_button_container.addChild(this.build_button_img);
    this.baseMenu_container.addChild(this.base_menu_img);
    this.menu_container.addChild(this.baseMenu_container);
	
	// event listener for main menu
    this.baseMenu_container.addEventListener("click",click_main_menu);
    // menu buttons
    this.menu_buttons =  [this.delete_button_img,this.move_button_img,this.build_button_container,this.build_menu_container];

	
	function click_main_menu() { 
	var nr_child = self.menu_container.getNumChildren();
		if (nr_child < 3){

            self.menu_buttons[0].x =  5;
            self.menu_buttons[0].y = self.canvas_height - 128 -84;

            self.menu_buttons[1].x =  64 +5;
            self.menu_buttons[1].y = self.canvas_height - 128 -64;

            self.menu_buttons[2].x = 128 +5;
            self.menu_buttons[2].y = self.canvas_height - 128 -44;

            self.menu_container.addChild(self.menu_buttons[0],self.menu_buttons[1],self.menu_buttons[2]);

            self.menu_buttons[0].addEventListener("click", eventDelete);
            self.menu_buttons[1].addEventListener("click", eventMove);
            self.menu_buttons[2].addEventListener("click",click_build_menu);

		}
		else {
			for (var c = 2; c<5; c++) {
			var kill_child = self.menu_container.getChildAt(2);
                self.menu_container.removeChild(kill_child);
				stage.update();
			}
		
		}
	}


	function click_build_menu() { 
		var nr_child = self.menu_container.getNumChildren();
		if (nr_child < 6){
            self.menu_container.addChild(self.menu_buttons[3]);
            self.menu_buttons[3].children[6].addEventListener("click",eventBuild);
			stage.update();
		}
		else {
        var kill_child = self.menu_container.getChildAt(5);
            self.menu_container.removeChild(kill_child);
			stage.update();
		}
	}

}