var app = app || {};

//google.load('visualization', '1.0', { 'packages': ['corechart'] });

//google.setOnLoadCallback(function () {

//});

$(document).ready(function() {
    //$(function () {

    app.getCountry();

    Backbone.on('tasksStart', app.tasksStart, this);
    Backbone.on('tasksStop', app.tasksStop, this);
    Backbone.on('error', app.handleError, this);

    app.router = new app.AppRouter();

    History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
    });

    document.addEventListener("gotCountry", function (e) {
        //debug("gotCountry"); 
        //debug(e.data);

        //window.history.replaceState({}, "rob", "www.roberttessler.com");

        //History.replaceState({ state: 3 }, "State 3", "www.google.com");
    });

    Backbone.history.start();
});