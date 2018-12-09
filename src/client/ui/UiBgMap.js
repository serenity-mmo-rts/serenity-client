var UiBgMap = function (layerView) {
    var self = this;

    this.layerView = layerView;

    this.content = $('<div>').addClass("ui-widget");

    this.labelMapBgType = $('<label>Render Map Background</label>').appendTo(this.content);
    this.selectMapBgType = $('<select />').addClass("ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.labelMapBgType);
    $('<option />', {value: 'linearMappingOfHeight', text: 'linear mapping of height'}).appendTo(this.selectMapBgType);
    $('<option />', {value: 'vegetationByHeightRanges', text: 'vegetation by height ranges'}).appendTo(this.selectMapBgType);
    $(this.selectMapBgType).change(function() {
        self.layerView.rgbMapName(self.selectMapBgType.val());
    });

    this.label = $('<label>Height Range</label>').appendTo(this.content);
    this.selectHeightRange = $('<select />').addClass("ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.label);
    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.selectHeightRange);

    this.labelMappingType = $('<label>Mapping type:</label>').appendTo(this.content);
    this.selectMappingType = $('<select />').addClass("ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.labelMappingType);
    $('<option />', {value: 'rgb', text: 'rgb'}).appendTo(this.selectMappingType);

    $("<span>humidity is horizontal axis from left to right</span>").appendTo(this.content);
    $("<br><span>temp is vertical axis from top to bottom</span>").appendTo(this.content);

    this.debugMappingDiv = document.createElement('div');
    this.debugMappingDiv.style.width = "512px";
    this.debugMappingDiv.style.height = "512px";
    $(this.debugMappingDiv).appendTo(this.content);

};


UiBgMap.prototype.setResMap = function(ressourceMapWrapper) {

    var self = this;

    this.resourceMap = ressourceMapWrapper;
    this.resTypes = ressourceMapWrapper.mapData.mapProperties.resTypes;
    var planetMapping = ressourceMapWrapper.mapData.mapGenerator.planetMapping;

    this.selectHeightRange.empty();
    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.selectHeightRange);
    for (var height_range_name in planetMapping.mappings) {
        $('<option />', {value: height_range_name, text: height_range_name}).appendTo(this.selectHeightRange);
    }

    this.selectMappingType.empty();
    $('<option />', {value: 'rgb', text: 'rgb'}).appendTo(this.selectMappingType);
    for (var k=0; k<planetMapping.mapNames.length; k++) {
        $('<option />', {value: planetMapping.mapNames[k], text: planetMapping.mapNames[k]}).appendTo(this.selectMappingType);
    }

    function updateMapping() {
        var height_range_name = self.selectHeightRange.val();
        var mappingType = self.selectMappingType.val();
        if (height_range_name == 'off') {
            $(self.debugMappingDiv).empty();
        }
        else {
            if (planetMapping) {
                var canvas = planetMapping.getBitmap(height_range_name, mappingType);
                $(self.debugMappingDiv).html($(canvas))
            }
        }
    }

    $(this.selectHeightRange).change(updateMapping);
    $(this.selectMappingType).change(updateMapping);





};