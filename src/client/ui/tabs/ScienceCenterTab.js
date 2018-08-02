
var ScienceCenterTab = function (mapObj) {

    this.mapObj = mapObj;
    this.content= $('<div id="mainTab"></div>').css({'display': 'inline-block'});
    if (this.mapObj.blocks.hasOwnProperty("TechProduction")){
        this.listProduceableTechnologies();
    }

};


ScienceCenterTab.prototype.listProduceableTechnologies = function () {

    var wrap1 = $('<div></div>').css({'display': 'inline-block','padding-right':'20px'});
    this.creationTitle =  $('<div>Technologies</div>').css({});
    this.creationBox =  $('<div></div>').css({'display': 'inline-block','border':'1px solid blue','width':160, 'height':130, 'position': 'relative','white-space':'pre-line'});
    var allowedTechnologies = this.mapObj.blocks.TechProduction.type.producableTechnologies;

    for (var i = 0; i<allowedTechnologies.length; i++){
        var techId = allowedTechnologies[i];
        var techType =  game.technologyTypes.get(techId);
        var spritesheet = game.spritesheets.get(techType.iconSpritesheetId);
        var spriteFrameIcon = spritesheet.frames[techType.iconSpriteFrame];
        var x = spriteFrameIcon[0];
        var y = spriteFrameIcon[1];
        var breite = spriteFrameIcon[2];
        var hoehe = spriteFrameIcon[3];
        var img = spritesheet.images[spriteFrameIcon[4]];
        var gap = 8;

        var container= $('<div style="white-space:nowrap" ></div>').css({'width':breite, 'height':hoehe, 'position': 'relative','display': 'inline-block','padding-right':gap+'px'});
        var image = $('<div style="white-space:nowrap" ></div>');
        image.css({'background-image': 'url('+img+')' ,'background-position-x':-x, 'background-position-y':-y,'background-repeat':'no-repeat','width':breite,'height':hoehe});
        image.appendTo(container);

        this.initResearch(container,techId);
        container.css('cursor', 'pointer');
        container.appendTo(this.creationBox);

    }
    this.creationTitle.appendTo(wrap1);
    this.creationBox.appendTo(wrap1);
    wrap1.appendTo(this.content);

};


ScienceCenterTab.prototype.initResearch = function (container,techTypeId) {
    var self = this;
    container.click(function (e) {
        var evt = new ResearchEvent(this.mapObj.getMap().eventScheduler.events);
        evt.setParameters(techTypeId,self.mapObj);
        uc.addEvent(evt);
    });
};

