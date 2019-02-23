
/**
 * Dynamically create a custom knockout component
 * @param koViewModel
 * @param compRegName
 * @returns {*|jQuery}
 */
createKnockoutPanel = function (koViewModel, compRegName, viewPath) {

    if(ko.components.isRegistered(compRegName)){
        ko.components.unregister(compRegName);
        //console.log("warning: knockout component was already registered... TODO: maybe directly unregister after use?...")
    }
    // register a new knockout component:
    ko.components.register(compRegName, {
        viewModel: { instance: koViewModel },
        template: { require: 'text!'+viewPath },
    });
    var contentDiv = $('<div data-bind="component: \''+compRegName+'\'"></div>').addClass("ui-widget");
    ko.applyBindings(koViewModel, contentDiv[0]);
    return contentDiv;
}