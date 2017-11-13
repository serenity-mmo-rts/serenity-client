
var testComponent = function () {
    this.personName = ko.observable('Bob');
    this.personAge = ko.observable(123);
    this.fps = ko.observable(0);
    this.mouseCoordX = ko.observable(0);
    this.mouseCoordY = ko.observable(0);
    this.debugText = ko.observable('none');
};

testComponent.prototype.setFPS = function(fps) {
    this.fps(fps.toString());
};

testComponent.prototype.setMouseCoord = function(mouseCoord) {
    this.mouseCoordX(Math.round(mouseCoord.x).toString());
    this.mouseCoordY(Math.round(mouseCoord.y).toString());
};

testComponent.prototype.setDebugText = function(debugText) {
    this.debugText(debugText);
};
