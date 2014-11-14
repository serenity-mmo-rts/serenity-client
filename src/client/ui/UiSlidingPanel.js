
var UiSlidingPanel = function(){
    var self = this;

    this.isVisible = true;

    this.panelDiv = document.createElement('div');
    this.innerDiv = document.createElement('div');
    this.content = document.createTextNode("<p>Test TestTest TestTest TestTest TestTest Test</p>");
    this.buttonDiv = document.createElement('div');


    this.panelDiv.style.position="relative";
    this.panelDiv.style.top = "200px";
    this.panelDiv.style.left = "200px";
    this.innerDiv.style.position="relative";
    this.buttonDiv.className = "toggleButton";

    this.panelDiv.appendChild(this.innerDiv);
    this.innerDiv.appendChild(this.content);
    this.innerDiv.appendChild(this.buttonDiv);
    $('#allUiPanels').append(this.panelDiv);

};


UiSlidingPanel.prototype.update = function() {
    if(this.isVisible) {
        $( this.panelDiv ).animate({
            left: "+=50"
        }, 5000, function() {
            // Animation complete.
        });
    }

}

UiSlidingPanel.prototype.show = function() {
    this.isVisible = true;
    this.update();
};

UiSlidingPanel.prototype.hide = function() {
    this.isVisible = false;
    this.update();
};