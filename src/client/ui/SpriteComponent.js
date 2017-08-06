/**
 *
 * @param params
 * @constructor
 */
var SpriteComponent = function(params) {

    var self = this;

    this.width = params.width;
    this.height = params.height;
    this.spritesheetId = null;
    this.spriteFrame = null;

    this.uuid = null;
    this.imageElement = ko.observable('<div></div>');

    if(ko.isObservable(params.spritesheetId)) {
        params.spritesheetId.subscribe(function(spritesheetId) {
            self.spritesheetId = spritesheetId;
            self.loadSpritesheet();
        });
        this.spritesheetId = params.spritesheetId();
    }
    else {
        this.spritesheetId = params.spritesheetId;
    }

    if(ko.isObservable(params.spriteFrame)) {
        params.spriteFrame.subscribe(function(spriteFrame) {
            self.spriteFrame = spriteFrame;
            self.loadSpritesheet();
        });
        this.spriteFrame = params.spriteFrame();
    }
    else {
        this.spriteFrame = params.spriteFrame;
    }

    this.loadSpritesheet();

};

SpriteComponent.prototype.loadSpritesheet = function() {
    var self = this;
    this.spritesheet = game.spritesheets.get(this.spritesheetId);
    if (this.spritesheet) {
        this.loadTempImage();
    }
    else {
        if (this.uuid) {
            // remove old callback before adding a new one:
            delete uc.onGameDataLoaded[self.uuid];
        }
        this.uuid = Math.random();
        uc.onGameDataLoaded[this.uuid] = function () {
            self.spritesheet = game.spritesheets.get(self.spritesheetId);
            self.loadTempImage();
            delete uc.onGameDataLoaded[self.uuid];
        };
    }
};

SpriteComponent.prototype.loadTempImage = function() {
    var self = this;

    if (this.spritesheetId && this.spriteFrame!==null) {
        this.spriteFrameIcon = this.spritesheet.frames[this.spriteFrame];
        this.tmpImg = uc.loadqueue.getResult("sheet" + this.spritesheetId + "image" + this.spriteFrameIcon[4]);
        if (this.tmpImg == null) {
            uc.onSpriteLoadedCallback[Math.random()] = function () {
                self.tmpImg = uc.loadqueue.getResult("sheet" + self.spritesheetId + "image" + self.spriteFrameIcon[4]);
                if (self.tmpImg == null) {
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
        'display: inline-block;'+
        '"></div>');

};