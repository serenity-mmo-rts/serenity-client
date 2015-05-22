
var UiSlidingPanelDown = function(leftPosition,topPosition, zIndex,content){
    var self = this;

    this.isVisible = true;
    this.nextPanel = null;
    this.topPosition = topPosition;
    this.leftPosition = leftPosition;

    this.panelDiv = document.createElement('div');
    this.panelDiv.style.position="absolute";
    this.panelDiv.style.top = topPosition+"px";
    this.panelDiv.style.left = leftPosition+"px";
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
    this.buttonDiv.style.bottom = "0px";
    this.buttonDiv.className = "toggleButtonObjectMenu ui-corner-all";
    this.buttonDiv.onclick = function() {
        self.toggle();
    };

    this.panelDiv.appendChild(this.innerDiv);
    this.innerDiv.appendChild(this.buttonDiv);
    //$('#allUiPanels').append(this.panelDiv);
    $('body').append(this.panelDiv);

    //this.panelDiv.style.right = this.innerDiv.offsetWidth+"px";
};

UiSlidingPanelDown.prototype.setPos = function(left,top,time) {
    var rect = this.innerDiv.getBoundingClientRect();
    if(left != rect.left || top != rect.top ) {
        $( this.panelDiv ).animate({
            left: left,
            top: top
        }, time, function() {
            // Animation complete.
        });
     //   if (this.nextPanel !== null) {
     //       this.nextPanel.topPosition = this.getTopPosOfNextPanel();
     //       this.nextPanel.update(time);
     //   }
    }
};

UiSlidingPanelDown.prototype.update = function(time) {
    if (this.isVisible) {
        this.show(time);
    }
    else {
        this.hide(time);
    }
};

UiSlidingPanelDown.prototype.show = function(time) {
    this.isVisible = true;
   this.setPos(this.leftPosition,this.topPosition,time);
   // this.setPos(this.topPosition,this.leftPosition,time);
};

UiSlidingPanelDown.prototype.hide = function(time) {
    this.isVisible = false;
  //  this.setPos(0, this.topPosition+this.innerDiv.offsetHeight-30,time);
    this.setPos(this.leftPosition+this.innerDiv.offsetWidth,this.topPosition+this.innerDiv.offsetHeight-30,time);
};

UiSlidingPanelDown.prototype.remove = function() {
    this.panelDiv.remove();
};

UiSlidingPanelDown.prototype.toggle = function() {
    if(this.isVisible) {
        this.hide(300);
    }
    else {
        this.show(300);
    }
};

