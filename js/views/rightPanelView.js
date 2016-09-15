var app = app || {};

app.RightPanelView = app.BaseView.extend({

    className: 'right-panel-view',

    template: _.template($('#right-panel-template').html()),

    initialize: function (options) {


    },

    render: function () {

        this.$el.html(this.template());

        return this;
    },

    postRender: function () {

        //<!-- ukmortgagecalculator.co 160x600 -->

        setTimeout(function () {

            try {

                (adsbygoogle = window.adsbygoogle || []).push({});

            } catch (err) {
                debug("rightPanelView.postRender: error: " + err.message);
            };
        }, 500);
    }
});