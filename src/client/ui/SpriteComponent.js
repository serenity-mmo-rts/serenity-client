/**
 *
 * @param params
 * @constructor
 */
var SpriteComponent = function(params) {

    var self = this;

    this.width = params.width;
    this.height = params.height;
    this.spriteFrame = params.spriteFrame;
    this.spritesheetId = params.spritesheetId;

    this.imageElement = ko.observable('<div></div>');

    this.spritesheet = game.spritesheets.get(params.spritesheetId);
    if (this.spritesheet) {
        this.loadTempImage();
    }
    else {
        var uuid = Math.random();
        uc.onGameDataLoaded[uuid] = function () {
            self.spritesheet = game.spritesheets.get(params.spritesheetId);
            self.loadTempImage();
            delete uc.onGameDataLoaded[uuid];
        };
    }

};

SpriteComponent.prototype.loadTempImage = function() {
    var self = this;

    this.spriteFrameIcon = this.spritesheet.frames[this.spriteFrame];
    this.tmpImg = uc.loadqueue.getResult("sheet"+this.spritesheetId+"image"+this.spriteFrameIcon[4]);
    if (this.tmpImg==null){
        uc.onSpriteLoadedCallback[Math.random()] = function() {
            self.tmpImg = uc.loadqueue.getResult("sheet"+self.spritesheetId+"image"+self.spriteFrameIcon[4]);
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

};


SpriteComponent.prototype.draw = function() {

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

    this.imageElement('<div style="'+
        'width: '+actualWidth+'px; height: ' + actualHeight+'px; '+
        'background-image: url('+imgSrc+'); '+
        'background-size: '+widthTotalImage+'px '+heightTotalImage+'px; '+
        'background-position: '+shiftXScaledSheet+'px '+shiftYScaledSheet+'px; '+
        'background-repeat: no-repeat;'+
        '"></div>');

};