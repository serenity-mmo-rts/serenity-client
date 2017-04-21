require.config({
    paths: {
        "knockout": "lib/knockout-3.3.0.debug"
    }
});
require(["knockout"], function (ko) {
    $("#document").ready(function () {

       // ko.components.register('BuildMenu', { require: 'ui/BuildMenu' });

        require(['knockout', 'ui/BuildMenu'], function(ko, BuildMenu) {
            ko.applyBindings(new BuildMenu());
        });


        ko.components.register('BuildMenu', {
            viewModel: { require: 'ui/BuildMenu' },
            template: { require: 'text!BuildMenu.html' }
        });


    });
});
