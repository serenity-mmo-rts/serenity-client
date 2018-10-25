
    var Login = function(socket) {
        var self = this;
        this.name = $( "#name" );
        this.password = $( "#password" );
        this.tips = $( ".validateTips" );
        this.allFields = $( [] ).add( this.name ).add( this.password );
        this.socket = socket;
        this.registerForm;

        this.socket.on('loginError', (function(data){

                self.updateTips( data.msg);
        }));

        $( "#login-form" ).dialog({
            autoOpen: false,
            height: 300,
            width: 350,
            modal: true,
            buttons: {
                "Login": function() {
                    self.allFields.removeClass( "ui-state-error" );
                    self.socket.emit('login',{name: self.name.val(), password: self.password.val()});
                },
                Register: function() {
                    self.registerForm = new Register(self.socket);
                    $( "#register-form" ).dialog( "open" );
                    self.close();
                },
                Cancel: function() {
                    self.close();
                }
            },
            close: function() {
                self.allFields.val( "" ).removeClass( "ui-state-error" );
            }
        });


    };

    Login.prototype.updateTips = function( t ) {
        var self = this;
        this.tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            self.tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    };

    Login.prototype.show = function() {
        $( "#login-form" ).dialog( "open" );
    };
    Login.prototype.close = function() {
        $( "#login-form" ).dialog( "close" );
    };
