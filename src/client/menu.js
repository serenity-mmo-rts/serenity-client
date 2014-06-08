    // J-Query Menu
    $(function() {
        $( "#accordion" ).accordion({
            heightStyle: "fill"
        });
    });



    $('<div>')
        .addClass( "ui-widget-content" )
        .attr('id','buildMenu')
        .append(
            $('<div>')
                .attr('id','accordion')
                .append(
                    $('<h3>')
                        .append(
                            $('<div>')
                                .append(
                                    $('<p>')

                                )

                        )

                )

        )
        .end()
        .appendTo( "body" );