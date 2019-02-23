
var testComponent = function () {
    this.personName = ko.observable('Bob');
    this.personAge = ko.observable(123);
    this.fps = ko.observable(0);
    this.mouseCoordX = ko.observable(0);
    this.mouseCoordY = ko.observable(0);
    this.debugText = ko.observable('none');
    this.afterRenderCb = null;
};

testComponent.prototype.setFPS = function(fps) {
    this.fps(fps.toString());
};

testComponent.prototype.afterRender = function (param1, param2, param3) {
    if (this.afterRenderCb) {
        this.afterRenderCb();
    }
};

testComponent.prototype.setMouseCoord = function(mouseCoord) {
    this.mouseCoordX(Math.round(mouseCoord.x).toString());
    this.mouseCoordY(Math.round(mouseCoord.y).toString());
};

testComponent.prototype.setDebugText = function(debugText) {
    this.debugText(debugText);
};
