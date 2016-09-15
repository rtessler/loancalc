var app = app || {};

app.BorrowingPowerView = app.BaseView.extend({

    className: 'borrowing-power-view',

    template: _.template($('#borrowing-power-template').html()),

    initialize: function (options) {

    },

    render: function () {

        this.$el.html(this.template());

        this.startListening();

        return this;
    },

    postRender: function()
    {
        this.redraw();
        this.setMonthlyExpenses();
    },

    events: {
        'keydown input': 'validateNumericInput'
    },

    validateNumericInput: function (e) {
        return app.validateNumericInput(e);
    },

    getInputs: function () {
        var joint_income = this.$('.joint-income').is(":checked");
        var dependents = getInt(this.$('.dependents'));

        var net_salary_frequency1 = getInt(this.$(".net-salary-frequency1"));
        var net_salary1 = getVal(this.$(".net-salary1"));

        var net_salary_frequency2 = getInt(this.$(".net-salary-frequency2"));
        var net_salary2 = getVal(this.$(".net-salary2"));

        var other_net_income_frequency = getInt(this.$(".other-net-income-frequency"));
        var other_net_income = getVal(this.$(".other-net-income"));

        max_income_percent_available = getVal(this.$(".max-income-percent-available"));
        var max_income_percent_available_default = this.$('.max-income-available-default:checked').val();

        var monthly_expenses = getVal(this.$(".monthly-expenses"));

        var monthly_expenses_default = this.$('.monthly-expenses-default').is(":checked");

        var car_loan = getVal(this.$(".car-loan"));
        var credit_card = getVal(this.$(".credit-card"));

        var other_monthly_payments = getVal(this.$(".other-monthly-payments"));

        var interest_rate = getVal(this.$(".interest-rate"));
        var loan_term = getVal(this.$(".loan-term"));
        var interest_rate_buffer = getVal(this.$(".interest-rate-buffer"));
        var interest_rate_buffer_default = this.$('.interest-rate-buffer-default:checked').val();

        var repayment_frequency = getInt(this.$(".repayment-frequency"));

        var res = {
            joint_income: joint_income,
            dependents: dependents,

            net_salary_frequency1: net_salary_frequency1,
            net_salary1: net_salary1,

            net_salary_frequency2: net_salary_frequency2,
            net_salary2: net_salary2,

            other_net_income_frequency: other_net_income_frequency,
            other_net_income: other_net_income,

            max_income_percent_available: max_income_percent_available,
            max_income_percent_available_default: max_income_percent_available_default,

            monthly_expenses: monthly_expenses,
            monthly_expenses_default: monthly_expenses_default,

            car_loan: car_loan,
            credit_card: credit_card,

            other_monthly_payments: other_monthly_payments,

            car_loan: car_loan,
            credit_card: credit_card,

            interest_rate: interest_rate,
            loan_term: loan_term,
            interest_rate_buffer: interest_rate_buffer,
            interest_rate_buffer_default: interest_rate_buffer_default,

            repayment_frequency: repayment_frequency
        };

        debug(res);

        return res;
    },
    
    getMonthlyValue: function(f, val)
    {
        switch (f) {
            case app.FREQUENCY_ANNUAL: val /= 12.0; break;
            case app.FREQUENCY_WEEKLY: val *= app.WEEKS_PER_YEAR / 12.0; break;
            case app.FREQUENCY_FORTNIGHTLY: val *= app.FORTNIGHTS_PER_YEAR / 12.0;  break;
        }
        
        return val;     
    }, 

    setMonthlyExpenses: function()
    {
        var joint_income = this.$(".joint-income").is(":checked");
        var dependents = getVal(this.$(".dependents"));
        
        var monthly_expenses_default = this.$('.monthly-expenses-default').is(":checked");
        
        if (!monthly_expenses_default)
            return;
        
        var monthly_expenses = "";
        
        if (!joint_income)
        {
            switch (dependents)
            {
            case 0: monthly_expenses = 15624/12; break;
            case 1: monthly_expenses = 21459/12; break;
            case 2: monthly_expenses = 26980/12; break;
            case 3: monthly_expenses = 32500/12; break;
            case 4: monthly_expenses = 38021/12; break;
            }
        }
        else
        {
            switch (dependents)
            {
            case 0: monthly_expenses = 22715/12; break;
            case 1: monthly_expenses = 28235/12; break;
            case 2: monthly_expenses = 33756/12; break;
            case 3: monthly_expenses = 39277/12; break;
            case 4: monthly_expenses = 44736/12; break;
            }           
        }
        
        this.$('.monthly-expenses').val(addCommas(monthly_expenses));
    },  

    redraw: function()
    {
        var inputs = this.getInputs();
        var scale;

        switch (inputs.repayment_frequency) {
            case app.FREQUENCY_WEEKLY: scale = app.WEEKS_PER_YEAR; break;
            case app.FREQUENCY_FORTNIGHTLY: scale = app.FORTNIGHTS_PER_YEAR; break;
            default: scale = app.MONTHS_PER_YEAR; break;
        }

        var interest = (inputs.interest_rate + inputs.interest_rate_buffer) / 100.0;

        debug("interest = " + interest);
        interest /= 12.0;   // monthly interest

        var net_salary1 = this.getMonthlyValue(inputs.net_salary_frequency1, inputs.net_salary1);
        var net_salary2 = this.getMonthlyValue(inputs.net_salary_frequency2, inputs.net_salary2);
        var other_net_income = this.getMonthlyValue(inputs.other_net_income_frequency, inputs.other_net_income);
        
        var monthly_expenses = inputs.monthly_expenses + inputs.car_loan + inputs.credit_card + inputs.other_monthly_payments;
        var monthly_salary = net_salary1 + net_salary2 + other_net_income;

        var monthly_available = ((inputs.max_income_percent_available / 100.0) * monthly_salary) - monthly_expenses;
        
        var n = inputs.loan_term * 12.0;
        
        // http://www.infobarrel.com/Financial_Math%3A__How_Much_Can_I_Afford_to_Borrow%3F
        
        var loan_amount = (monthly_available / interest) * (( Math.pow((1.0 + interest), n) - 1.0 ) / ( Math.pow((1.0 + interest), n) ));
        
        loan_amount -= loan_amount % 1000;     // round down to nearest thousand
        
        var normal_interest = ((inputs.interest_rate ) / 100.0) / 12;
                    
        var pmt = app.PMT(normal_interest, n, loan_amount, 0);
        
        this.$(".res1").html(format(loan_amount, "C"));
        this.$(".res2").html(format(pmt, "C"));       
            
        var arr = [];  
            
        var principal = loan_amount;
        var total = loan_amount + app.total(normal_interest, n, pmt, loan_amount).total_interest;

        debug("max_income_percent_available = " + inputs.max_income_percent_available);
        debug("monthly_available = " + monthly_available);
        debug("monthly salary = " + monthly_salary);
        debug("monthly_expenses = " + monthly_expenses);
        debug("principal = " + principal);
        debug("loan_amount = " + loan_amount);
        debug("normal_interest = " + normal_interest);

        var series = [{ name: "total", data: [] }, { name: "principal", data: [] }];
        
        for (var i = 0; i < n; i++)
        {
            var interest_payment = principal * normal_interest;
            var principal_payment = pmt - interest_payment;
                        
            //arr.push({principal: principal, total: total});

            if (i == 0 || i % scale == 0 || i == n) {

                series[0].data.push(principal);
                series[1].data.push(total);
            }
            
            principal -= principal_payment; 
            total -= pmt;
        }       
        
        app.drawCanvasChart(series, this);

        //this.drawChart(arr,12);
                
        this.result = [];

        this.result.push({key: "Borrowing Power", value: ""});
        this.result.push({key: "joint income", value: inputs.joint_income ? "true" : "false"});
        this.result.push({key: "dependents", value: inputs.dependents });
                        
        this.result.push({key: "net_salary_frequency1", value: inputs.net_salary_frequency1});
        this.result.push({key: "net_salary1", value: format(inputs.net_salary1, "C")});
        
        this.result.push({key: "net_salary_frequency2", value: inputs.net_salary_frequency2});
        this.result.push({key: "net_salary2", value: format(inputs.net_salary2, "C")});
        
        this.result.push({key: "monthly expenses", value: format(inputs.monthly_expenses, "C")});        
        this.result.push({key: "car loan", value: format(inputs.car_loan, "C")});
        this.result.push({key: "credit card", value: format(inputs.credit_card, "C")});    
        this.result.push({key: "other payments", value: format(inputs.other_monthly_payments, "C")});
        this.result.push({ key: "max percent income available", value: format(inputs.max_income_percent_available, "C") });
                

        this.result.push({key: "interest rate", value: inputs.interest_rate + "%"});
        this.result.push({key: "loan term", value: inputs.loan_term + " years"});
        this.result.push({key: "total interest:", value: inputs.interest_rate_buffer + "%"});
        
        this.result.push({key: "you can borrow", value: format(loan_amount, "C") }); 
        this.result.push({key: "repayments", value: format(pmt, "C") }); 
    },

    drawChart: function (arr, scale) {

        this.drawGoogleChart(arr, scale);
        return;
       
        //thin out the data

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

        for (var i = 0, len = arr.length; i < len; i += step)
        {
            this.addPoint(data, arr, i, scale);

            if (i+step >= len)
                this.addPoint(data, arr, len-1, scale);
        }

        var myChart = new xChart('line', data, '.chart');
    },

    addPoint: function(data, arr, i, scale)
    {
        var o = arr[i];

        if (o.principal < 0)
            o.principal = 0;
            
        if (o.total < 0)
            o.total = 0;

        data.main[0].data.push({x: i/scale, y: o.principal/1000});
        data.main[1].data.push({x: i/scale, y: o.total/1000});
    },

    drawGoogleChart: function(arr, scale)
    {
        var data = new google.visualization.DataTable();
        
        data.addColumn('number', 'years');
        data.addColumn('number', 'principal');
        data.addColumn('number', 'total');
                        
        for (var i = 0; i < arr.length; i++)
        {
            if (arr[i].principal < 0)
                arr[i].principal = 0;
                
            if (arr[i].total < 0)
                arr[i].total = 0;

            debug(arr[i].principal);
                
            data.addRow([i/scale, arr[i].principal/1000, arr[i].total/1000]);
        }

        var options = {
          title: 'Amount Owing',
          backgroundColor: "#eee",
          colors: ['#F7C244','#E4E4E4'],
          colors:['#A2C180','#3D7930','#FFC6A5','#FFFF42','#DEF3BD','#00A5C6','#DEBDDE','#000000'],
          hAxis: {title: 'Years'},
          vAxis: {title: 'Amount Owing', format:'$#K', minValue: 0, titleTextStyle: { fontSize: 12 }},
          vAxis: {title: 'Amount Owing', format:'$#K'},
          legend: {position: 'bottom'},
          animation: { duration: 1000, easing: 'out', }
        };

        var chart = new google.visualization.AreaChart(this.$(".chart")[0]);
        chart.draw(data, options);

        //var minx = _.min(_.map(arr, function(o) { return num * 3; });)
    },

    

    startListening: function()
    {
        var self = this;

        self.$( ".interest-rate-slider" ).slider({ min: 0.25, max: 25, step: 0.1, range: "min", animate: "true", value: 7.25,
                slide: function( event, ui ) {
                    self.$( ".interest-rate" ).val( ui.value );
                },  
                stop: function( event, ui ) {
                    self.$( ".interest-rate" ).val( ui.value );
                    self.redraw();
                }       
         }); 
         
        self.$( ".loan-term-slider" ).slider({ min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25.0,
                slide: function( event, ui ) {
                    self.$( ".loan-term" ).val( ui.value );
                },  
                stop: function( event, ui ) {
                    self.$( ".loan-term" ).val( ui.value );
                    self.redraw();
                }   
         });         
         
        self.$(".interest-rate").change(function() {

            self.redraw();       
            var v = getVal(self.$(".interest-rate"));   
            self.$( ".interest-rate-slider" ).slider({ value: v });
        });  
         
        self.$(".loan-term").change(function() {
            
            self.redraw();       
            var v = getVal(self.$(".loan-term"));
            self.$( ".loan-term-slider" ).slider({ value: v });      
        }); 
        
        self.$(".dependents").change(function() {
            
            self.setMonthlyExpenses();
            self.redraw();
        });     
        
        self.$(".net-salary-frequency1").change(function() {
            self.redraw();
        }); 
        
        self.$(".net-salary1").change(function() {
            self.redraw();
        });     
        
        self.$(".net-salary-frequency2").change(function() {
            self.redraw();
        });
        
        self.$(".net-salary2").change(function() {
            self.redraw();
        }); 
        
        self.$(".other-net-income-frequency").change(function() {
            self.redraw();
        });
        
        self.$(".other-net-income").change(function() {
            self.redraw();
        }); 
        
        self.$(".other-payments-frequency").change(function() {
            self.redraw();
        });     
        
        self.$(".joint-income").click(function() {
            
            var joint_income = self.$('.joint-income').is(":checked");
            
            if (joint_income)
            {
                self.$(".net-salary2").removeAttr('readonly');
                self.$(".net-salary2").removeClass("readonly");
                self.$(".net-salary-frequency2").removeAttr('disabled');

            } else {
                self.$(".net-salary2").attr('readonly', true);
                self.$(".net-salary2").addClass("readonly");
                self.$(".net-salary-frequency2").attr('disabled', 'disabled');
                self.$(".net-salary2").val(0);

            }
            
            self.setMonthlyExpenses();
            
            self.redraw();
        }); 
        
        self.$(".max-income-available-default").click(function() {
            
            var max_income_percent_available_default = self.$('.max-income-percent-available-default:checked').val();
            
            if (!max_income_percent_available_default)
            {
                self.$(".max-income-percent-available").removeAttr('readonly');
                self.$(".max-income-percent-available").removeClass("readonly");

            } else {
                self.$(".max-income-percent-available").attr('readonly', true);
                self.$(".max-income-percent-available").addClass("readonly");
            }
            
            self.redraw();
        }); 
        
        self.$(".monthly-expenses-default").click(function() {
            
            var monthly_expenses_default = self.$('.monthly-expenses-default').is(":checked");
            
            if (!monthly_expenses_default)
            {
                self.$(".monthly-expenses").removeAttr('readonly');
                self.$(".monthly-expenses").removeClass("readonly");
            } else {
                self.$(".monthly-expenses").attr('readonly', true);
                self.$(".monthly-expenses").addClass("readonly");
            }
            
            self.setMonthlyExpenses();
        
            self.redraw();
        }); 
        
        self.$(".interest-rate-buffer-default").click(function() {
            
            var interest_rate_buffer_default = self.$('.interest-rate-buffer-default:checked').val();
            
            if (!interest_rate_buffer_default)
            {
                self.$(".interest-rate-buffer").removeAttr('readonly');
                self.$(".interest-rate-buffer").removeClass("readonly");
            } else {
                self.$(".interest-rate-buffer").attr('readonly', true);
                self.$(".interest-rate-buffer").addClass("readonly");
            }
            
            self.redraw();
        });

        self.$(".repayment-frequency").change(function () {
            self.redraw();
        });
    }
});