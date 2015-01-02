var MapControl = function (map) {

    var self = this;
    this.map = map;
    this.map.mapControl = this;
    // this.minimap = minimap;
    this.stage = map.stage;
    this.main_container = map.main_container;

    /** possible states
     deleteObj
     initializeObj
     selectAttackTarget
     selectItemTarget
     Default
     */

    this.state = "default";
    this.hitObj = false;


    // event listener for main container
    this.main_container.addEventListener("mousedown", (function (evt) {
        self.handleMousedownMain(evt)
    }));

}


MapControl.prototype.handleMousedownMain = function (evt) {
    var self = this;
    this.hitObj = this.map.getCurrentObject();

    switch (this.state) {


        case "default":

            if (this.hitObj) {     // open Object Menu


            }

            else { // drag main container

                var startDragAt = this.main_container.globalToLocal(evt.stageX, evt.stageY);
                evt.addEventListener("mousemove", function (ev) {
                    var mouseAt = self.main_container.globalToLocal(ev.stageX, ev.stageY);
                    self.main_container.x += mouseAt.x - startDragAt.x;
                    self.main_container.y += mouseAt.y - startDragAt.y;
                });


                evt.addEventListener("mouseup", function (ev) {

//                    var minicoords =  self.minimap.render2game.maps.get(uc.layer.mapId).mapObjects.hashListMiniCoords(-self.main_container.x,-self.main_container.y);
                    //                  self.minimap.location.x = minicoords[0];
                    //                  self.minimap.location.y = minicoords[1];
                    self.map.checkRendering();
                    var mouseAt = self.main_container.globalToLocal(ev.stageX, ev.stageY);
                });
            }

            break;

        case "deleteObj":

            break;

        case "buildObj":
            if (this.map.tempGameEvent.isValid()) {
                uc.addEvent(this.map.tempGameEvent);
            }
            this.cancelState();


            break;

        case "relocateObj" :

            break;

        case "selectAttackTarget":

            break;

        case "selectItemTarget":

            break;
    }

}

MapControl.prototype.cancelState = function () {
    this.state = "default";
    this.map.deleteTempObj();
}


MapControl.prototype.setStateBuild = function (objTypeId) {

    this.cancelState();
    this.state = "buildObj";

    this.map.addTempObj(new MapObject(game, {_id: 'tempObject', mapId: this.map.mapId, x: 0, y: 0, objTypeId: objTypeId, userId: uc.userId, state: mapObjectStates.TEMP}));

    this.map.tempGameEvent = new BuildObjectEvent(game);
    this.map.tempGameEvent.setMapObject(this.map.tempObj);

}

MapControl.prototype.tick = function () {

}


/**
 MapControl.prototype.handleMousedownMain = function (evt) {
    var self = this;
    this.map.getCurrentObject();

    //var kchild = this.menu_container.getChildByName("submenu");
    //this.menu_container.removeChild(kchild);
    //this.stage.enableMouseOver([frequency = 0]);

    if (this.build) { // build object
        if (this.allowedToBuild) {
            this.build = false;
            this.moveCurrentObject();
            socket.emit('buildHouse', [this.mapId, this.currBuildingObj.save()]);
        }
    }

    else if (this.destroy) { // delete object
        if (this.hit_object) {
            // remove object and directly render it
            //this.obj_container.removeChild(this.current_object);
            this.stage.update();
        }
    }

    else if (this.move) { // move object
        if (this.hit_object && !this.visit) {
            this.moving = true;
            this.visit = true;
            // get offset
            offset = {
                x: evt.target.x - evt.stageX,
                y: evt.target.y - evt.stageY
            };

            // calculate global offset
            evt.addEventListener("mousemove", function (ev) {
                ev.target.x = ev.stageX + offset.x;
                ev.target.y = ev.stageY + offset.y;
                self.global_offsetX = ev.target.x;
                self.global_offsetY = ev.target.y;
            });

        }
        else if (this.hit_object && this.visit && this.allowedToBuild) {
            this.visit = false;
            this.moving = false;


        }
    }


    //  change Layer or drag main container
    else if (!this.build && !this.move) {

        if (this.hit_object) { // submenu on click onto object

            this.stage.enableMouseOver([frequency = 50]);

            var subicon = "resources/objects/bank1.png";
            var x = this.stage.mouseX;
            var y = this.stage.mouseY;
            var height = 40;
            var width = 160;

            var buttonMenu = new Menu();
            buttonMenu.addButton(x + (0 * width), y + (0 * height), subicon, 'Go into', [], (function () {
                self.client.changeLayer() ;
            }));
            buttonMenu.addButton(x + (0 * width), y + (1 * height), subicon, 'Something else', [], []);


            var buttonMenuContainer = new createjs.Container();
            dummy1 = dummy2 = dummy3 = new createjs.Container();

            buttonMenuContainer.addChild(dummy1, dummy2, dummy3, buttonMenu.menuItems[0],buttonMenu.menuItems[1]);
            buttonMenuContainer.name = "submenu";
            this.menu_container.addChild(buttonMenuContainer);
        }

        else { // drag main container
            //document.body.style.cursor='move';
            var startDragAt = this.main_container.globalToLocal(evt.stageX,evt.stageY);
            evt.addEventListener("mousemove", function (ev) {
                var mouseAt = self.main_container.globalToLocal(ev.stageX,ev.stageY);
                self.main_container.x += mouseAt.x - startDragAt.x;
                self.main_container.y += mouseAt.y - startDragAt.y;

            });


            evt.addEventListener("mouseup", function (ev) {
                //var minimapCenter = self.stage.globalToLocal(self.canvas_size[1]*(9/10),self.canvas_size[1]*(1/10)/2);
                var minicoords = self.minimap.render2MiniCoords(-self.main_container.x,-self.main_container.y);
                self.minimap.location.x = minicoords[0];
                self.minimap.location.y = minicoords[1];
                self.RenderObjects(self.main_container.x, self.main_container.y,self.gameData.maps.get(self.mapId).mapObjects.hashList,self.zoom);
                var mouseAt = self.main_container.globalToLocal(ev.stageX,ev.stageY);
                //self.main_container.regX= self.main_container.x+window.innerWidth/2;
                //self.main_container.regY= self.main_container.y+window.innerHeight/2;
            });


        }
    }
};

 **/
