var app = app || {};

app.HomePageView = app.BaseView.extend({

    className: 'home-page-view',

    template: _.template($('#home-page-template').html()),

    initialize: function (options) {

        this.listenTo(Backbone, "openCalculator", this.openCalculator);
    },

    render: function () {

        this.$el.html(this.template());

        this.header_view = new app.HeaderView();
        this.$(".header-container").html(this.header_view.render().el);              

        this.left_panel_view = new app.LeftPanelView();
        this.$(".left-panel-container").html(this.left_panel_view.render().el);

        this.right_panel_view = new app.RightPanelView();
        this.$(".right-panel-container").html(this.right_panel_view.render().el);
        this.right_panel_view.postRender();
       
        return this;
    },

    openCalculator: function (type) {

        var view = new app.LoanCalculatorView({ type: type });

        this.$(".main").html("");
        this.$(".main").html(view.render().el);

        view.postRender();
    },
});