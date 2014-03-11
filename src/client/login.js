$(function() {
    var name = $( "#name" ),
        password = $( "#password" ),
        allFields = $( [] ).add( name ).add( password );

    function updateTips( t ) {
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    $( "#login-form" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Login": function() {
                allFields.removeClass( "ui-state-error" );
                socket.emit('login',{name: name.val(), password: password.val()});
                $( this ).dialog( "close" );

            },
            Register: function() {
                $( "#register-form" ).dialog( "open" );
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

});