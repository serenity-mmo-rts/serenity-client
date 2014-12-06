var UiRessourceMap = function(mapRenderer,resTypes){
    var self = this;

    this.mapRenderer = mapRenderer;

    //var resTypes = [
    //    {id: 'off', name: 'Off'},
    //    {id: '0', name: 'Iron'},
    //    {id: '1', name: 'Stone'}
    //    ];

    this.content = $('<div>').addClass("ui-widget");
    this.label = $('<label>Ressources</label>').appendTo(this.content);
    this.s = $('<select />').addClass( "ui-widget ui-widget-content ui-state-default ui-corner-all").appendTo(this.content);

    $('<option />', {value: 'off', text: 'Off'}).appendTo(this.s);
    for(var i in resTypes) {
        $('<option />', {value: resTypes[i].id, text: resTypes[i].name}).appendTo(this.s);
    }

    this.clicknum = 0;
    $(this.s).click(function(){
        self.clicknum++;
        if(self.clicknum == 2){
            if ($(this).val()=='off') {
                self.mapRenderer.removeRessourceOverlay();
            }
            else {
                self.mapRenderer.addRessourceOverlay($(this).val());
            }
            self.clicknum = 0;
        }
    });
}