var MapData = function(layerid,width,height,mapTypeId) {
    this.width = width;
    this.height = height;
    this.layerid = layerid;
    this.mapTypeId = 0;
    this.quadTree = new QuadTree({x:0, y:0, width:width, height:height},false);
    this.objects = [];

    this.collisionDetecttion = function (object) {
        object.width
        var items = quad.retrieve({x:11, y:20, height:10, width:20});
        return items;
    }
}