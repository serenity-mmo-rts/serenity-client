var HeaderMenu = function initHeader(menu_container,canvas_size){
	/** headermenu
    this.menu_container = menu_container;
    this.canvas_height = canvas_size[0];
    this.canvas_width = canvas_size[1];

	this.header_container = new createjs.Container();
	this.header_container.name = "header";
	this.header_rect = new createjs.Shape();
	this.header_rect.graphics.beginFill("#F5F7C4").drawRoundRect((this.canvas_width/2) -400,0,800,32,16);


    this.icon   = "resources/objects/bank1.png";
    var x = 400;
    var y = 20;
    var height  = 40;
    var width   = 160;

    submenu1 = new Menu();
    submenu1.addButton(x+width,y,this.icon,'submenu11',[],function(){});
    submenu1.addButton(x+width,y+height,this.icon,'submenu12',[],function(){});

    submenu2 = new Menu();
    submenu2.addButton(x+width,y+height,this.icon,'submenu21',[],function(){});
    submenu2.addButton(x+width,y+(2*height),this.icon,'submenu22',[],function(){});
    submenu2.addButton(x+width,y+(3*height),this.icon,'submenu23',[],function(){});

    mainmenu = new Menu();
    mainmenu.addButton(x,y,this.icon,'mainmenu1',submenu1,function(){});
    mainmenu.addButton(x,y+height,this.icon,'mainmenu2',submenu2,function(){});
    mainmenu.addButton(x,y+(2*height),this.icon,'mainmenu3',[],function(){});

    this.buttonMenuContainer = new createjs.Container();
    this.buttonMenuContainer.addChild(mainmenu.menuItems[0],mainmenu.menuItems[1],mainmenu.menuItems[2]);


	this.header_container.addChild(this.header_rect);
	this.menu_container.addChild(this.header_container);

     **/

};
