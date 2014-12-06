var ProgressBar = function(){
    var self = this;

    this.progressbar = $('<div/>', { id: 'progressbar'}).appendTo($("body"));
    $(this.progressbar).css('position','absolute');
    $(this.progressbar).css('top','10%');
    $(this.progressbar).css('left','25%');
    $(this.progressbar).css('width','50%');
    $(this.progressbar).css('z-index','5');

    this.progressLabel = $('<div/>', { class: 'progress-label'}).text("Loading...").appendTo($(this.progressbar));

    this.content = this.progressbar;

    this.progressbar.progressbar({
        value: false,
        change: function() {
            self.progressLabel.text( self.progressbar.progressbar( "value" ) + "%" );
        },
        complete: function() {
            self.progressLabel.text( "Complete!" );
        }
    });

}

ProgressBar.prototype.progress = function(percent) {
    this.progressbar.progressbar( "value", percent );
}

ProgressBar.prototype.destroy = function() {
    $( this.progressbar ).remove();
}
