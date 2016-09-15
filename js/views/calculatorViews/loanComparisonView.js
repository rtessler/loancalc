var app = app || {};

app.LoanComparisonView = app.BaseView.extend({

    className: 'loan-comparison-view loan-calculator',

    template: _.template($('#loan-comparison-template').html()),

    initialize: function (options) {
       
    },

    render: function () {

        this.$el.html(this.template());

        this.result = [];

        this.startListening();

        return this;
    },

    postRender: function()
    {
        this.redraw();
    },

    events: {
        'keydown input': 'validateNumericInput'
    },

    validateNumericInput: function (e) {
        return app.validateNumericInput(e);
    },

    getInputs: function () {
        var upfront_fees1 = parseFloat(this.$('.upfront-fees1').val());
        var ongoing_fees_type1 = this.$('.ongoing-fees-type1').val();
        var ongoing_fees1 = parseFloat(this.$(".ongoing-fees1").val());
        var intro_rate1 = parseFloat(this.$(".intro-rate1").val());
        var intro_term1 = parseInt(this.$(".intro-term1").val());
        var ongoing_rate1 = parseFloat(this.$(".ongoing-rate1").val());

        var upfront_fees2 = parseFloat(this.$('.upfront-fees2').val());
        var ongoing_fees_type2 = this.$('.ongoing-fees-type2').val();
        var ongoing_fees2 = parseFloat(this.$(".ongoing-fees2").val());
        var intro_rate2 = parseFloat(this.$(".intro-rate2").val());
        var intro_term2 = parseInt(this.$(".intro-term2").val());
        var ongoing_rate2 = parseFloat(this.$(".ongoing-rate2").val());

        var loan_amount = removeCommas(this.$(".loan-amount").val());
        loan_amount = parseFloat(loan_amount);
        var loan_term = parseFloat(this.$(".loan-term").val());

        if (isNaN(upfront_fees1))
            upfront_fees1 = 0;

        if (isNaN(ongoing_fees1))
            ongoing_fees1 = 0;

        if (isNaN(intro_rate1))
            intro_rate1 = 0;

        if (isNaN(intro_term1))
            intro_term1 = 0;

        if (isNaN(ongoing_rate1))
            ongoing_rate1 = 0;

        //-----------------------------------	

        if (isNaN(upfront_fees2))
            upfront_fees2 = 0;

        if (isNaN(ongoing_fees2))
            ongoing_fees2 = 0;

        if (isNaN(intro_rate2))
            intro_rate2 = 0;

        if (isNaN(intro_term2))
            intro_term2 = 0;

        if (isNaN(ongoing_rate2))
            ongoing_rate2 = 0;

        //-------------------------------

        if (isNaN(loan_amount))
            loan_amount = 0;

        if (isNaN(loan_term))
            loan_term = 0;

        // get the monthly figure

        switch (ongoing_fees_type1) {
            case "weekly":
                ongoing_fees1 = ongoing_fees1 * 52 / 12;
                break;
            case "fortnightly":
                ongoing_fees1 = ongoing_fees1 * 26 / 12;
                break;
        }

        switch (ongoing_fees_type2) {
            case "weekly":
                ongoing_fees2 = ongoing_fees2 * 52 / 12;
                break;
            case "fortnightly":
                ongoing_fees2 = ongoing_fees2 * 26 / 12;
                break;
        }

        return {
            upfront_fees1: upfront_fees1,
            ongoing_fees_type1: ongoing_fees_type1,
            ongoing_fees1: ongoing_fees1,
            intro_rate1: intro_rate1,
            intro_term1: intro_term1,
            ongoing_rate1: ongoing_rate1,

            upfront_fees2: upfront_fees2,
            ongoing_fees_type2: ongoing_fees_type2,
            ongoing_fees2: ongoing_fees2,
            intro_rate2: intro_rate2,
            intro_term2: intro_term2,
            ongoing_rate2: ongoing_rate2,

            loan_amount: loan_amount,
            loan_term: loan_term
        };
    },

    drawChart: function (arr, scale) {

        this.drawGoogleChart(arr, scale);
    },

    drawGoogleChart: function(arr, scale)
    {        
        var data = new google.visualization.DataTable();
        
        data.addColumn('number', 'years');
        data.addColumn('number', 'total');
        data.addColumn('number', 'principal');
                
        for (var i = 0; i < arr.length; i++) {

            if (arr[i].original < 0)
                arr[i].original = 0;
        
            if (arr[i].total < 0)
                arr[i].total = 0;
        
            data.addRow([i / scale, arr[i].total / 1000, arr[i].original / 1000]);
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

    

    startListening: function()
    {
        var self = this;

        self.$(".loan-amount-slider").slider({
            min: 0, max: 5000000, step: 0.1, range: "min", animate: "true", value: 100000,
            slide: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
            },
            stop: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
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

        self.$(".loan-amount").change(function () {

            self.redraw();
            var v = removeCommas(self.$(".loan-amount").val());
            v = parseFloat(v);
            self.$(".loan-amount-slider").slider({ value: v });
        });

        self.$(".loan-term").change(function () {

            self.redraw();
            var v = parseFloat(self.$(".loan-term").val());
            self.$(".loan-term-slider").slider({ value: v });
        });

        self.$(".upfront-fees1").change(function () { self.redraw(); });
        self.$(".ongoing-fees-type1").change(function () { self.redraw(); });
        self.$(".ongoing-fees1").change(function () { self.redraw(); });
        self.$(".intro-rate1").change(function () { self.redraw(); });
        self.$(".intro-term1").change(function () { self.redraw(); });
        self.$(".ongoing-rate1").change(function () { self.redraw(); });

        self.$(".upfront-fees2").change(function () { self.redraw(); });
        self.$(".ongoing-fees-type2").change(function () { self.redraw(); });
        self.$(".ongoing-fees2").change(function () { self.redraw(); });
        self.$(".intro-rate2").change(function () { self.redraw(); });
        self.$(".intro-term2").change(function () { self.redraw(); });
        self.$(".ongoing-rate2").change(function () { self.redraw(); });
    },

    redraw: function() 
    {
        var inputs = this.getInputs();

        var intro_rate1 = inputs.intro_rate1 / 100.0;
        intro_rate1 /= 12.0;
        var pmt_intro1 = app.PMT(intro_rate1, inputs.loan_term * 12, inputs.loan_amount, 0);

        var t1 = app.total(intro_rate1, inputs.intro_term1, pmt_intro1, inputs.loan_amount);

        var ongoing_rate1 = inputs.ongoing_rate1 / 100.0;
        ongoing_rate1 /= 12.0;
        var pmt_ongoing1 = app.PMT(ongoing_rate1, (inputs.loan_term * 12) - inputs.intro_term1, inputs.loan_amount - t1.total_principal, 0);

        pmt_intro1 += inputs.ongoing_fees1;
        t1 = app.total(intro_rate1, inputs.intro_term1, pmt_intro1, inputs.loan_amount);
        pmt_ongoing1 += inputs.ongoing_fees1;

        this.$(".res1").html("$" + addCommas(pmt_intro1.toFixed(0)));
        this.$(".res3").html("$" + addCommas(pmt_ongoing1.toFixed(0)));

        var q1 = app.total(ongoing_rate1, (inputs.loan_term * 12) - inputs.intro_term1, pmt_ongoing1, inputs.loan_amount - t1.total_principal);
        var total1 = t1.total_principal + t1.total_interest + q1.total_principal + q1.total_interest + inputs.upfront_fees1;

        this.$(".res5").html("$" + addCommas(total1.toFixed(0)));

        //--------------------------------------------------------

        var intro_rate2 = inputs.intro_rate2 / 100.0;
        intro_rate2 /= 12.0;
        var pmt_intro2 = app.PMT(intro_rate2, inputs.loan_term * 12, inputs.loan_amount, 0);

        var t2 = app.total(intro_rate2, inputs.intro_term2, pmt_intro2, inputs.loan_amount);

        var ongoing_rate2 = inputs.ongoing_rate2 / 100.0;
        ongoing_rate2 /= 12.0;
        var pmt_ongoing2 = app.PMT(ongoing_rate2, (inputs.loan_term * 12) - inputs.intro_term2, inputs.loan_amount - t2.total_principal, 0);

        pmt_intro2 += inputs.ongoing_fees2;
        t2 = app.total(intro_rate2, inputs.intro_term2, pmt_intro2, inputs.loan_amount);		// recalculate
        pmt_ongoing2 += inputs.ongoing_fees2;

        this.$(".res2").html("$" + addCommas(pmt_intro2.toFixed(0)));
        this.$(".res4").html("$" + addCommas(pmt_ongoing2.toFixed(0)));

        var q2 = app.total(ongoing_rate2, (inputs.loan_term * 12) - inputs.intro_term2, pmt_ongoing2, inputs.loan_amount - t2.total_principal);
        var total2 = t2.total_principal + t2.total_interest + q2.total_principal + q2.total_interest + inputs.upfront_fees2;

        this.$(".res6").html("$" + addCommas(total2.toFixed(0)));

        var x = total1 - total2;
        this.$(".res0").html("$" + addCommas(x.toFixed(0)));

        //this.drawChart();
        		
        //var arr = new Array();	
                        
        //var principal = inputs.loan_amount;
        //var total = inputs.loan_amount + app.totalInterest(inputs.normal_interest, n, pmt, inputs.loan_amount);
                    
        //for (var i = 0; i < n; i++)
        //{
        //    var interest_payment = inputs.principal * inputs.normal_interest;
        //    var principal_payment = pmt - inuts.interest_payment;
                                    
        //    arr[i] = {};
                        
        //    arr[i].original = principal;
        //    principal -= principal_payment;	
                        
        //    arr[i].total = total;
        //    total -= pmt;
        //}		
                            
        //this.drawChart(arr,12);
        
        this.result = [];
        
        this.result.push({ key: "Loan Comparison", value: "" });

        this.result.push({ key: "Loan 1", value: "" });
        this.result.push({ key: "upfront fees", value: "$" + inputs.upfront_fees1 });
        this.result.push({ key: "ongoing fees frequency", value: inputs.ongoing_fees_type1 });
        this.result.push({ key: "ongoing fees", value: inputs.ongoing_fees1 });
        this.result.push({ key: "intro rate", value: inputs.intro_rate1 + "%" });
        this.result.push({ key: "intro term", value: inputs.intro_term1 + " months" });
        this.result.push({ key: "ongoing rate", value: inputs.ongoing_rate1 + "%" });

        this.result.push({ key: "Loan 2", value: "" });
        this.result.push({ key: "upfront fees", value: "$" + inputs.upfront_fees2 });
        this.result.push({ key: "ongoing fees frequency", value: inputs.ongoing_fees_type2 });
        this.result.push({ key: "ongoing fees", value: inputs.ongoing_fees2 });
        this.result.push({ key: "intro rate", value: inputs.intro_rate2 + "%" });
        this.result.push({ key: "intro term", value: inputs.intro_term2 + " months" });
        this.result.push({ key: "ongoing rate", value: inputs.ongoing_rate2 + "%" });


        this.result.push({ key: "loan amount", value: "$" + inputs.loan_amount });
        this.result.push({ key: "loan term", value: inputs.loan_term + " years" });

        this.result.push({ key: "Loan 1", value: "" });
        this.result.push({ key: "initial per month", value: "$" + addCommas(pmt_intro1.toFixed(0)) });
        this.result.push({ key: "outgoing per month", value: "$" + addCommas(pmt_ongoing1.toFixed(0)) });
        this.result.push({ key: "total payable", value: "$" + addCommas(total1.toFixed(0)) });

        this.result.push({ key: "Loan 2", value: "" });
        this.result.push({ key: "initial per month", value: "$" + addCommas(pmt_intro2.toFixed(0)) });
        this.result.push({ key: "outgoing per month", value: "$" + addCommas(pmt_ongoing2.toFixed(0)) });
        this.result.push({ key: "total payable", value: "$" + addCommas(total2.toFixed(0)) });

        this.result.push({ key: "loan #2 will save you ", value: "$" + addCommas(x.toFixed(0)) });
    }
});
