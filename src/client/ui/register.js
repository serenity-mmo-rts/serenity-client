
    var Register = function(socket) {
        var self = this;

        this.name = $( "#register_name" );
        this.email = $( "#register_email" );
        this.password = $( "#register_password" );
        this.allFields = $( [] ).add( this.name ).add(this.email).add( this.password );
        //this.allFields = $( [] ).add( this.name ).add( this.email ).add( this.password );
        this.tips = $( ".register_validateTips" );
        this.socket = socket;

        this.socket.on('registerFeedback', (function(data){
            if(data.success == true) {
                $("<div>You are now registered! Enjoy the game!</div>").dialog();
                $( "#register-form" ).dialog( "close" );
            }
            else{
                self.updateTips( data.errormessage);
            }
        }));

        $( "#register-form" ).dialog({
            autoOpen: false,
            height: 350,
            width: 350,
            modal: true,
            buttons: {
                "Create an account": function() {
                    var bValid = true;
                    self.allFields.removeClass( "ui-state-error" );

                    bValid = bValid && self.checkLength( self.name, "username", 3, 16 );
                    bValid = bValid && self.checkLength( self.email, "email", 6, 80 );
                    bValid = bValid && self.checkLength( self.password, "password", 5, 16 );

                    bValid = bValid && self.checkRegexp( self.name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
                    // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                    bValid = bValid && self.checkRegexp( self.email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
                    bValid = bValid && self.checkRegexp( self.password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );

                    if ( bValid ) {
                        self.socket.emit('register',{name: self.name.val(), email: self.email.val(), password: self.password.val()});
                    }
                },
                Cancel: function() {
                    self.close();
                }
            },
            close: function() {
                self.allFields.val( "" ).removeClass( "ui-state-error" );
            }
        });

    }

    Register.prototype.updateTips = function( t ) {
        var self = this;
        this.tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            self.tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    Register.prototype.checkLength = function( o, n, min, max ) {
        if ( o.val().length > max || o.val().length < min ) {
            o.addClass( "ui-state-error" );
            this.updateTips( "Length of " + n + " must be between " +
                min + " and " + max + "." );
            return false;
        } else {
            return true;
        }
    }

    Register.prototype.checkRegexp = function( o, regexp, n ) {
        if ( !( regexp.test( o.val() ) ) ) {
            o.addClass( "ui-state-error" );
            this.updateTips( n );
            return false;
        } else {
            return true;
        }
    }

    Register.prototype.show = function() {
        $( "#register-form" ).dialog( "open" );
    };
    Register.prototype.close = function() {
        $( "#register-form" ).dialog( "close" );
    };