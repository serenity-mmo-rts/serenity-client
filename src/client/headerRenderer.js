var HeaderMenu = function initHeader(menu_container){
	// headermenu
	header_container = new createjs.Container();
	header_container.name = "header";
	var header_rect = new createjs.Shape();
	header_rect.graphics.beginFill("#F5F7C4").drawRoundRect((canvas_width/2) -400,0,800,32,16);

	header_container.addChild(header_rect);
	menu_container.addChild(header_container);
}
