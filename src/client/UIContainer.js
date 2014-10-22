var UIContainer = function(){


    this.buildMenu = new BuildMenu((function (objectTypeId) {
        self.initializeObject(objectTypeId)
    }), (function () {
        self.deleteObject()
    }), (function () {
        self.moveObject()
    }), this.canvas_size, this.gameData, this.mapId);


    self.timeoffset = ntp.offset(); // time offset from the server in ms
    $("#clientDebug").html(
        "timeoffset="+self.timeoffset +
            "<br>userId=" + self.userId
    );

}


