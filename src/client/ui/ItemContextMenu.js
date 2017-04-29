// button test


var ItemContextMenu =  function buttonMenu() {

    $(function() {
        $( "#menu" ).menu();
    });


    //default values
    /**
    this.height  = 40;
    this.width   = 160;
    this.font   = "bold 12px Arial";
    this.text_color  = "#000";
    this.color = "#cccccc";
    this.style  = "rect";
    this.radius  = 10;
    this.menuItems = [];
     **/
    $('#menu #activateItem')
        .css({cursor: "pointer"})
        .on('click', function(){
            $(this).find('ul').toggle();
            // fire event
        })
    $('#menu #upgradeItem')
        .css({cursor: "pointer"})
        .on('click', function(){
            $(this).find('ul').toggle();
            // fire event
        })
    $('#menu #moveItem #moveItemToAttack')
        .css({cursor: "pointer"})
        .on('click', function(){
            $(this).find('ul').toggle();
            // fire event
        })
    $('#menu #moveItem #moveItemToDefense')
        .css({cursor: "pointer"})
        .on('click', function(){
            $(this).find('ul').toggle();
            // fire event
        })
    $('#menu #moveItem #moveItemToTarget')
        .css({cursor: "pointer"})
        .on('click', function(){
            $(this).find('ul').toggle();
            // fire event
        })

};









