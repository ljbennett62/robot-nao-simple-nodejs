/*global $:false */ // Fixes "'$' is not defined." error caused by JSHint
var RobotNaoUtils = {};

RobotNaoUtils.App = function() {

    function updateSettingsDisplay() {

    }

    // Initialize the application
    var init = function() {
        displayConversations();
    }

    // Expose privileged methods
    return {
        init : init
    };
}(); // Don't delete the circle brackets...required!

RobotNaoUtils.App.init();
