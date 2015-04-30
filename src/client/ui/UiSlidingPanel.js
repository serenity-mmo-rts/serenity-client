
var UiSlidingPanel = function(topPosition,zIndex,content){
    var self = this;

    this.isVisible = true;
    this.nextPanel = null;
    this.topPosition = topPosition;

    this.panelDiv = document.createElement('div');
    this.panelDiv.style.position="absolute";
    this.panelDiv.style.top = topPosition+"px";
    this.panelDiv.style.left = "0px";
    this.panelDiv.style.width = "auto";
    this.panelDiv.style.zIndex = zIndex;

    this.innerDiv = document.createElement('div');
    this.innerDiv.style.position="absolute";
    this.innerDiv.className="ui-widget-content ui-corner-all visible";
    //this.innerDiv.style.minWidth="100px";
    this.innerDiv.style.minHeight="30px";
    //var content = $.parseHTML( content );
    $( this.innerDiv ).append( $( content ) );

    this.buttonDiv = document.createElement('div');
    this.buttonDiv.style.position = "absolute";
    this.buttonDiv.style.right = "-30px";
    this.buttonDiv.style.bottom = "0px";
    this.buttonDiv.className = "toggleButton ui-corner-all";
    this.buttonDiv.onclick = function() {
        self.toggle();
    };

    this.panelDiv.appendChild(this.innerDiv);
    this.innerDiv.appendChild(this.buttonDiv);
    //$('#allUiPanels').append(this.panelDiv);
    $('body').append(this.panelDiv);

};

UiSlidingPanel.prototype.setPos = function(left,top) {
    var rect = this.innerDiv.getBoundingClientRect();
    if(left != rect.left || top != rect.top ) {
        $( this.panelDiv ).animate({
            left: left,
            top: top
        }, 300, function() {
            // Animation complete.
        });
        if (this.nextPanel !== null) {
            this.nextPanel.topPosition = this.getTopPosOfNextPanel();
            this.nextPanel.update();
        }
    }
};

UiSlidingPanel.prototype.update = function() {
   if (this.isVisible) {
       this.show();
   }
   else {
       this.hide();
   }
};

UiSlidingPanel.prototype.show = function() {
    this.isVisible = true;
    this.setPos(0,this.topPosition);

};

UiSlidingPanel.prototype.hide = function() {
    this.isVisible = false;
        this.setPos(-this.innerDiv.offsetWidth, this.topPosition-this.innerDiv.offsetHeight+30);

};

UiSlidingPanel.prototype.remove = function() {
    this.panelDiv.remove();
};

UiSlidingPanel.prototype.toggle = function() {
    if(this.isVisible) {
         this.hide();
    }
    else {
         this.show();
    }
};

UiSlidingPanel.prototype.addNextPanel = function(panel) {
    this.nextPanel = panel;
    this.nextPanel.topPosition = this.getTopPosOfNextPanel();
    this.nextPanel.update();
};

UiSlidingPanel.prototype.getTopPosOfNextPanel = function() {
    if(this.isVisible) {
        return this.innerDiv.offsetHeight + this.topPosition;
    }
    else {
        return this.topPosition + 30;
    }
};