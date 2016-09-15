var app = app || {};

app.ukStampDutyView = app.BaseView.extend({

    className: 'uk-stamp-duty-view',

    template: _.template($('#uk-stamp-duty-template').html()),

    initialize: function (options) {

        this.redraw();
    },

    render: function () {

        this.$el.html(this.template());

        this.startListening();

        return this;
    },

    postRender: function () {
        this.redraw();
    },

    events: {
        'keydown input': 'validateNumericInput'
    },

    validateNumericInput: function (e) {
        return app.validateNumericInput(e);
    },

    getInputs: function () {

        return {
            property_value: getVal(this.$(".property-value"))
        };
    },

    startListening: function () {

        var self = this;

        self.$(".property-value-slider").slider({
            min: 0, max: app.MAX_PROPERTY_VALUE, step: 5000, range: "min", animate: "true", value: app.DEFAULT_PROPERTY_VALUE,
            slide: function (event, ui) {
                self.$(".property-value").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".property-value").val(ui.value);
                self.redraw();
            }
        });

        self.$(".property-value").change(function () {

            self.redraw();
            var v = getVal(self.$(".property-value"));
            self.$(".property-value-slider").slider({ value: v });
        });
    },

    redraw: function () {

        var inputs = this.getInputs();
       
        var duty = 0;

        // http://www.varcalc.com.au/calculators/main/640AU/stampduty.asp
        
        if (inputs.property_value < 125000)
        {
            duty = 0;
        }
        else if (inputs.property_value < 2500000)
        {
            duty = 1;
        }
        else if (inputs.property_value < 500000)
        {
            duty = 3;
        }
        else if (inputs.property_value < 1000000)
        {
            duty = 4;
        }
        else if (inputs.property_value < 2000000)
        {
            duty =  5;
        }
        else
        {
            duty = 7;
        }

        /*
        http://www.moneysavingexpert.com/mortgages/stamp-duty#what

        Correct at June 2014

        Up to £125,000	
        0%
        £125,000.01 - £250,000	
        1%
        £250,000.01 - £500,000	
        3%
        £500,000.01 - £1,000,000	
        4%
        £1,000,000.01 - £2,000,000	
        5%
        £2,000,000.01 +	
        7%
        
        */

        
        this.$(".stamp-duty").html(duty + "%");
        var total = inputs.property_value * duty/100.0;

        this.$(".total").html(format(total, "C"));

        this.result = [];

        this.result.push({ key: "property value", value: format(inputs.property_value, "C") });
        this.result.push({ key: "Stamp Duty", value: duty + "%" });
        this.result.push({ key: "Total", value: format(total, "C") });
    }
});