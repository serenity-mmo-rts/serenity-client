var UiBgMap = function (resourceMapWrapper) {
    var self = this;

    this.content = $('<div>').addClass("ui-widget");
    this.label = $('<label>Background</label>').appendTo(this.content);
    this.s = $('<select />').addClass("ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.content);

    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.s);

};


UiBgMap.prototype.setResMap = function(ressourceMapWrapper) {

    var self = this;

    this.resourceMap = ressourceMapWrapper;
    this.resTypes = ressourceMapWrapper.mapData.mapProperties.resTypes;

    this.s.empty();
    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.s);
    for (var i in this.resTypes) {
        $('<option />', {value: this.resTypes[i]._id, text: this.resTypes[i].name}).appendTo(this.s);
    }

    $(this.s).change(function () {
        if ($(this).val() == 'off') {
            self.resourceMap.removeOverlay();
        }
        else {
            self.resourceMap.addOverlay($(this).val());
        }
    });

};