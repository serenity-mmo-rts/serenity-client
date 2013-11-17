var ObjectType = function(typeid,width,height) {
    this.typeid = typeid;
    this.width = width;
    this.height= height;
    this.hasChildMapLayer = 0;

    this.getArea = function () {
        return this.width*this.height;
    }
}