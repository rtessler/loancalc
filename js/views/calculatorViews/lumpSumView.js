var app = app || {};

app.LumpSumView = app.BaseView.extend({

    className: 'lump-sum-view',

    template: _.template($('#lump-sum-template').html()),

    initialize: function (options) {

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
            loan_amount: getVal(this.$(".loan-amount")),
            loan_term: getVal(this.$(".loan-term")),
            interest_rate: getVal(this.$(".interest-rate")),
            repayment_frequency: this.$(".repayment-frequency").val(),
            lump_sum: getVal(this.$(".lump-sum")),
            lump_sum_year: getVal(this.$(".lump-sum-year"))
        };
    },

    startListening: function () {

        var self = this;

        /*
        self.$(".loan-amount-slider").slider({
            min: 1000, max: 5000000, step: 5000, range: "min", animate: "true", value: 100000,
            slide: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
            },
            stop: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
                self.redraw();
            }
        });

        self.$(".interest-rate-slider").slider({
            min: 0.25, max: 25.0, step: 0.1, range: "min", animate: "true", value: 7.25,
            slide: function (event, ui) {
                self.$(".interest-rate").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".interest-rate").val(ui.value);
                self.redraw();
            }
        });

        self.$(".loan-term-slider").slider({
            min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25,
            slide: function (event, ui) {
                self.$(".loan-term").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".loan-term").val(ui.value);
                self.redraw();
            }
        });

        self.$(".lump-sum-slider").slider({
            min: 0, max: 92000, step: 1000, range: "min", animate: "true", value: 10000,
            slide: function (event, ui) {
                self.$(".lump-sum").val(addCommas(ui.value));
            },
            stop: function (event, ui) {
                self.$(".lump-sum").val(addCommas(ui.value));
                self.redraw();
            }
        });

        self.$(".lump-sum-year-slider").slider({
            min: 0, max: 25, step: 0.5, range: "min", animate: "true", value: 5,
            slide: function (event, ui) {
                self.$(".lump-sum-year").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".lump-sum-year").val(ui.value);
                self.redraw();
            }
        });
        */

        self.$(".loan-amount").change(function () {

            self.redraw();
            //var v = getVal(self.$(".loan-amount"));
            //self.$(".loan-amount-slider").slider({ value: v });
        });

        self.$(".interest-rate").change(function () {

            self.redraw();
            //var v = getVal(self.$(".interest-rate"));
            //self.$(".interest-rate-slider").slider({ value: v });
        });

        self.$(".loan-term").change(function () {

            self.redraw();
            //var v = getVal(self.$(".loan-term"));
            //self.$(".loan-term-slider").slider({ value: v });
        });

        self.$(".repayment-frequency").change(function () {
            self.redraw();
        });

        self.$(".lump-sum").change(function () {

            self.redraw();
            //var v = getVal(self.$(".lump-sum"));
            //self.$(".lump-sum-slider").slider({ value: v });
        });

        self.$(".lump-sum-year").change(function () {

            self.redraw();
            //var v = getVal(self.$(".lump-sum-year"));
            //self.$(".lump-sum-year-slider").slider({ value: v });
        });
    },

    drawChart: function (arr, scale) {

        app.drawCanvasChart(arr, this);
        return;

        this.drawGoogleChart(arr, scale);
        return;

        var step = parseInt(arr.length / 10);

        var data = {
            xScale: "linear",
            yScale: "linear",
            type: "line",
            //interpolation: "monotone",
            main: [
              {
                  className: ".principal",
                  data: []
              },
              {
                  className: ".total",
                  data: []
              }
            ]
        };

        for (var i = 0, len = arr.length; i < len; i += step) {
            this.addPoint(data, arr, i, scale);

            if (i + step >= len)
                this.addPoint(data, arr, len - 1, scale);
        }

        var opts = {
            "dataFormatX": function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
            "tickFormatX": function (x) { return d3.time.format('%A')(x); }
        };

        var myChart = new xChart('line', data, '.chart');
    },
    
    drawGoogleChart: function(arr, scale)
    {        
        var data = new google.visualization.DataTable();
        
        data.addColumn('number', 'years');
        data.addColumn('number', 'original');
        data.addColumn('number', 'with lump sum');
        
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].original < 0)
                arr[i].original = 0;
        
            if (arr[i].extra < 0)
                arr[i].extra = 0;
        
            data.addRow([i / scale, arr[i].original / 1000, arr[i].extra / 1000]);
        }
        
        var options = {
            //title: 'Amount Owing',
            //backgroundColor: "#eee",
            colors: ['#E4E4E4', '#F7C244'],
            //colors:['#A2C180','#3D7930','#FFC6A5','#FFFF42','#DEF3BD','#00A5C6','#DEBDDE','#000000'],
            hAxis: { title: 'Years' },
            //vAxis: {title: 'Amount Owing', format:'$#K', minValue: 0,, titleTextStyle: { fontSize: 12 }},
            vAxis: { title: 'Amount Owing', format: '$#K' },
            legend: { position: 'bottom' },
            //animation: { duration: 1000, easing: 'out', }
        };
        
        var chart = new google.visualization.AreaChart(this.$(".chart")[0]);
        chart.draw(data, options);        
    },

    redraw: function() {

        var inputs = this.getInputs();

        var interest = inputs.interest_rate / 100.0;
        var scale;

        this.$("label.repayment-frequency").html(inputs.repayment_frequency + " repayments:");

        switch (inputs.repayment_frequency)
        {
            case "weekly": scale = app.WEEKS_PER_YEAR; break;
            case "fortnightly": scale = app.FORTNIGHTS_PER_YEAR; break;
            case "monthly": scale = app.MONTHS_PER_YEAR; break;
        }

        interest = interest / scale;            // interest per period
        var n = inputs.loan_term * scale;       // number of payments
        var n2 = inputs.lump_sum_year * scale;	// number of payments before lump sum

        //-----------------------------------------------------------------------------
        // repayment

        var res = app.calculateRepayment(inputs.loan_amount, interest, n);
        //var pmt1 = app.PMT(interest, n, inputs.loan_amount, 0);
        this.$(".repayment").html(format(res.repayment, "C"));

        //-----------------------------------------------------------------------------
        // original total

        var a = app.total(interest, n, res.repayment, inputs.loan_amount);
        this.$(".original-total").html(format(a.total_principal + a.total_interest, "C"));

        //-----------------------------------------------------------------------------
        // updated total

        var pmt1 = res.repayment;

        var t = app.total(interest, n, pmt1, inputs.loan_amount);

        var total_interest1 = t.total_interest;

        // with extra lump sum

        var a = app.total(interest, n2, pmt1, inputs.loan_amount);		// before lump sum

        var new_loan_amount = inputs.loan_amount - a.total_principal - inputs.lump_sum;
        var nper2 = app.NPER(interest, pmt1, -new_loan_amount, 0);
        var b = app.total(interest, nper2, pmt1, new_loan_amount);                    // after lump sum

        //debug("nper2 = " + nper2 + " s = " + s + " n = " + n);

        this.$(".updated-total").html(format(a.total_principal + b.total_principal + a.total_interest + b.total_interest, "C"));

        //-----------------------------------------------------------------------------
        // chart data

        var total_interest2 = a.total_interest + b.total_interest;

        var series = [{ name: "original", data: [] }, { name: "extra", data: [] }];

        for (var i = 0; i < t.amount_owing.length; i++) {

            if (i == 0 || i % scale == 0 || i == n) {

                series[0].data.push(t.amount_owing[i]);

                if (i < n2) {

                    series[1].data.push(a.amount_owing[i]);
                }
                else {

                    if (i - n2 < b.amount_owing.length)
                        series[1].data.push(b.amount_owing[i - n2]);
                    else
                        series[1].data.push(0);
                }
            }
        }

        /*
        var arr = [];
        var p1 = inputs.loan_amount;
        var p2 = inputs.loan_amount;
        var jump = true;

        for (var i = 0; i <= n; i++) {

            arr[i] = {};

            a = app.calculatePeriodRepayment(pmt1, interest, n, i);

            if (i == 0 || i % scale == 0 || i == n) {
                series[0].data.push(p1);
                arr[i].original = p1;
            }
            p1 -= a.principal_repayment;

            if (i >= s) {
                b = app.calculatePeriodRepayment(pmt1, interest, nper2, i - s);

                if (i == 0 || i % scale == 0 || i == n) {
                    series[1].data.push(p2);
                    arr[i].extra = p2;
                }

                p2 -= b.principal_repayment;

                if (jump) {
                    p2 -= inputs.lump_sum;
                    jump = false;
                }
            }
            else {

                if (i == 0 || i % scale == 0 || i == n) {
                    series[1].data.push(p1);
                    arr[i].extra = p1;
                }

                p2 -= a.principal_repayment;
            }
        }
*/
        //--------------------------------------------------------------------------------------------
        // time saved

        var original_years = inputs.loan_term;
        var years_saved = original_years - ((n2 + nper2) / scale);       

        var months_saved = (years_saved - Math.floor(years_saved)) * 12.0;

        this.$(".time-saved").html(Math.floor(years_saved) + " years, " + Math.ceil(months_saved) + " months");

        //--------------------------------------------------------------------------------------------
        // interest saved

        var interest_saved = total_interest1 - total_interest2;
        this.$(".interest-saved").html(format(interest_saved, "C"));

        //--------------------------------------------------------------------------------------------
        // updated time

        this.$(".updated-time").html(inputs.loan_term - Math.ceil(years_saved) + " years, " + (12 - Math.ceil(months_saved)) + " months");

        //--------------------------------------------------------------------------------------------

        app.drawCanvasChart(series, this);

        this.result = []
    
        this.result.push({ key: "Lump Sum", value: "" });
        this.result.push({ key: "loan_amount", value: addCommas(inputs.loan_amount.toFixed(2)) });
        this.result.push({ key: "interest rate", value: inputs.interest_rate + "%" });
        this.result.push({ key: "loan term", value: inputs.loan_term });
        this.result.push({ key: "repayment frequency", value: inputs.repayment_frequency });
        this.result.push({ key: "lump sum", value: inputs.lump_sum });
        this.result.push({ key: "lump sum year", value: inputs.lump_sum_year });

        this.result.push({ key: "repayments", value: "$" + addCommas(res.repayment.toFixed(2)) });
        this.result.push({ key: "Time saved", value: Math.floor(years_saved) + " years, " + Math.ceil(months_saved) + " months" });
        this.result.push({ key: "Interest saved", value: "$" + addCommas(interest_saved.toFixed(2)) });
    }
});