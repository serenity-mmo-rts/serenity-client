var UiBgMap = function (resourceMapWrapper) {
    var self = this;

    this.resourceMap = resourceMapWrapper;
    this.resTypes = resourceMapWrapper.mapData.mapGenerator.resTypes;

    this.content = $('<div>').addClass("ui-widget");
    this.label = $('<label>Background</label>').appendTo(this.content);
    this.s = $('<select />').addClass("ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.content);

    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.s);
    for (var i in this.resTypes) {
        $('<option />', {value: this.resTypes[i].id, text: this.resTypes[i].name}).appendTo(this.s);
    }

    // set standard value:
    //$(this.s).val(14);

    $(this.s).change(function () {
        if ($(this).val() == 'off') {
            self.resourceMap.removeOverlay();
        }
        else {
            self.resourceMap.addOverlay($(this).val());
        }
    });
}