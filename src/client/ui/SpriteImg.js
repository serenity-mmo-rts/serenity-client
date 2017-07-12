var SpriteImg = function (spritesheetId, spriteFrame, width, height) {
    var self = this;

    this.content = $('<div/>');
    this.content.css({
        'width': width+'px',
        'height': height+'px'
    });

    this.spritesheet = game.spritesheets.get(spritesheetId);
    this.spriteFrameIcon = this.spritesheet.frames[spriteFrame];
    this.width = width;
    this.height = height;

    this.tmpImg = uc.loadqueue.getResult("sheet"+spritesheetId+"image"+this.spriteFrameIcon[4]);
    if (this.tmpImg==null){
        uc.onSpriteLoadedCallback["testImg"] = function() {
            self.tmpImg = uc.loadqueue.getResult("sheet"+spritesheetId+"image"+self.spriteFrameIcon[4]);
            if (self.tmpImg==null){
                console.log("error: preloadJS is still not finished with loading...?..")
            }
            else {
                self.draw();
            }
        };
    }
    else {
         this.draw();
    }

}

SpriteImg.prototype.draw = function() {

    // read the given spritesheet values:
    var imgW = this.tmpImg.naturalWidth;
    var imgH = this.tmpImg.naturalHeight;
    var posXinSheet = this.spriteFrameIcon[0];
    var posYinSheet = this.spriteFrameIcon[1];
    var spriteWidth = this.spriteFrameIcon[2];
    var spriteHeight = this.spriteFrameIcon[3];
    var imgSrc = this.spritesheet.images[this.spriteFrameIcon[4]];

    // calculate scaling:
    var scaleWidth =  this.width / spriteWidth;
    var scaleHeight =  this.height / spriteHeight;
    var scale = Math.min(scaleWidth, scaleHeight);

    // calculate new dimensions and corresponding shifts:
    var actualWidth = scale * spriteWidth;
    var actualHeight = scale * spriteHeight;
    var widthTotalImage = scale * imgW;
    var heightTotalImage = scale * imgH;
    var shiftXScaledSheet = -posXinSheet * scale;
    var shiftYScaledSheet = -posYinSheet * scale;

    // assemble the image:
    this.imageDiv = $('<div/>');
    this.imageDiv.css({
        'background-image': 'url('+imgSrc+')' ,
        'background-position-x': shiftXScaledSheet,
        'background-position-y': shiftYScaledSheet,
        'background-repeat':'no-repeat',
        'background-size': widthTotalImage+'px ' + heightTotalImage+'px',
        'width': actualWidth+'px',
        'height': actualHeight+'px'
    });
    this.imageDiv.appendTo(this.content);

}