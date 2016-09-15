var app = app || {};

app.AppRouter = Backbone.Router.extend({

    routes: {
        "test/:id": "test",
        "home": "home",
        '*path': 'home'        
    },

    home: function () {

        var view = new app.HomePageView();
        $(".home-page-container").html(view.render().el);

        Backbone.trigger("openCalculator", app.CALC_TYPE_LOAN_REPAYMENT);
    },

    test: function (id) {

        //debug("test route: id = " + id);
    }

});