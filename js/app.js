var app = {

    // constants    

    APPNAME: "LOAN CALCULATOR",
    //API_BASEPATH: "http://eventdawg.local3:8080/server/index.php/",

    WEEKS_PER_YEAR: 52.0,
    FORTNIGHTS_PER_YEAR: 26.0,
    MONTHS_PER_YEAR: 12,
    PRINCIPAL_AND_INTEREST: "principal and interest",
    INTEREST_ONLY: "interest only",

    PROPERTY_TYPE_LIVE_IN: 1,
    PROPERTY_TYPE_INVESTMENT: 2,

    DEFAULT_LOAN_AMOUNT: 350000,
    DEFAULT_INTEREST_RATE: 6.0,
    DEFAULT_LOAN_TERM: 30,
    DEFAULT_PROPERTY_VALUE: 430000,
    MAX_PROPERTY_VALUE: 500000000,
    MAX_LOAN: 5000000,
    MIN_LOAN: 1000,
    MIN_INTEREST: 0.26,
    MAX_INTEREST: 25,
    DEFAULT_MONTHLY_SALARY: 5000,
    DEFAULT_LUMP_SUM: "100,000",

    FREQUENCY_ANNUAL: 1,
    FREQUENCY_MONTHLY: 2,
    FREQUENCY_FORTNIGHTLY: 3,
    FREQUENCY_WEEKLY: 4,

    frequency_name: ["", "annual", "monthly", "fortnightly", "weekly"],   

    CANVAS_WIDTH: 295,
    CANVAS_HEIGHT: 190,

    CALC_TYPE_LOAN_REPAYMENT: 1,
    CALC_TYPE_EXTRA_REPAYMENT: 2,
    CALC_TYPE_LUMP_SUM: 3,
    CALC_TYPE_SPLIT_LOAN: 4,
    CALC_TYPE_PRINCIPAL_AND_INTEREST: 5,
    CALC_TYPE_BORROWING_POWER: 6,
    CALC_TYPE_STAMP_DUTY: 7,
    CALC_TYPE_LOAN_COMPARISON: 8,

    SERIES_STROKE_COLOR1: "rgba(26,153,235,1)",
    SERIES_STROKE_COLOR2: "rgba(204,225,26,1)",

    SERIES_FILL_COLOR1: "rgba(26,153,235,0.2)",
    SERIES_FILL_COLOR2: "rgba(204,225,26,0.2)",

    KEY_DEL: 46,
    KEY_BACKSPACE: 8,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_ENTER: 13,
    KEY_TAB: 9,
    KEY_ESCAPE: 27,

    currency_symbol: "$",

    task_count: 0,

    clearTasks: function()
    {
        this.task_count = 0;
    },

    tasksStart: function () {

        $("#loading").show();

        this.task_count++;
    },

    tasksStop: function () {

        this.task_count--;

        if (this.task_count <= 0) {
            $("#loading").hide();
            this.task_count = 0;
            Backbone.trigger("allTasksComplete");
        }
    },

    handleError: function (errmsg) {

        $("#loading").hide();
        this.task_count = 0;
    },

    ajaxAbort: function () {
        $("#loading").hide();
        this.task_count = 0;
    },

    hideIOSKeyboard: function () {
        document.activeElement.blur();
        $("input").blur();
    },

    getCountry: function()
    {
        var self = this;

        $.get("http://ipinfo.io", function (response) {

            self.country = response.country;

            //self.country = "GB";

           // debug("getCountry: country = " + self.country);

            if (self.country == "GB" || self.country == "UK")
                app.currency_symbol = "&#163;"; //"£";

            // Create the event
            var event = new CustomEvent("gotCountry", { "data": response });

            // Dispatch/Trigger/Fire the event
            document.dispatchEvent(event);

        }, "jsonp");
    },

    //PV: function(rate, nper, pmt, fv)		// present value
	//{
	//	rate = parseFloat(rate);
    //    pmt = parseFloat(pmt);
    //    nper = parseFloat(nper);
				
    //    if (pmt == 0 || nper == 0)
    //        return 0;
			
    //    if ( rate == 0 ) // Interest rate is 0
    //        return -(fv + (pmt * nper));
		
    //    var x = Math.pow(1 + rate, -nper);
    //    var y = Math.pow(1 + rate, nper);

    //    return - ( x * ( fv * rate - pmt + y * pmt )) / rate;
    //},
	
    //FV: function(rate, nper, pmt, pv)
    //{		
    //    rate = parseFloat(rate);
    //    pmt = parseFloat(pmt);
    //    nper = parseFloat(nper);
			
    //    if ( rate == 0 ) // Interest rate is 0
    //        return -(pv + (pmt * nper));
			
    //    x = Math.pow(1 + rate, nper);	
			
    //    return - ( -pmt + x * pmt + rate * x * pv ) /rate;
    //},	
	
    // http://www.mohaniyer.com/old/js.htm

    NPER: function(rate, pmt, pv, fv)
    {
        rate = parseFloat(rate);
        pmt = parseFloat(pmt);
        pv = parseFloat(pv);
		
        if (rate == 0)
            return  - (fv + pv)/pmt;
			
        var nper = Math.log((-fv * rate + pmt)/(pmt + rate * pv))/ Math.log(1 + rate);
		
        return Math.ceil(nper);
    },
	
    PMT: function(rate, nper, pv, fv)
    {
        // rate: interest for a period
        // nper: number of payments
        // pv : principal

        // calculates the total repayment for a period

        rate = parseFloat(rate);
        nper = parseFloat(nper);
        pv = parseFloat(pv);
				
        if (rate == 0)
            return - (fv + pv)/nper;
					
        x = Math.pow(1 + rate,nper);
        var pmt = (rate * (fv + x * pv)) / (-1 + x);

        return pmt;
    },

    totalInterest: function (rate, n, pmt, loan_amount) {

        return this.total(rate, n, pmt, loan_amount);

        //var total_interest = 0;

        //for (var i = 0; i < n; i++) {
        //    var interest_payment = loan_amount * rate;
        //    var principal_payment = pmt - interest_payment;
        //    loan_amount -= principal_payment;

        //    if (loan_amount <= 0) // paid off
        //        break;

        //    total_interest += interest_payment;
        //}

        //return total_interest;
    },

    total: function (interest, n, pmt, loan_amount) {

        // interest: interest rate per payment period
        // n: number of payments
        // pmt: amount paid per payment
        // loan_amount: the loan amount

        // note: we do not assume n is enough payments to pay off the loan or that n payments of pmt will pay off the loan

        var total_principal = 0;
        var total_interest = 0;        
        var amount_owing = [];
        var payment_no = 0;

        for (var i = 0; i < n && loan_amount > 0; i++) {

            amount_owing.push(loan_amount);

            var interest_payment = loan_amount * interest;
            var principal_payment;

            if (loan_amount - (pmt - interest_payment) <= 0) {

                // principal payment is more than the loan amount
                // pay off the loan

                principal_payment = loan_amount;
            }
            else {
                principal_payment = pmt - interest_payment;
            }

            total_principal += principal_payment;
            total_interest += interest_payment;

            loan_amount -= principal_payment;       // amount owing is reduced by the amount of the principal payment
            payment_no++;

            if (loan_amount <= 0) // paid off
            {
                loan_amount = 0;
                amount_owing.push(0);
                break;
            }
        }

        return {
            total_principal: total_principal,
            total_interest: total_interest,
            amount_owing: amount_owing,
            principal_remaining: loan_amount,
            payment_no: payment_no
        };
    },


    calculatePeriodRepayment: function (total_repayment, interest, repayment_no, period) {

        // see http://www.ext.colostate.edu/pubs/farmmgt/03757.html

        principal_repayment = total_repayment * (Math.pow((1.0 + interest), -(1.0 + repayment_no - period)));
        interest_repayment = total_repayment - principal_repayment;

        return { principal_repayment: principal_repayment, interest_repayment: interest_repayment };
    },

    calculateRepayment: function (principal, interest, n) {

        // calculates the total fixed payment per period (pmt) (weekly, fortnightly, monthly)

        // interest: interest rate for a period (eg if monthly interest = interest/12)
        // n = total number of payments (eg if monthly n = years x 12)

        // see wikipedia amortization
        // http://en.wikipedia.org/wiki/Amortization_calculator			
        // or http://www.ext.colostate.edu/pubs/farmmgt/03757.html			
        // get number of repayments and interest for each repayment			
        // http://invested.com.au/71/rental-yield-2659/	
        // calculate repayment for this time period
        // http://www.hughchou.org/calc/formula.html	

        var repayment = (interest * principal) / (1.0 - Math.pow((1.0 + interest), -n));
        var total_interest = repayment * n - principal;
        var total_principal = repayment * n;

        return { repayment: repayment, total_principal: total_principal, total_interest: total_interest };
    },

    // http://www.mohaniyer.com/old/js.htm

    calculateRepayment2: function (principal, interest, n, repayment_type) {

        var repayment = 0;
        var total_interest = 0;

        if (repayment_type == app.INTEREST_ONLY) {
            repayment = principal * interest;
            total_interest = repayment * n;
        }
        else {
            // see wikipedia amortization
            // http://en.wikipedia.org/wiki/Amortization_calculator			
            // or http://www.ext.colostate.edu/pubs/farmmgt/03757.html			
            // get number of repayments and interest for each repayment			
            // http://invested.com.au/71/rental-yield-2659/	
            // calculate repayment for this time period
            // http://www.hughchou.org/calc/formula.html	

            repayment = (interest * principal) / (1 - Math.pow((1 + interest), -n));
            total_interest = repayment * n - principal;
        }

        return { repayment: repayment, total_interest: total_interest };
    },

    //periodRepayment: function (rate, pmt, pv, per) {

    //    var interest_payment = 0;
    //    var principal_payment = 0;
    //    var a = pv;

    //    for (var i = 0; i <= per; i++) {
    //        interest_payment = a * rate;
    //        principal_payment = pmt - interest_payment;
    //        a -= principal_payment;
    //    }

    //    return { principal_payment: principal_payment, interest_payment: interest_payment };
    //},

    drawCanvasChart: function (series, self) {

        // Get context with jQuery - using jQuery's .get() method.
        var ctx = self.$(".canvas").get(0).getContext("2d");
        // This will get the first returned node in the jQuery collection.
        var myNewChart = new Chart(ctx);

        var len = series[0].data.length;
        var labels = [];

        var dt = new Date();

        var y = dt.getFullYear();

        var step = 5;

        for (var i = 0; i < len; i++) {
            //if (i % step == 0)
            labels.push(y + i);
            //else
            //labels.push("");
        }

        var data = {
            labels: labels, //["January", "February", "March", "April", "May", "June", "July"],   //x axis
            name: "loan repayment",
            datasets: [
                {
                    label: series[0].name,
                    lineColor: "#00f",
                    fillColor: app.SERIES_FILL_COLOR1, //"rgba(220,220,220,0.2)",
                    //fillColor: app.SERIES_COLOR1,
                    strokeColor: app.SERIES_STROKE_COLOR1, // "rgba(220,220,220,1)",
                    pointColor: app.SERIES_STROKE_COLOR1, //"rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    //data: [65, 59, 80, 81, 56, 55, 40]      // y values
                    data: series[0].data,
                    //showScale: false,
                },
                {
                    label: series[1].name,
                    lineColor: "#f00",
                    fillColor: app.SERIES_FILL_COLOR2, //"rgba(151,187,205,0.2)",
                    //fillColor: app.SERIES_COLOR2,
                    strokeColor: app.SERIES_STROKE_COLOR2, //"rgba(151,187,205,1)",
                    pointColor: app.SERIES_STROKE_COLOR2, //"rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    //data: [28, 48, 40, 19, 86, 27, 90]      // y values
                    data: series[1].data,
                    //showScale: false
                }
            ]
        };

        var legendTemplate = "<ul class=\"<%=name.toLowerCase()%>-legend\">" +
            "<% for (var i=0; i<datasets.length; i++){%>" +
            "<li>" +
            "<div class=\"box\" style=\"background-color:<%=datasets[i].strokeColor%>\"></div>" +
            "<span style=\"color:<%=datasets[i].strokeColor%>\">" +
            "</span><%if(datasets[i].label){%><%=datasets[i].label%><%}%>" +
            "</li>" +
            "<%}%>" +
            "</ul>";

        var options = {
            name: "robert",
            pointDot: false,
            scaleFontSize: 10,
            legendTemplate: legendTemplate
        };

        var myLineChart = new Chart(ctx).Line(data, options);

        var str = myLineChart.generateLegend();

        self.$(".legend").html(str);
    },

    drawGoogleChart: function (arr, scale, title) {

        var data = new google.visualization.DataTable();

        data.addColumn('number', 'years');
        data.addColumn('number', title[0]);
        data.addColumn('number', title[1]);

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].y1 < 0)
                arr[i].y1 = 0;

            if (arr[i].y2 < 0)
                arr[i].y2 = 0;

            data.addRow([i / scale, arr[i].y1 / 1000, arr[i].y2 / 1000]);
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

        var chart = new google.visualization.AreaChart($(".chart")[0]);
        chart.draw(data, options);
    },

    validateNumericInput: function (e) {

        // numeric chars only

        // 46: .
        // 110: n
        // 48: 0
        // 57: 9

        if ($.inArray(e.keyCode, [46, app.KEY_BACKSPACE, app.KEY_TAB, app.KEY_ESCAPE, app.KEY_ENTER, 110, 190]) !== -1 ||            // Allow: backspace, delete, tab, escape, enter and .

            (e.keyCode == 65 && e.ctrlKey === true) ||                              // Allow: Ctrl+A

            (e.keyCode >= 35 && e.keyCode <= 39))                                   // Allow: home, end, left, right
        {
            // let it happen, don't do anything

            //if (e.keyCode == app.KEY_ENTER)                                         // catch enter key on input fields
                //this.inputFocusOut(e);

            return;
        }

        // Ensure that it is a number and stop the keypress

        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105))
            e.preventDefault();
    },
}