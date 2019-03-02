var UIContainer = function(barPos){

    this.barPos = barPos;
    this.panels = [];


    this.panelDiv = document.createElement('div');
    this.panelDiv.style.position="absolute";
    this.panelDiv.style.width = "auto";
    if (this.barPos == "bottomleft") {
        this.panelDiv.style.bottom = "0px";
        this.panelDiv.style.left = "0px";
    }
    else {
        this.panelDiv.style.top = "0px";
        this.panelDiv.style.left = "0px";
    }

    $('#uiPanels').append(this.panelDiv);
};

/**
 * add an HTML Element as a new panel to the UI
 * @param content is the html element to add.
 * @param params is an object {visible: true, barPos: 'topleft', posInBar: 0}
 */
UIContainer.prototype.addContentPanel = function(classInstance, content, params) {

    // params = {visible: true, barPos: 'topleft', posInBar: 0};

    this.classInstance = classInstance;

    // create the panel to hold the content:
    var zIndex = this.panels.length - params.posInBar;
    var panel = new UiSlidingPanel(0,zIndex,content,params.barPos);

    this.panelDiv.append(panel.panelDiv);

    if (params.visible) {
        panel.show(0);
    }
    else {
        panel.hide(0);
    }
    this.panels.splice(params.posInBar, 0, panel);

    this.classInstance.afterRenderCb = function() {
        //console.log("classInstance.afterRenderCb.... panel.update()");
        panel.update();
    };

    // link the newly inserted panel to the previous panel in the bar:
    if(params.posInBar>0) {
        this.panels[params.posInBar - 1].addNextPanel(this.panels[params.posInBar]);
    }

    // link the newly inserted panel to the next panel in the bar:
    if(params.posInBar < this.panels.length-1) {
        this.panels[params.posInBar].addNextPanel(this.panels[params.posInBar + 1]);
    }

    // update zIndices of panels with lower position value:
    for (var i=0; i<params.posInBar; i++) {
        this.panels[i].panelDiv.style.zIndex = this.panels.length - i;
    }

};