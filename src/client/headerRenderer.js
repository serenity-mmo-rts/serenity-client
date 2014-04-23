var HeaderMenu = function initHeader(menu_container,canvas_size){
	// headermenu
    this.menu_container = menu_container;
    this.canvas_height = canvas_size[0];
    this.canvas_width = canvas_size[1];

	this.header_container = new createjs.Container();
	this.header_container.name = "header";
	this.header_rect = new createjs.Shape();
	this.header_rect.graphics.beginFill("#F5F7C4").drawRoundRect((this.canvas_width/2) -400,0,800,32,16);

	this.header_container.addChild(this.header_rect);
	this.menu_container.addChild(this.header_container);
};
