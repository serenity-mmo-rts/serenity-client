
// Constructor
var Button = function makeButton(xpos,ypos,height,width,icon,text,font,text_color,color,style,submenu,callback,radius)  {

    var self = this;
    this.buttonContainer = new createjs.Container();
    this.submenu = submenu;
    this.callback = callback;
    this.buttonContainer.clicked = false;


    this.form = new createjs.Shape();

    if (style == "cicle") {
        this.form.graphics.beginFill(color).drawRoundRect(xpos,ypos,radius);
    }
    else if  (style == "rect") {
        this.form.graphics.beginFill(color).rect(xpos,ypos,width,height);
    }
    else if  (style == "roundrect") {
        this.form.graphics.beginFill(color).drawRoundRect(xpos,ypos,width,height,radius);

    }

    var img = new Image();
    img.src = icon;    // must be dynamic from server data
    this.icon = new createjs.Bitmap(img);
    this.icon.scaleX = 0.15;
    this.icon.scaleY = 0.15;
    this.icon.x = xpos + (width/15);
    this.icon.y=  ypos + (height/12);


    this.text = new createjs.Text(text,font,text_color);
    this.text.x = xpos + (width/3);
    this.text.y=  ypos + (height/3);

    this.clickFunction  = this.click.bind(this);
    this.overFunction  = this.over.bind(this);
    this.outFunction  = this.out.bind(this);

    this.form.addEventListener("mousedown",this.clickFunction);
    this.form.addEventListener("mouseover",this.overFunction);
    this.form.addEventListener("mouseout",this.outFunction);

    this.buttonContainer.addChild(this.form,this.icon,this.text);
    this.buttonContainer.Listeners = jQuery.extend(true, {}, this.buttonContainer.children[0]._listeners);
};




// event Listeners

// click
Button.prototype.click = function click() {



   if  (typeof this.callback != 'undefined') {
        this.callback();
    }

    else {


        // if clicked before remove child submenu
        if (this.buttonContainer.clicked) {
            this.buttonContainer.clicked = false;
            var n = this.buttonContainer.getNumChildren();
            for (var i = 3; i<n; i++) {
                this.buttonContainer.removeChildAt(3);
            }

        }

        // if not clicked before
        else {
            this.buttonContainer.clicked = true;
          // get index of current button and delete previous submenus (nephews of current button)
            var p = this.buttonContainer.parent.children.length;
            var id = this.buttonContainer.id;
            for (i = 3; i<p; i++) {
                // get idx of current button
                 var id2 = this.buttonContainer.parent.children[i].id;
                 if (id == id2) {
                    this.idx = i;
                 }
                // delete nephews
                if (typeof this.buttonContainer.parent.children[i].clicked != 'undefined')  {
                    var n =  this.buttonContainer.parent.children[i].getNumChildren();
                    for (var k = 3; k<n; k++) {
                        this.buttonContainer.parent.children[i].removeChildAt(3);

                    }
                }
            }

            // include over and out event listeners for previous clicked button (sisters)
            if (typeof this.buttonContainer.parent.lastVisited != 'undefined')  {
                var adding = this.buttonContainer.parent.lastVisited;
                this.buttonContainer.parent.children[adding].clicked  = false;
                this.buttonContainer.parent.children[adding].children[0].addEventListener("mouseover",this.buttonContainer.parent.children[adding].Listeners.mouseover[0]);
                this.buttonContainer.parent.children[adding].children[0].addEventListener("mouseout",this.buttonContainer.parent.children[adding].Listeners.mouseout[0]);
                this.buttonContainer.parent.children[adding].children[0].graphics._fillInstructions[0].params[1] = "#cccccc";
                this.buttonContainer.parent.children[adding].children[2].color = "#000";
            }

            // save button index in parent
            this.buttonContainer.parent.lastVisited  = this.idx;
            // make blue darker for current button
            this.buttonContainer.children[0].graphics._fillInstructions[0].params[1] = "#0000FF";
            this.buttonContainer.children[2].color = "#FFFFFF";
            // remove over and out event listeners for current button
            this.buttonContainer.children[0].removeEventListener("mouseover",this.overFunction);
            this.buttonContainer.children[0].removeEventListener("mouseout",this.outFunction);

            // add child menu of the button
            if (typeof this.submenu.menuItems != 'undefined'){
                var l = this.submenu.menuItems.length;
                for (var i = 0;i <l; i++) {
                    this.buttonContainer.addChild(this.submenu.menuItems[i]);
                }
            }
        }
   }
};


Button.prototype.over = function over() {

    // for child itself
    this.buttonContainer.children[0].graphics._fillInstructions[0].params[1] = "#5C7DDE";
    this.buttonContainer.children[2].color = "#FFFFFF";


};

Button.prototype.out = function out() {
    this.buttonContainer.children[0].graphics._fillInstructions[0].params[1] = "#cccccc";
    this.buttonContainer.children[2].color = "#000";
};





