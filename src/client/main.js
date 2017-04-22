
require.config({
    paths: {

        "text": "lib/knockout-3.3.0.debug",
        "BuildMenu": "ui/BuildMenu"
    }
});

require(["text"], function (ko) {
    $("#document").ready(function () {
           ko.components.register('build-menu', {
            viewModel: BuildMenu, //{ require: 'ui/BuildMenu' },
            template: { require: 'text!BuildMenu.html' }
        });


    });
});

/**
 <script type="text/javascript" src="lib/knockout-3.3.0.debug.js"></script>
 <script type="text/javascript" src="ui/BuildMenu.js"></script>


**/