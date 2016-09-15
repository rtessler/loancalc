var app = app || {};

app.SplitLoanView = app.BaseView.extend({

    className: 'split-loan-view',

    template: _.template($('#split-loan-template').html()),

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

        var repayment_frequency = this.$(".repayment-frequency").val();

        return {
            loan_amount: getVal(this.$(".loan-amount")),
            fixed_portion: getVal(this.$(".fixed-portion")),
            fixed_period: getVal(this.$(".fixed-period")),
            fixed_interest_rate: getVal(this.$(".fixed-interest-rate")),
            variable_interest_rate: getVal(this.$(".variable-interest-rate")),
            loan_term: getVal(this.$(".loan-term")),
            repayment_frequency: repayment_frequency
        };
    },


    drawChart: function (arr, scale) {

        this.drawGoogleChart(arr, scale);
        return;
    },

    drawGoogleChart: function(arr, scale)
    {        
	    var data = new google.visualization.DataTable();
		
        data.addColumn('number', 'years');
        data.addColumn('number', 'Fixed');
        data.addColumn('number', 'Variable');
    					
        for (var i = 0; i < arr.length; i++)
        {
            if (arr[i].original < 0)
                arr[i].original = 0;
				
            if (arr[i].alt < 0)
                arr[i].alt = 0;				
				
            data.addRow([i/scale, arr[i].original/1000, arr[i].alt/1000]);
        }

        var options = {
            //title: 'Amount Owing',
            //backgroundColor: "#eee",
            colors: ['#E4E4E4','#F7C244'],
            //colors:['#A2C180','#3D7930','#FFC6A5','#FFFF42','#DEF3BD','#00A5C6','#DEBDDE','#000000'],
            hAxis: {title: 'Years'},
            //vAxis: {title: 'Amount Owing', format:'$#K', minValue: 0,, titleTextStyle: { fontSize: 12 }},
            vAxis: {title: 'Amount Owing', format:'$#K'},
            legend: {position: 'bottom'},
            //animation: { duration: 1000, easing: 'out', }
        };

        var chart = new google.visualization.AreaChart(this.$(".chart")[0]);
        chart.draw(data, options);        
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

        self.$(".fixed-portion-slider").slider({
            min: 0, max: 100, step: 1, range: "min", animate: "true", value: 60,
            slide: function (event, ui) {
                self.$(".fixed-portion").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".fixed-portion").val(ui.value);
                self.redraw();
            }
        });

        self.$(".fixed-period-slider").slider({
            min: 0.5, max: 25, step: 0.5, range: "min", animate: "true", value: 3,
            slide: function (event, ui) {
                self.$(".fixed-period").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".fixed-period").val(ui.value);
                self.redraw();
            }
        });

        self.$(".fixed-interest-rate-slider").slider({
            min: 0.5, max: 25, step: 0.5, range: "min", animate: "true", value: 6.80,
            slide: function (event, ui) {
                self.$(".fixed-interest-rate").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".fixed-interest-rate").val(ui.value);
                self.redraw();
            }
        });

        self.$(".variable-interest-rate-slider").slider({
            min: 0, max: 25, step: 0.25, range: "min", animate: "true", value: 8.3,
            slide: function (event, ui) {
                self.$(".variable-interest-rate").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".variable-interest-rate").val(ui.value);
                self.redraw();
            }
        });

        self.$(".loan-term-slider").slider({
            min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25.0,
            slide: function (event, ui) {
                self.$(".loan-term").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".loan-term").val(ui.value);
                self.redraw();
            }
        });
*/
        self.$(".loan-amount").change(function () {

            self.redraw();
            //var v = getValue(self.$(".loan-amount"));          
            //self.$(".loan-amount-slider").slider({ value: v });
        });

        self.$(".fixed-portion").change(function () {

            self.redraw();
            //var v = getValue(self.$(".fixed-portion"));
            //self.$(".fixed-portion-slider").slider({ value: v });
        });

        self.$(".fixed-period").change(function () {

            self.redraw();
            //var v = getValue(self.$(".fixed-period"));
            //self.$(".fixed-period-slider").slider({ value: v });
        });

        self.$(".fixed-interest-rate").change(function () {

            self.redraw();
            //var v = getValue(self.$(".fixed-interest-rate"));
            //self.$(".fixed-interest-rate-slider").slider({ value: v });
        });

        self.$(".variable-interest-rate").change(function () {

            self.redraw();
            //var v = getValue(self.$(".variable-interest-rate"));
            //self.$(".variable-interest-rate-slider").slider({ value: v });
        });

        self.$(".loan-term").change(function () {

            self.redraw();
            //var v = getValue(self.$(".loan-term"));
            //self.$(".loan-term-slider").slider({ value: v });
        });

        self.$(".repayment-frequency").change(function () {
            self.redraw();
        });
    },

    redraw: function () {

        var inputs = this.getInputs();

        var variable_interest = inputs.variable_interest_rate / 100.0;
        var fixed_interest = inputs.fixed_interest_rate / 100.0;
        var scale;

        this.$(".label3").html("Total " + inputs.repayment_frequency + " repayment:");

        switch (inputs.repayment_frequency)
        {
            case "weekly": scale = app.WEEKS_PER_YEAR; break;        
            case "fortnightly": scale = app.FORTNIGHTS_PER_YEAR; break;
            default: scale = app.MONTHS_PER_YEAR; break;
        }

        variable_interest /= scale;
        fixed_interest /= scale;
        var n = inputs.loan_term * scale;
        var s = inputs.fixed_period * scale;

        var fixed_loan_amount = inputs.loan_amount * inputs.fixed_portion / 100.0;
        var pmt_fixed = app.PMT(fixed_interest, n, fixed_loan_amount, 0);

        var variable_loan_amount = inputs.loan_amount * (100 - inputs.fixed_portion) / 100.0;
        var pmt_variable = app.PMT(variable_interest, n, variable_loan_amount, 0);

        debug("pmt_fixed = " + pmt_fixed + " pmt_variable = " + pmt_variable);

        this.$(".res1").html(format(pmt_fixed, "C"));
        this.$(".res2").html(format(pmt_variable, "C"));

        var x = pmt_fixed + pmt_variable;
        this.$(".res3").html("$" + addCommas(x.toFixed(0)));

        var pmt_normal = app.PMT(variable_interest, n, inputs.loan_amount, 0);
        var total_interest = app.total(variable_interest, n, pmt_normal, inputs.loan_amount).total_interest;

        debug("total_interest = " + total_interest);
        this.$(".res5").html(format(total_interest, "C"));

        var a = app.total(fixed_interest, s, pmt_fixed, fixed_loan_amount);
        var b = app.total(variable_interest, s, pmt_variable, variable_loan_amount);

        var r = inputs.loan_amount - a.total_principal - b.total_principal;
        var pmt4 = app.PMT(variable_interest, n - s, r, 0);
        var c = a.total_interest + b.total_interest + app.totalInterest(variable_interest, n - s, pmt4, r).total_interest;

        this.$(".res4").html(format(c, "C"));

        var series = [{ name: "original", data: [] }, { name: "alt", data: [] }];
        //var arr = [];

        var p1 = fixed_loan_amount;
        var p2 = variable_loan_amount;
        var p3 = r;

        for (var i = 0; i <= n; i++) {

            //arr[i] = {};

            if (i < s) {
                var a = app.calculatePeriodRepayment(pmt_variable, variable_interest, s, i);
                var b = app.calculatePeriodRepayment(pmt_fixed, fixed_interest, s, i);

                if (i == 0 || i % scale == 0 || i == n) {

                    if (p1 > 0)
                        series[0].data.push(p1);
                    else
                        series[0].data.push(0);

                    //arr[i].original = p1;

                    if (p2 > 0)
                        series[1].data.push(p2);
                    else
                        series[1].data.push(0);
                    //arr[i].alt = p2;
                }

                p1 -= a.principal_repayment;
                p2 -= b.principal_repayment;
            }
            else {
                var a = app.calculatePeriodRepayment(pmt4, variable_interest, n - s, i);

                if (i == 0 || i % scale == 0 || i == n) {

                    if (p3 > 0)
                        series[1].data.push(p3);
                    else
                        series[1].data.push(0);

                    //arr[i].alt = p3;
                    series[0].data.push(0);
                    //arr[i].original = 0;
                }

                p3 -= a.principal_repayment;

                //p2 -= a.principal_repayment;					
            }
        }

        app.drawCanvasChart(series, this);

        //if (inputs.repayment_frequency == "weekly")
        //    this.drawChart(arr, 52);
        //else
        //    if (inputs.repayment_frequency == "fortnightly")
        //        this.drawChart(arr, 26);
        //    else
        //        this.drawChart(arr, 12);

        this.result = [];

        this.result.push({ key: "Split Loan", value: "" });
        this.result.push({ key: "loan amount", value: format(inputs.loan_amount, "C") });
        this.result.push({ key: "fixed portion", value: inputs.fixed_portion + " %" });
        this.result.push({ key: "fixed period", value: inputs.fixed_period + " yr" });
        this.result.push({ key: "fixed interest rate", value: inputs.fixed_interest_rate + "%" });
        this.result.push({ key: "variable interest rate", value: inputs.variable_interest_rate + "%" });
        this.result.push({ key: "loan term", value: inputs.loan_term + " years" });
        this.result.push({ key: "repayment frequency", value: inputs.repayment_frequency });

        this.result.push({ key: "fixed repayment", value: format(pmt_fixed, "C") });
        this.result.push({ key: "variable repayment", value: format(pmt_variable, "C") });
        this.result.push({ key: "total monthly repayment", value: format(x, "C") });
        this.result.push({ key: "total interest payable", value: format(c, "C") });
        this.result.push({ key: "variable interest rate", value: format(total_interest, "C") });
    }

});