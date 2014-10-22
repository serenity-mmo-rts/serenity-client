var formerLayer = function (client, stage,gameData, mapId) {




    // resize to full window


    //this.canvas_size = [window.innerHeight, window.innerWidth];



    // Zooming


    this.move_count = 1;
    this.del_count = 1;


    // Objects
    this.current_object;

    //BOOLEANS
    this.build = false;
    this.allowedToBuild = true;         // collision detection need to be included
    this.hit_object = false;
    this.destroy = false;
    this.move = false;
    this.moving = false;
    this.destroyed = false;
    this.truthArr = [false, true];
    this.visit = false;





    //this.headMenu = new HeaderMenu(this.menu_container, this.canvas_size);









};


// main Event Listener for map interaction





// delete Object
Layer.prototype.deleteObject = function () {

    this.build = false;
    this.move = false;
    this.move_count = 1;

    // delete ON or OFF
    this.destroy = this.truthArr[this.del_count];
    this.del_count += 1;
    if (this.del_count > 1) {
        this.del_count = 0;
    }
};


// moving Object
Layer.prototype.moveObject = function () {

    this.build = false;
    this.destroy = false;
    this.del_count = 1;

    // move ON or OFF
    this.move = this.truthArr[this.move_count];
    this.move_count += 1;
    if (this.move_count > 1) {
        this.move_count = 0;

    }
};














