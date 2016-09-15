var app = app || {};

app.ExtraRepaymentView = Backbone.View.extend({

    className: 'extra-repayment-view',

    template: _.template($('#extra-repayment-template').html()),

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
            loan_term: getVal(this.$(".loan-term")),
            interest_rate: getVal(this.$(".interest-rate")),
            repayment_frequency: repayment_frequency,
            extra_contribution: getVal(this.$(".extra-contribution")),
            extra_contribution_start: getVal(this.$(".extra-contribution-start"))
        };
    },
		
    drawChart: function(arr, scale) {
		
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

        for (var i = 0, len = arr.length; i < len; i += step)
        {
            this.addPoint(data, arr, i, scale);

            if (i+step >= len)
                this.addPoint(data, arr, len-1, scale);
        }
/*
        var opts = {
              "dataFormatX": function (x) { return d3.time.format('%Y-%m-%d').parse(x); },
              "tickFormatX": function (x) { return d3.time.format('%A')(x); }
            };
*/
        var myChart = new xChart('line', data, '.chart');        
    },

    addPoint: function (data, arr, i, scale) {

        var o = arr[i];

        if (o.original < 0)
            o.original = 0;

        if (o.extra < 0)
            o.extra = 0;

        data.main[0].data.push({ x: i / scale, y: arr[i].original / 1000 });
        data.main[1].data.push({ x: i / scale, y: arr[i].extra / 1000 });
    },

    drawGoogleChart: function(arr, scale)
    {        
	    var data = new google.visualization.DataTable();
		
    	data.addColumn('number', 'years');
		data.addColumn('number', 'original');
		data.addColumn('number', 'extra');
    					
		for (var i = 0; i < arr.length; i++)
		{
			if (arr[i].original < 0) 
				arr[i].original = 0;
				
			if (arr[i].extra < 0)
				arr[i].extra = 0;				
				
			data.addRow([i/scale, arr[i].original/1000, arr[i].extra/1000]);
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
		 
		self.$( ".extra-contribution-slider" ).slider({ min: 0, max: 5000, step: 10, range: "min", animate: "true", value: 100,
				slide: function( event, ui ) {
					self.$( ".extra-contribution" ).val( ui.value );
				},	
				stop: function( event, ui ) {
					self.$( ".extra-contribution" ).val( ui.value );
					self.redraw();
				}	
		 });
		 
		self.$( ".extra-contribution-start-slider" ).slider({ min: 0, max: 25, step: 0.5, range: "min", animate: "true", value: 5,
				slide: function( event, ui ) {
					self.$( ".extra-contribution-start" ).val( ui.value );
				},	
				stop: function( event, ui ) {
					self.$( ".extra-contribution-start" ).val( ui.value );
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
			//var v = getVal(self.$(".loan_term"));
			//self.$( ".loan-term-slider" ).slider({ value: v });		
		});	
				 
		self.$(".repayment-frequency").change(function() {
			self.redraw();
		});
		
		self.$(".extra-contribution").change(function() {

			self.redraw();		
			//var v = getVal(self.$(".extra-contribution"));
			//self.$( ".extra-contribution-slider" ).slider({ value: v });		
		});	
		
		self.$(".extra-contribution-start").change(function() {

			self.redraw();		
			//var v = getVal(self.$(".extra-contribution-start"));
			//self.$( ".extra-contribution-start-slider" ).slider({ value: v });		
		});		
	},	 
	
	redraw: function()
	{
		var inputs = this.getInputs();
				
		var interest = inputs.interest_rate / 100.0;
		var scale;

		this.$(".label1").html("Minimum " + inputs.repayment_frequency + " repayments:");
		this.$(".label2").html("Increased " + inputs.repayment_frequency + " repayments:");
				
		switch (inputs.repayment_frequency)
		{
		    case "weekly": scale = app.WEEKS_PER_YEAR; break;
            case "fortnightly": scale = app.FORTNIGHTS_PER_YEAR; break;
		    default: scale = app.MONTHS_PER_YEAR; break;
		}

		interest /= scale;
		var n = inputs.loan_term * scale;                       // number of payments
		var n2 = inputs.extra_contribution_start * scale;		// start after n payments

	    //-----------------------------------------------------------------------------
        // min monthly payment
		
		var res = app.calculateRepayment(inputs.loan_amount, interest, n);	
		this.$(".min-monthly-repayment").html(format(res.repayment, "C"));
		var pmt1 = res.repayment;	    
		var nper1 = n;

	    // ----------------------------------------------------------------------------
        // original total

		var a = app.total(interest, nper1, pmt1, inputs.loan_amount);
		this.$(".original-total").html(format(a.total_principal + a.total_interest, "C"));

	    //------------------------------------------------------------------------------
	    // increased monthly payment

		var x = pmt1 + inputs.extra_contribution;
		this.$(".increased-monthly-repayment").html(format(x, "C"));

	    //-----------------------------------------------------------------------------
        // updated total		

		var pmt2 = pmt1 + inputs.extra_contribution;		
		var t = app.total(interest, n2, pmt1, inputs.loan_amount);		
		var nper2 = n - n2;
		
		var b = app.total(interest, nper2, pmt2, t.principal_remaining);		
		
		this.$(".updated-total").html(format(b.total_principal + b.total_interest + t.total_principal + t.total_interest, "C"));

	    //--------------------------------------------------------------------------------------------
	    // interest saved

		var interest_saved = a.total_interest - (t.total_interest + b.total_interest);
		this.$(".interest-saved").html(format(interest_saved, "C"));

	    //--------------------------------------------------------------------------------------------
	    // updated time

		var years2 = (t.payment_no + b.payment_no) / scale;
		var months2 = (years2 - Math.floor(years2)) * 12.0;

		this.$(".updated-time").html(Math.floor(years2) + " years, " + Math.floor(months2) + " months");

	    //--------------------------------------------------------------------------------------------
	    // time saved
			
		var years_saved = inputs.loan_term - years2;
		var months_saved = 12 - Math.floor(months2);

		this.$(".time-saved").html(Math.floor(years_saved) + " years, " + months_saved + " months");

	    //--------------------------------------------------------------------------------------------
        // chart data

		var series = [{ name: "original", data: [] }, { name: "extra", data: [] }];

		var p1 = inputs.loan_amount;
		var p2 = inputs.loan_amount;

		for (var i = 0; i <= nper1; i++) {
		    var v = app.calculatePeriodRepayment(pmt1, interest, nper1, i);

		    if (i == 0 || i % scale == 0 || i == n)
		        series[0].data.push(p1);

		    p1 -= v.principal_repayment;

		    if (i >= n2) {
		        var u = app.calculatePeriodRepayment(pmt2, interest, nper2, i - n2);

		        if (i == 0 || i % scale == 0 || i == n) {

		            if (p2 > 0)
		                series[1].data.push(p2);
		            else
		                series[1].data.push(0);
		        }

		        p2 -= u.principal_repayment;
		    }
		    else {
		        if (i == 0 || i % scale == 0 || i == n) {

		            if (p1 > 0)
		                series[1].data.push(p1);
		            else
		                series[1].data.push(0);
		        }

		        p2 -= v.principal_repayment;
		    }
		}

		app.drawCanvasChart(series, this);

	    //--------------------------------------------------------------------------------------------
		
		this.result = [];
		
		this.result.push({key: "Extra Repayments", value: ""});
		this.result.push({key: "loan amount", value: format(inputs.loan_amount, "C")});
		this.result.push({key: "interest rate", value: inputs.interest_rate});
		this.result.push({key: "loan term", value: inputs.loan_term});
		this.result.push({key: "repayment frequency", value: inputs.repayment_frequency});
		this.result.push({key: "extra contribution", value: format(inputs.extra_contribution, "C")});
		this.result.push({key: "extra contribution start", value: inputs.extra_contribution_start + " after years\r\n"});		
		
		this.result.push({key: "Minimum monthly repayments", value: format(res.repayment, "C")});
		this.result.push({key: "Increased monthly repayments", value: format(x, "C")});
		this.result.push({key: "Time saved", value: Math.floor(years_saved) + " years, " + Math.round(months_saved) + " months"});
		this.result.push({key: "Interest saved", value: format(interest_saved, "C")});			
	}

});