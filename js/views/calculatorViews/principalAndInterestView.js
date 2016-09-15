var app = app || {};

app.PrincipalAndInterestView = app.BaseView.extend({

    className: 'principal-and-interest-view',

    template: _.template($('#principal-and-interest-template').html()),

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
            interest_rate: getVal(this.$(".interest-rate")),
            extra_payments: getVal(this.$(".extra-payments")),
            loan_term: getVal(this.$(".loan-term"))
        };
    },

    startListening: function () {
        var self = this;

        self.$(".loan-amount-slider").slider({
            min: app.MIN_LOAN, max: app.MAX_LOAN, step: 5000, range: "min", animate: "true", value: app.DEFAULT_LOAN_AMOUNT,
            slide: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
            },
            stop: function (event, ui) {
                self.$(".loan-amount").val(addCommas(ui.value));
                self.redraw();
            }
        });

        self.$(".interest-rate-slider").slider({
            min: app.MIN_INTEREST, max: app.MAX_INTEREST, step: 0.1, range: "min", animate: "true", value: app.DEFAULT_INTEREST_RATE,
            slide: function (event, ui) {
                self.$(".interest-rate").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".interest-rate").val(ui.value);
                self.redraw();
            }
        });

        self.$(".extra-payments-slider").slider({
            min: 0, max: 10000, step: 100, range: "min", animate: "true", value: 0,
            slide: function (event, ui) {
                self.$(".extra-payments").val(ui.value);
            },
            stop: function (event, ui) {
                self.$(".extra-payments").val(ui.value);
                self.redraw();
            }
        });

        self.$(".loan-term-slider").slider({
            min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: app.DEFAULT_LOAN_TERM,
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
            var v = getVal(self.$(".loan-amount"));
            self.$(".loan-amount-slider").slider({ value: v });
        });

        self.$(".interest-rate").change(function () {

            self.redraw();
            var v = getVal(self.$(".interest-rate"));
            self.$(".interest-rate-slider").slider({ value: v });
        });

        self.$(".extra-payments").change(function () {

            self.redraw();
            var v = getVal(self.$(".extra-payments"));
            self.$(".extra-payments-slider").slider({ value: v });
        });

        self.$(".loan-term").change(function () {

            self.redraw();
            var v = getVal(self.$(".loan-term"));
            self.$(".loan-term-slider").slider({ value: v });
        });

        self.$(".pageno").change(function () {
            self.redraw();
        });

        self.$(".spinner #up").click(function () {
            var v = self.$(".spinner .yearno").val();
            v = parseInt(v);

            v++;

            self.$(".yearno").val(v);
            self.redraw();

        });

        self.$(".spinner #down").click(function () {
            var v = self.$(".spinner .yearno").val();
            v = parseInt(v);

            v--;

            if (v < 1)
                v = 1;

            self.$(".yearno").val(v);
            self.redraw();
        });
    },

    redraw: function () {

        var inputs = this.getInputs();

        var interest = inputs.interest_rate / 100.0;
        interest /= 12.0;
        var n = inputs.loan_term * 12.0;
        var pmt = app.PMT(interest, n, inputs.loan_amount, 0);

        //pmt += inputs.extra_payments;
        //n = app.NPER(interest, pmt, -(inputs.loan_amount), 0);

        var monthly_payment = app.calculateRepayment(inputs.loan_amount, interest, n);
        debug(monthly_payment);
        this.$(".monthly-payment").html("$" + pmt.toFixed(2));

        var arr = [];

        var principal = inputs.loan_amount;
        var total_interest = 0;
        var total_principal = 0;

        for (var i = 0; i < n; i++) {
            var interest_payment = principal * interest;
            var principal_payment = pmt - interest_payment;
            principal -= principal_payment;

            total_principal += principal_payment;
            total_interest += interest_payment;

            arr.push( {
                interest: interest_payment,
                principal: principal_payment,
                total_interest: total_interest,
                total_principal: total_principal,
                principal_remaining: principal
            });
        }

        //var yearno = $(".yearno").val();
        //yearno = parseInt(yearno);

        //this.$(".yearid").html(yearno);

        //yearno -= 1;


        var columns = [
                    "year",
                    "month",
                    "Interest",
                    "Principal",
                    "Interest to date",
                    "Principal to date",
                    "Principal remaining"];

        var rows = [];

        var month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        for (var i = 0; i < n; i++)
        {
            rows[i] = [Math.floor(i / 12) + 1,
                month[i - Math.floor(i / 12) * 12],
                format(arr[i].interest, "C"),
                format(arr[i].principal, "C"),
                format(arr[i].total_interest, "C"),
                format(arr[i].total_principal, "C"),
                format(arr[i].principal_remaining, "C")
            ];
        }

        var options = {
            columns: columns,
            rows: rows,
            pagesize: 12,
            columnFormatter: null,
            cellFormatter: null
        };

        $(".result-table").mjGrid(options);

        //this.$(".result-table").find("tr:gt(0)").remove();


        //for (var i = 12 * yearno; i < (12 * yearno) + 12 && i < n; i++) {
        //    var str = "<tr>";
        //    str += "<td>" + (i + 1) + "</td>";
        //    str += "<td>$" + arr[i].interest.toFixed(2) + "</td>";
        //    str += "<td>$" + addCommas(arr[i].principal.toFixed(2)) + "</td>";
        //    str += "<td>$" + addCommas(arr[i].total_interest.toFixed(2)) + "</td>";
        //    str += "<td>$" + addCommas(arr[i].total_principal.toFixed(2)) + "</td>";
        //    str += "<td>$" + addCommas(arr[i].principal_remaining.toFixed(2)) + "</td>";
        //    str += "</tr>";

        //    this.$(".result-table").append(str);
        //}

        //this.$(".result-table tr:odd").css("background", "#eee");
        //this.$(".result-table tr:even").css("background", "#fff");

        this.result = [];

        this.result.push({ key: "Principal and Interest", value: "" });
        this.result.push({ key: "loan amount", value: "$" + addCommas(inputs.loan_amount.toFixed(2)) });
        this.result.push({ key: "interest rate", value: inputs.interest_rate.toFixed(2) + "%" });
        this.result.push({ key: "loan term", value: inputs.loan_term + " years" });
        this.result.push({ key: "extra payments", value: addCommas(inputs.extra_payments.toFixed(2)) });

        this.result.push({ key: "monthly payment", value: addCommas("$" + pmt.toFixed(2)) });
    }
});