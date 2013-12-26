var HeaderMenu = function initHeader(menu_container){
	// headermenu
	header_container = new createjs.Container();
	header_container.name = "header";
	var header_rect = new createjs.Shape();
	header_rect.graphics.beginFill("#F5F7C4").drawRoundRect((canvas_width/2) -400,0,800,32,16);
	
	;
	
	woodi = new Image();
	woodi.src = "resources/icons/Wood_02.png";	
	wood = new createjs.Bitmap(woodi);		
	wood.x = (canvas_width/2) -400 +10;
	wood.y = 0;
	wood.scaleX = 0.5;
	wood.scaleY = 0.5;
	
	wood_amount = amount_of_wood.toString();
	var wood_label = new createjs.Text(wood_amount, "bold 16px Arial", "#000000");
	wood_label.x = (canvas_width/2) -400 +50;
	wood_label.y = 10;			
	
	header_container.addChild(header_rect,wood,wood_label);
	menu_container.addChild(header_container);
}
