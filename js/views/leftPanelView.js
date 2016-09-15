var app = app || {};

app.LeftPanelView = Backbone.View.extend({

    className: 'left-panel-view',

    template: _.template($('#left-panel-template').html()),

    initialize: function (options) {

    },

    render: function () {

        this.$el.html(this.template());
       
        return this;
    },

    events: {
        'click a': 'linkClick'
    },

    linkClick: function(e)
    {
        e.preventDefault();
      
        //var loancalcURL = "localhost:8080/sterling/";
        //var key = "localhost";

        //var loancalcURL = "http://www.zgnome.com/sites/loancalc/";
        //var key =  "zgnome";
        
        //var c = new loancalc();

        //c.getCalulator($(this).attr("id"), "calculator", loancalcURL, key);

        this.$("ul li").removeClass("active");
        $(e.currentTarget).parent().addClass("active");

        var type = $(e.currentTarget).attr("calculatorType");
        //var title = $(e.currentTarget).text();

        //this.openCalculator(type, title);

        Backbone.trigger("openCalculator", type);
     }
});