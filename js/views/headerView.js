var app = app || {};

app.HeaderView = app.BaseView.extend({

    className: 'header-view',

    template: _.template($('#header-template').html()),

    initialize: function (options) {

    },

    render: function () {

        this.$el.html(this.template());               

        return this;
    }
});