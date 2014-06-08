
    //Constructor
var Icon = function Icon(iconWidth,imgSrc,color,titleText,link) {
        this.Container_initialize();//required
        this._iconWidth = iconWidth;
        this._link = link;
        this._imgSrc = imgSrc;
        this._color = color;
        this._titleText = titleText;
          //Place the registration point in the center of the icon
        this.regX = this._iconWidth*0.5;
        this.regY = this._iconWidth*0.5;
        //Background creation
        this.graphic = new createjs.Graphics();
        this.graphic.beginFill("#777");
        this.graphic.drawRoundRect(0,0,this._iconWidth,this._iconWidth,this._iconWidth*.1);
        this.roundRectangle= new createjs.Shape(this.graphic);
        this.addChild(this.roundRectangle);
        //Text  
        this.text = new createjs.Text(this._titleText, "bold 16px Courier",this._color);
        this.text.textAlign ="center";
        this.text.y = this._iconWidth+15;
        this.text.x = (this._iconWidth*0.5);
        this.text.alpha = 0; //Le texte est masqu� 
        this.addChild(this.text);
        //Image
        this.bitmap = new createjs.Bitmap(this._imgSrc);
        this.bitmap.regX = this._iconWidth*0.5;
        this.bitmap.regY = this._iconWidth*0.5;
        this.bitmap.x =  this._iconWidth*0.5;
        this.bitmap.y =  this._iconWidth*0.5;
        this.addChild(this.bitmap);
        this.tweenSize

};


//If clicked, open a new window
Icon.prototype.onClick = function(){
    console.log("click "+this.graphics);
    window.open(this._link);
};



//Mouse over
Icon.prototype.onMouseOver = function(){
    console.log("mouseOver ");
    //Refresh the bg graphics
    this.parent.graphic.clear();
    this.parent.graphic.beginFill(this.parent._color);
    this.parent.graphic.beginStroke(createjs.Graphics.getRGB(255,255,255));
    this.parent.graphic.drawRoundRect(0,0,this.parent._iconWidth,this.parent._iconWidth,this.parent._iconWidth*.1);
    this.parent.roundRectangle.graphics = this.parent.graphic;
    //Resize icon with a Tween transistion
    //First we have to clean any Tween running
    createjs.Tween.removeTweens(this.parent);
    //Then create a tween object
    this.parent.tweenSize = createjs.Tween.get(this.parent).to({scaleX:1.3,scaleY:1.3},500);
    this.parent.text.alpha= 1;
};


//Mouse out
Icon.prototype.onMouseOut = function(){
    console.log("mouseOut ");
    //Refresh the bg graphics
    this.parent.graphic.clear();
    this.parent.graphic.beginFill("#777");
    this.parent.graphic.drawRoundRect(0,0,this.parent._iconWidth,this.parent._iconWidth,this.parent._iconWidth*.1);
    this.parent.roundRectangle.graphics = this.parent.graphic;
    //Resize icon to base width with a Tween transistion
    createjs.Tween.removeTweens(this.parent);
    this.parent.tweenSize = createjs.Tween.get(this.parent).to({scaleX:1,scaleY:1},500);
    this.parent.text.alpha= 0;
};

