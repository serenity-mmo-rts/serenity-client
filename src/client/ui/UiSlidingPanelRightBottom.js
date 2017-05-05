
var UiSlidingPanelRightBottom = function(offsetPosition,zIndex,content){
    var self = this;

    this.isVisible = true;
    this.nextPanel = null;
    this.offsetPosition = offsetPosition;

    this.panelDiv = document.createElement('div');
    this.panelDiv.style.position="absolute";
    this.panelDiv.style.bottom = offsetPosition+"px";
    //... moved to end
    this.panelDiv.style.width = "auto";
    this.panelDiv.style.zIndex = zIndex;
    //this.panelDiv.style.overflow = "hidden";

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
    this.buttonDiv.style.top = "0px";
    this.buttonDiv.className = "toggleButton ui-corner-all";
    this.buttonDiv.onclick = function() {
        self.toggle();
    };

    this.panelDiv.appendChild(this.innerDiv);
    this.innerDiv.appendChild(this.buttonDiv);
    //$('#allUiPanels').append(this.panelDiv);
    $('#uiPanels').append(this.panelDiv);

    this.panelDiv.style.right = this.innerDiv.offsetWidth+"px";
};

UiSlidingPanelRightBottom.prototype.setPos = function(right,offsetPosition,time) {
    var rect = this.innerDiv.getBoundingClientRect();
    if(right != rect.right || offsetPosition != rect.bottom ) {
        $( this.panelDiv ).animate({
            right: right,
            bottom: offsetPosition
        }, time, function() {
            // Animation complete.
        });
        if (this.nextPanel !== null) {
            this.nextPanel.offsetPosition = this.getOffsetPosOfNextPanel();
            this.nextPanel.update(time);
        }
    }
};

UiSlidingPanelRightBottom.prototype.update = function(time) {
   if (this.isVisible) {
       this.show(time);
   }
   else {
       this.hide(time);
   }
};

UiSlidingPanelRightBottom.prototype.show = function(time) {
    this.isVisible = true;
    this.setPos(this.innerDiv.offsetWidth,this.offsetPosition+this.innerDiv.offsetHeight,time);
};

UiSlidingPanelRightBottom.prototype.hide = function(time) {
    this.isVisible = false;
    this.setPos(0, this.offsetPosition+this.innerDiv.offsetHeight-this.innerDiv.offsetHeight+30,time);
};

UiSlidingPanelRightBottom.prototype.remove = function() {
    this.panelDiv.remove();
};

UiSlidingPanelRightBottom.prototype.toggle = function() {
    if(this.isVisible) {
         this.hide(300);
    }
    else {
         this.show(300);
    }
};

UiSlidingPanelRightBottom.prototype.addNextPanel = function(panel) {
    this.nextPanel = panel;
    this.nextPanel.offsetPosition = this.getOffsetPosOfNextPanel();
    this.nextPanel.update(0);
};

UiSlidingPanelRightBottom.prototype.getOffsetPosOfNextPanel = function() {
    if(this.isVisible) {
        return this.innerDiv.offsetHeight + this.offsetPosition;
    }
    else {
        return this.offsetPosition + 30;
    }
};