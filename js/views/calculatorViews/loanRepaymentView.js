var app = app || {};

app.LoanRepaymentView = app.BaseView.extend({

    className: 'loan-repayment-view',

    template: _.template($('#loan-repayment-template').html()),

    initialize: function (options) {

        this.first_time = true;
    },

    render: function () {

        this.$el.html(this.template());

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

    validateNumericInput: function(e)
    {
        return app.validateNumericInput(e);
    },

    getInputs: function () {
        return {
            loan_amount: getVal(this.$(".loan-amount")),
            loan_term: getVal(this.$(".loan-term")),
            interest_rate: getVal(this.$(".interest-rate")),
            repayment_frequency: parseInt(this.$(".repayment-frequency").val()),
            repayment_type: this.$(".repayment-type").val()
        };
    },

    redraw: function()
    {
        var inputs = this.getInputs();
                
        var interest = inputs.interest_rate / 100.0;
        var scale = 0;

        this.$(".period-repayment-label").html(app.frequency_name[inputs.repayment_frequency] + " repayments:");
                
        switch (inputs.repayment_frequency)
        {
        case app.FREQUENCY_WEEKLY:        scale = app.WEEKS_PER_YEAR; break;
        case app.FREQUENCY_FORTNIGHTLY:   scale = app.FORTNIGHTS_PER_YEAR; break;
        default:                        scale = app.MONTHS_PER_YEAR; break;
        }

        interest = interest / scale;
        var n = inputs.loan_term * scale;
        
        var res = app.calculateRepayment2(inputs.loan_amount, interest, n, inputs.repayment_type);
        this.$(".period-repayment").html(format(res.repayment, "C"));
                
        this.$(".total-interest").html(format(res.total_interest, "C"));

        this.$(".total-amount").html(format(inputs.loan_amount + res.total_interest, "C"));

                
        var arr = [];
        var p = inputs.loan_amount;
        var a = p + res.total_interest;
        var data = { principal: [], total: [] };
        var t = res.repayment;

        var series = [{ name: "principal", data: [] }, { name: "total", data: [] }];
        
        for (var i = 0; i <= n; i++)
        {
            if (inputs.repayment_type == app.INTEREST_ONLY)
            {
                if (i == 0 || i % scale == 0 || i == n) {
                    
                    series[0].data.push((p ).toFixed(2));
                    series[1].data.push((a ).toFixed(2));

                    //arr[i] = { principal: p, total: a };
                }            
            }
            else
            {
                arr[i] = app.calculatePeriodRepayment(t, interest, n, i);

                if (i == 0 || i % scale == 0 || i == n) {
                    
                    series[0].data.push((p ).toFixed(2));
                    series[1].data.push((a ).toFixed(2));

                    //arr[i].principal = p;
                    //arr[i].total = a;                    
                }

                p -= arr[i].principal_repayment;               
            }

            a -= t;
        }
        
        this.drawChart(series, scale);
        //this.drawChart(arr, scale);
        
        this.result = [];

        this.result.push({key: "Loan Repayment", value: ""});
        this.result.push({key: "loan amount", value: format(inputs.loan_amount, "C") });
        this.result.push({key: "interest rate", value: inputs.interest_rate + "%"});
        this.result.push({key: "loan term", value: inputs.loan_term + " years"});
        this.result.push({ key: "repayment frequency", value: app.frequency_name[inputs.repayment_frequency] });
        this.result.push({key: "repayment type", value: inputs.repayment_type});        
        this.result.push({ key: "payments", value: format(res.repayment, "C") });
        this.result.push({ key: "total interest", value: format(res.total_interest, "C") });
    },

    drawChart: function (arr, scale) {

        app.drawCanvasChart(arr, this);
        return;

        this.drawGoogleChart(arr, scale);
        return;
               
        var data = new google.visualization.DataTable();
        
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

        var opts = {
              "dataFormatX": function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
              "tickFormatX": function (x) { return d3.time.format('%A')(x); }
            };

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
        var step = parseInt(arr.length / 10);

        var data = new google.visualization.DataTable();

        data.addColumn('number', 'years');
        data.addColumn('number', 'principal');
        data.addColumn('number', 'total');

        var miny = 10000000; maxy = 0;
                     
        for (var i = 0, len = arr.length; i < len; i += step)
        {
            if (arr[i].principal < 0)
                arr[i].principal = 0;
                
            if (arr[i].total < 0)
                arr[i].total = 0;

            var y1 = arr[i].principal / 1000;
            var y2 = arr[i].total / 1000;

            if (y1 < miny)
                miny = y1;

            if (y2 < miny)
                miny = y2;

            if (y1 > maxy)
                maxy = y1;

            if (y2 < maxy)
                maxy = y2;

            data.addRow([i / scale, y1, y2]);

            if (i + step >= len)
                data.addRow([i/scale, y1, y2]);
        }

        this.chart_options = {
            //title: 'Amount Owing',
            //backgroundColor: "#eee",
            colors: ['#F7C244','#E4E4E4'],
            //colors:['#A2C180','#3D7930','#FFC6A5','#FFFF42','#DEF3BD','#00A5C6','#DEBDDE','#000000'],
            hAxis: {title: 'Years'},
            //vAxis: {title: 'Amount Owing', format:'$#K', minValue: 0,, titleTextStyle: { fontSize: 12 }},
            vAxis: {title: 'Amount Owing', format:'$#K'},
            legend: {position: 'bottom'},
            animation: { duration: 500, easing: 'out', },
            vAxis: {minValue:miny, maxValue:maxy}
        };

        if (this.first_time)
            this.chart = new google.visualization.AreaChart(this.$(".chart")[0]);

        this.first_time = false;

        this.chart.draw(data, this.chart_options);

        //var minx = _.min(_.map(arr, function(o) { return num * 3; });)
    },

    startListening: function()
    {
        var self = this;
/*
        self.$( ".loan-amount-slider" ).slider({ min: 1000, max: 5000000, step: 5000, range: "min", animate: "true", value: 100000,
                slide: function( event, ui ) {
                    self.$( ".loan-amount" ).val( addCommas(ui.value) );
                },
                stop: function( event, ui ) {
                    self.$( ".loan-amount" ).val( addCommas(ui.value) );
                    self.redraw();
                }
        });
            
        self.$( ".interest-rate-slider" ).slider({ min: 0.25, max: 25.0, step: 0.1, range: "min", animate: "true", value: 7.25,
                slide: function( event, ui ) {
                    self.$( ".interest-rate" ).val( ui.value );
                },  
                stop: function( event, ui ) {
                    self.$( ".interest-rate" ).val( ui.value );
                    self.redraw();
                }       
         });
        
        self.$( ".loan-term-slider" ).slider({ min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25,
                slide: function( event, ui ) {
                    self.$( ".loan-term" ).val( ui.value );
                },  
                stop: function( event, ui ) {
                    self.$( ".loan-term" ).val( ui.value );
                    self.redraw();
                }   
         });
*/         
        self.$(".loan-amount").change(function() {

            self.redraw();       
            //var v = getVal(self.$(".loan-amount"));
            //self.$( ".loan-amount-slider" ).slider({ value: v });
        });  
         
        self.$(".interest-rate").change(function() {
            
            self.redraw();       
            //var v = getVal(self.$(".interest-rate"));
            //self.$( ".interest-rate-slider" ).slider({ value: v });      
        }); 
         
        self.$(".loan-term").change(function() {

            self.redraw();
            //var v = getVal(self.$(".loan-term");
            //self.$( ".loan-term-slider" ).slider({ value: v });      
        }); 
                 
        self.$(".repayment-frequency").change(function() {
            self.redraw();
        });

        self.$(".repayment-type").change(function() {
            self.redraw();
        });
    }

});