
var UiSlidingPanelRight = function(topPosition,zIndex,content){
    var self = this;

    this.isVisible = true;
    this.nextPanel = null;
    this.topPosition = topPosition;

    this.panelDiv = document.createElement('div');
    this.panelDiv.style.position="absolute";
    this.panelDiv.style.top = topPosition+"px";
    //... moved to end
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
    this.buttonDiv.style.left = "-30px";
    this.buttonDiv.style.bottom = "0px";
    this.buttonDiv.className = "toggleButton ui-corner-all";
    this.buttonDiv.onclick = function() {
        self.toggle();
    };

    this.panelDiv.appendChild(this.innerDiv);
    this.innerDiv.appendChild(this.buttonDiv);
    //$('#allUiPanels').append(this.panelDiv);
    $('body').append(this.panelDiv);

    this.panelDiv.style.right = this.innerDiv.offsetWidth+"px";
};

UiSlidingPanelRight.prototype.setPos = function(right,top,time) {
    var rect = this.innerDiv.getBoundingClientRect();
    if(right != rect.right || top != rect.top ) {
        $( this.panelDiv ).animate({
            right: right,
            top: top
        }, time, function() {
            // Animation complete.
        });
        if (this.nextPanel !== null) {
            this.nextPanel.topPosition = this.getTopPosOfNextPanel();
            this.nextPanel.update(time);
        }
    }
};

UiSlidingPanelRight.prototype.update = function(time) {
   if (this.isVisible) {
       this.show(time);
   }
   else {
       this.hide(time);
   }
};

UiSlidingPanelRight.prototype.show = function(time) {
    this.isVisible = true;
    this.setPos(this.innerDiv.offsetWidth,this.topPosition,time);
};

UiSlidingPanelRight.prototype.hide = function(time) {
    this.isVisible = false;
    this.setPos(0, this.topPosition-this.innerDiv.offsetHeight+30,time);
};

UiSlidingPanelRight.prototype.toggle = function() {
    if(this.isVisible) {
         this.hide(300);
    }
    else {
         this.show(300);
    }
};

UiSlidingPanelRight.prototype.addNextPanel = function(panel) {
    this.nextPanel = panel;
    this.nextPanel.topPosition = this.getTopPosOfNextPanel();
    this.nextPanel.update(0);
};

UiSlidingPanelRight.prototype.getTopPosOfNextPanel = function() {
    if(this.isVisible) {
        return this.innerDiv.offsetHeight + this.topPosition;
    }
    else {
        return this.topPosition + 30;
    }
};