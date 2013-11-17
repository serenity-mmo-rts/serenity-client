var MapData = function(layerid,width,height,mapTypeId) {
    this.width = width;
    this.height = height;
    this.layerid = layerid;
    this.mapTypeId = 0;
    this.quadTree = new QuadTree({x:0, y:0, width:width, height:height},false);
    this.objects = [];

    this.collisionDetecttion = function (object) {
        return this.width*this.height;
    }
}