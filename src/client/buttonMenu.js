// button test


var Menu =  function buttonMenu() {

    // default values
    this.height  = 40;
    this.width   = 160;
    this.font   = "bold 12px Arial";
    this.text_color  = "#000";
    this.color = "#cccccc";
    this.style  = "rect";
    this.radius  = 10;
    this.menuItems = [];

};

Menu.prototype.addButton = function(x,y,icon,text,submenu,callback){
    this.xpos = x;
    this.ypos = y;
    this.icon = icon;
    this.text = text;
    this.submenu = submenu;
    this.callback = callback;


    var button = new Button(this.xpos,this.ypos,this.height,this.width,this.icon,this.text,this.font,this.text_color,this.color,this.style,this.submenu,this.callback,this.radius);
    var container = button.buttonContainer;
    this.menuItems.push(container);

};








