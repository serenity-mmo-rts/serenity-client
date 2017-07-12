var BuildMenu = function () {
    var self = this;

    this.mapId = ko.observable(0);
    this.mapControl = null;
    this.buildMenuData = ko.observableArray([]);
    this.mapTypeId = ko.computed(function () {
        if (this.mapId()) {
            return game.layers.hashList[this.mapId()].mapTypeId;
        }
        else {
            return 0;
        }
    }, this);


    this.mapTypeId.subscribe(function (mapTypeId) {
        if (mapTypeId) {
            var _buildCategories = game.layerTypes.hashList[mapTypeId]._buildCategories;
            var objectTypes = [];

            var numCat = _buildCategories.length;
            for (var i = 0; i < numCat; i++) {
                var objectTypesOfThisCategory = [];
                // $("#ui-accordion-accordion-header-"+i+"").text(BuildMenuData[i].name);

                var numTypes = _buildCategories[i].objectTypeIds.length;
                for (var k = 0; k < numTypes; k++) {
                    var objectTypeId = _buildCategories[i].objectTypeIds[k];
                    var objectType = game.objectTypes.hashList[objectTypeId];
                    var objectEntry = {
                        tooltip: 'buildTime: '+objectType._buildTime,
                        buildMenuItemId: k,
                        objectTypeId: objectTypeId,
                        name: objectType._name,
                        _iconSpritesheetId: objectType._iconSpritesheetId,
                        _iconSpriteFrame: objectType._iconSpriteFrame,
                        clickHandler: function(data, event) {
                            self.initializeObject(data.objectTypeId);
                        }
                    };
                    objectTypesOfThisCategory.push(objectEntry);

                    /**   var spritesheet = game.spritesheets.hashList[objectType._iconSpritesheetId];
                     var spriteFrameIcon = spritesheet.frames[objectType._iconSpriteFrame];
                     var imgSrc = spritesheet.images[spriteFrameIcon[4]];
                     var objectname = objectType._name;

                     var buildMenuItemId = 'cat' + i + 'obj' + k;
                     $("#ui-accordion-accordion-panel-"+i+"").append('<li class="buildMenuItem"><a href="#" id="'+buildMenuItemId+'" name="'+objectTypeId+'" title="buildTime: '+objectType._buildTime+'"></a></li>');
                     $("#"+buildMenuItemId).append('<p class="buildMenuText">'+objectType._name+'</p>');

                     var sprite = new SpriteImg(objectType._iconSpritesheetId, objectType._iconSpriteFrame, 32, 32);
                     $("#"+buildMenuItemId).append(sprite.content);
                     $("#"+buildMenuItemId).click(function()  {
                        self.initializeObject(self.name);
                    });
                     **/
                }

                objectTypes.push({ name: _buildCategories[i].name, objectTypes: ko.observableArray(objectTypesOfThisCategory)});



            }

            // now update the member variable:
            self.buildMenuData(objectTypes);
            $("#buildMenu" ).accordion();
            $("#buildMenu").accordion({
                heightStyle: "fill"
            });
            $("#buildMenu").accordion( "refresh" );

        }
    });

};

BuildMenu.prototype.initializeObject = function (objectTypeId) {  // ObjectID missing

    $("#bottomLeftUi").toggleClass("hidden", 500, "easeOutSine");

    var object = new MapObject(game, {
        _id: 'tempObject',
        mapId: this.mapId(),
        x: 0,
        y: 0,
        objTypeId: objectTypeId,
        userId: uc.userId,
        state: mapObjectStates.TEMP
    });
    this.tmpEvent = new BuildObjectEvent(game);
    this.tmpEvent.setParameters(object);
    this.mapControl.map.addTempObj(object);
    var self = this;

    function callbackOnSelect(gameCoord) {
        self.mapControl.map.deleteTempObj();
        uc.addEvent(self.tmpEvent);
        self.tmpEvent = null;
    }

    function callbackCheckValidSelection(gameCoord) {
        object.x(gameCoord.x);
        object.y(gameCoord.y);
        self.mapControl.map.renderObj(object);
        self.tmpEvent.setCoordinates(gameCoord);
        var valid = self.tmpEvent.isValid();
        if (valid) {
            object.objectBitmap.alpha = 1;
        }
        else {
            object.objectBitmap.alpha = 0.3;
        }
        return valid;
    }

    function callbackCanceled() {
        self.tmpEvent = null;
        self.mapControl.map.deleteTempObj();
    }

    this.mapControl.setStateSelectCoord(callbackOnSelect, callbackCheckValidSelection, callbackCanceled);
};

// Return component definition
//return { viewModel: BuildMenu, template: htmlString };

//ko.applyBindings();


/**
 $("#accordion").html('');
 for (var i = 0; i< this.nrOfCategories; i++) {
        $("#accordion").append('<h3>Building Category</h3><ol class="build-menu-list"></ol>');
    }

 // initialize correct one
 $( "#accordion" ).accordion({
        heightStyle: "fill"
    });
 //$("#buildMenu").hide();

 $( "#accordion" ).accordion( "refresh" );




 ko.bindingHandlers.accordion = {
    init: function(element, valueAccessor) {
        var options = valueAccessor() || {};
        setTimeout(function() {
            $(element).accordion(options);
        }, 0);

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function(){
            $(element).accordion("destroy");
        });
    },
    update: function(element, valueAccessor) {
        var options = valueAccessor() || {};
        $(element).accordion("destroy").accordion(options);
    }
}
 **/


