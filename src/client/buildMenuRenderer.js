// make button and add it to button container


var BuildMenu = function initMenu(eventBuild,eventDelete,eventMove,menu_container){

	var menu_buttons;

	baseMenu_container = new createjs.Container();
	baseMenu_container.name = "menu";
	
	build_button_container = new createjs.Container();
	build_menu_container = new createjs.Container();
	build_menu_grid_container = new createjs.Container();
	

	// base menu	
	var base_menu_img = new createjs.Bitmap("resources/icons/Globe.png");
	base_menu_img.x = 0;
	base_menu_img.y = canvas_height - 128;		
	
	// delete button
	var delete_button_img = new createjs.Bitmap("resources/icons/destroy.png");
	delete_button_img.scaleX = 0.5;
	delete_button_img.scaleY = 0.5;	
	
	// move button
	var move_button_img = new createjs.Bitmap("resources/icons/move.png");
	
	move_button_img.scaleX = 0.5;
	move_button_img.scaleY = 0.5;	
	
	// build button
	
	var build_button_img = new createjs.Bitmap("resources/icons/build.png");

	build_button_img.scaleX = 0.5;
	build_button_img.scaleY = 0.5;		
	
	// build menu	
	var build_menu_main_rect = new createjs.Shape();
	build_menu_main_rect.graphics.beginFill("#F5F7C4").drawRoundRect(220,120,665,437,30);

	var build_menu_header_rect1 = new createjs.Shape();	
	build_menu_header_rect1.graphics.beginFill("#eee081").drawRoundRectComplex(220,120,280,30,30,0,0,0);
	
	var build_menu_header_rect2 = new createjs.Shape();
	build_menu_header_rect2.graphics.beginFill("#eed781").drawRoundRectComplex(410,120,280,30,0,0,0,0);
	
	var build_menu_header_rect3 = new createjs.Shape();
	build_menu_header_rect3.graphics.beginFill("#eece81").drawRoundRectComplex(600,120,285,30,0,30,0,0);
	
	// grid	
		// horizontal
		xstart = 230; ystart = 160; yend = 547; 
	for (var x = 0; x<6; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xstart,yend);	
		xstart += 129;
		menu_grid.alpha = 0.75;
		build_menu_grid_container.addChild(menu_grid);
	}
		// vertical
	xstart = 230; xend = 875; ystart = 160;  
	for (var x = 0; x<4; x++ ){	
		var menu_grid = new createjs.Shape();	
		menu_grid.graphics.setStrokeStyle(1, "butt", "miter").beginStroke("#000000").moveTo(xstart,ystart).lineTo(xend,ystart);	
		ystart += 129;
		menu_grid.alpha = 0.75;
		build_menu_grid_container.addChild(menu_grid);
	}
	
	// images 	
	var bakery_preview = new createjs.Bitmap("resources/objects/bakery1.png");
		bakery_preview.x = 231;
		bakery_preview.y = 161;	

	var bank_preview = new createjs.Bitmap("resources/objects/bank1.png");
		bank_preview.x = 231 + 129;
		bank_preview.y = 161;
		bank_preview.scaleX = (2/3);
		bank_preview.scaleY = (2/3);
		
	var burger_preview = new createjs.Bitmap("resources/objects/burger1.png");
		burger_preview.x = 231 + (2*129);
		burger_preview.y = 161;
	
	var butcher_preview = new createjs.Bitmap("resources/objects/butcher1.png");
		butcher_preview.x = 231 + (3*129);
		butcher_preview.y = 161;
	
	build_menu_container.addChild(build_menu_main_rect,build_menu_header_rect3,build_menu_header_rect2,build_menu_header_rect1,build_menu_grid_container,bakery_preview,bank_preview,burger_preview,butcher_preview);
	build_button_container.addChild(build_button_img);	
	baseMenu_container.addChild(base_menu_img);
	menu_container.addChild(baseMenu_container);
	
	// event listener for main menu
	baseMenu_container.addEventListener("click",click_main_menu);	
	
	
	menu_buttons =  [delete_button_img,move_button_img,build_button_container,build_menu_container];
	
	
	
	
	
	
	function click_main_menu() { 
	nr_child = menu_container.getNumChildren();
		if (nr_child < 3){
		
		menu_buttons[0].x =  5;
		menu_buttons[0].y = canvas_height - 128 -84;
		
		menu_buttons[1].x =  64 +5;
		menu_buttons[1].y =canvas_height - 128 -64;	
		
		menu_buttons[2].x = 128 +5;
		menu_buttons[2].y =canvas_height - 128 -44;		
		
		menu_container.addChild(menu_buttons[0],menu_buttons[1],menu_buttons[2]);
		
		menu_buttons[0].addEventListener("click", eventDelete);
		menu_buttons[1].addEventListener("click", eventMove);	
		menu_buttons[2].addEventListener("click",click_build_menu);
		stage.update();
		}
		else {
			for (var c = 2; c<5; c++) {
			kill_child = menu_container.getChildAt(2);
			menu_container.removeChild(kill_child);
			}
		
		}
	}


	function click_build_menu() { 
		nr_child = menu_container.getNumChildren();
		if (nr_child < 6){
		menu_container.addChild(menu_buttons[3]);
		menu_buttons[3].children[6].addEventListener("click",eventBuild);	
		stage.update();
		}
		else {
		kill_child = menu_container.getChildAt(5);
		menu_container.removeChild(kill_child);
		}
	}

}