(function( $ ) {
  $.fn.splitLoanCalculator = function(html, baseurl, loancalc) {	
	
	//var WEEKS_PER_YEAR = 52.177457;
	var WEEKS_PER_YEAR = 52.0;
	var FORTNIGHTS_PER_YEAR = 26.0;
	var MONTHS_PER_YEAR = 12;	
	
	var PRINCIPAL_AND_INTEREST = 1;
	var INTEREST_ONLY = 2;	
	
	var result = new Array();
	
	this.html(html);
	loancalc.changeImages(baseurl);
	
	//this.load("extra_repayment.html", function() {
		
      function drawChart(arr, scale) {
		
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

        var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }			

	function get_inputs()
	{
		var loan_amount = removeCommas($("#loan_amount").val());
		loan_amount = parseFloat(loan_amount);	
		
		var fixed_portion = parseFloat($("#fixed_portion").val());	
		var fixed_period = parseFloat($("#fixed_period").val());	
		var fixed_interest_rate = parseFloat($("#fixed_interest_rate").val());	
		var variable_interest_rate = parseFloat($("#variable_interest_rate").val());		
		var loan_term = parseFloat($("#loan_term").val());
	
		var repayment_frequency = $("#repayment_frequency").val();	
				
		if ( isNaN(loan_amount) )
			loan_amount = 0;
		
		if ( isNaN(fixed_portion) )
			fixed_portion = 0;
			
		if ( isNaN(fixed_period) )
			fixed_period = 0;
			
		if ( isNaN(fixed_interest_rate) )
			fixed_interest_rate = 0;
			
		if ( isNaN(variable_interest_rate) )
			variable_interest_rate = 0;	
			
		if ( isNaN(loan_term) )
			loan_term = 0;									
			
		return {loan_amount: loan_amount, 
		fixed_portion: fixed_portion, 
		fixed_period: fixed_period, 
		fixed_interest_rate: fixed_interest_rate,
		variable_interest_rate: variable_interest_rate,
		loan_term: loan_term,
		repayment_frequency: repayment_frequency
		};
	}
		
	$( "#loan_amount_slider" ).slider({ min: 1000, max: 5000000, step: 5000, range: "min", animate: "true", value: 100000,
			slide: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
			},
			stop: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
				redraw();
			}
	});
		
	$( "#fixed_portion_slider" ).slider({ min: 0, max: 100, step: 1, range: "min", animate: "true", value: 60,
			slide: function( event, ui ) {
				$( "#fixed_portion" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#fixed_portion" ).val( ui.value );
				redraw();
			}		
	 });
	 
	$( "#fixed_period_slider" ).slider({ min: 0.5, max: 25, step: 0.5, range: "min", animate: "true", value: 3,
			slide: function( event, ui ) {
				$( "#fixed_period" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#fixed_period" ).val( ui.value );
				redraw();
			}		
	 });	 
	
	$( "#fixed_interest_rate_slider" ).slider({ min: 0.5, max: 25, step: 0.5, range: "min", animate: "true", value: 6.80,
			slide: function( event, ui ) {
				$( "#fixed_interest_rate" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#fixed_interest_rate" ).val( ui.value );
				redraw();
			}	
	 });
	 
	$( "#variable_interest_rate_slider" ).slider({ min: 0, max: 25, step: 0.25, range: "min", animate: "true", value: 8.3,
			slide: function( event, ui ) {
				$( "#variable_interest_rate" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#variable_interest_rate" ).val( ui.value );
				redraw();
			}	
	 });
	 
	$( "#loan_term_slider" ).slider({ min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25.0,
			slide: function( event, ui ) {
				$( "#loan_term" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#loan_term" ).val( ui.value );
				redraw();
			}	
	 });	 	 
	 
	$("#loan_amount").change(function() {

		redraw();		
		var v = removeCommas($("#loan_amount").val());
		v = parseFloat(v);		
		$( "#loan_amount_slider" ).slider({ value: v });
	});	 
	 
	$("#fixed_portion").change(function() {
		
		redraw();		
		var v = parseFloat($("#fixed_portion").val());
		$( "#fixed_portion_slider" ).slider({ value: v });		
	});	
	 
	$("#fixed_period").change(function() {

		redraw();		
		var v = parseFloat($("#fixed_period").val());
		$( "#fixed_period_slider" ).slider({ value: v });		
	});	
				 	
	$("#fixed_interest_rate").change(function() {

		redraw();		
		var v = parseFloat($("#fixed_interest_rate").val());
		$( "#fixed_interest_rate_slider" ).slider({ value: v });		
	});	
	
	$("#variable_interest_rate").change(function() {

		redraw();		
		var v = parseFloat($("#variable_interest_rate").val());
		$( "#variable_interest_rate_slider" ).slider({ value: v });		
	});	
	
	$("#loan_term").change(function() {

		redraw();		
		var v = parseFloat($("#loan_term").val());	
		$( "#loan_term_slider" ).slider({ value: v });
	});		
	
	$("#repayment_frequency").change(function() {
		redraw();
	});		
	 
	function calculate(loan_amount, interest, n) 
	{			
		// calculates the total fixed payment per period (weely, fortnightly, monthly)
		
		var principal = loan_amount;															
		var repayment = 0;
		var total_interest = 0;
			
		// see wikipedia amortization
		// http://en.wikipedia.org/wiki/Amortization_calculator			
		// or http://www.ext.colostate.edu/pubs/farmmgt/03757.html			
		// get number of repayments and interest for each repayment			
		// http://invested.com.au/71/rental-yield-2659/	
		// calculate repayment for this time period
		// http://www.hughchou.org/calc/formula.html	
		
		repayment = (interest * principal) / ( 1.0 - Math.pow((1.0 + interest), -n) );						
		total_interest = repayment * n - principal;									
												
		return {repayment: repayment, total_interest: total_interest};													
	}
	
	function calculatePeriodRepayment(total_repayment, interest, repayment_no, period)
	{
		// see http://www.ext.colostate.edu/pubs/farmmgt/03757.html
		
		principal_repayment = total_repayment * ( Math.pow((1.0 + interest), -(1.0 + repayment_no - period) ));
		interest_repayment = total_repayment - principal_repayment;
		
		return {principal_repayment: principal_repayment, interest_repayment: interest_repayment};			
	}
	
	function PeriodRepayment(rate, pmt, pv, per)
	{
		var interest_payment = 0;
		var principal_payment = 0;
		var a = pv;
		
		for (var i = 0; i <= per; i++)
		{
			interest_payment = a * rate;
			principal_payment = pmt - interest_payment;
			a -= principal_payment;
		}
		
		return {principal_payment: principal_payment, interest_payment: interest_payment};
	}	
	
	function TotalInterest(rate, nper, pmt, pv)
	{
		var total_interest = 0;
		var a = pv;
		
		for (var i = 0; i < nper; i++)
		{
			var interest_payment = a * rate;
			var principal_payment = pmt - interest_payment;
			a -= principal_payment;
			
			total_interest += interest_payment;
		}
		
		return total_interest;
	}
	
	function Total(rate, nper, pmt, pv)
	{
		var total_principal = 0;
		var total_interest = 0;
		var a = pv;
		
		for (var i = 0; i < nper; i++)
		{
			var interest_payment = a * rate;
			var principal_payment = pmt - interest_payment;
			a -= principal_payment;
			
			total_principal += principal_payment;
			total_interest += interest_payment;
		}
		
		return {total_principal: total_principal, total_interest: total_interest};
	}	

	
	// http://www.mohaniyer.com/old/js.htm
	
	function NPER(rate, pmt, pv, fv)
	{
		rate = parseFloat(rate);
		pmt = parseFloat(pmt);
		pv = parseFloat(pv);
		
		if (rate == 0)
			return  - (fv + pv)/pmt;
			
		var nper = Math.log((-fv * rate + pmt)/(pmt + rate * pv))/ Math.log(1 + rate);
		
		return Math.ceil(nper);
	}
	
	function PMT(rate, nper, pv, fv)
	{
		rate = parseFloat(rate);
		nper = parseFloat(nper);
		pv = parseFloat(pv);
				
		if (rate == 0)
			return - (fv + pv)/nper;
					
		x = Math.pow(1 + rate,nper);
		var pmt = (rate * (fv + x * pv)) / (-1 + x);

		return pmt;
	}
	

	
	function redraw()
	{
		var inputs = get_inputs();

		var variable_interest = inputs.variable_interest_rate / 100.0;
		var fixed_interest = inputs.fixed_interest_rate / 100.0;
		var s = 0;
				
		if (inputs.repayment_frequency == "weekly")
		{
			variable_interest /= WEEKS_PER_YEAR;	
			fixed_interest /= WEEKS_PER_YEAR;
							
			n = inputs.loan_term * WEEKS_PER_YEAR;
			$("#label3").html("Total weekly repayment:");
			
			s = 52 * inputs.fixed_period;		// start after n weeks
		}
		else
		if (inputs.repayment_frequency == "fortnightly")
		{
			variable_interest /= FORTNIGHTS_PER_YEAR;
			fixed_interest /= FORTNIGHTS_PER_YEAR;
			
			n = inputs.loan_term * FORTNIGHTS_PER_YEAR;	
			$("#label3").html("Total fortnightly repayment:");
			
			s = 26 * inputs.fixed_period;	// start after n fortnights
		}
		else
		{
			variable_interest /= 12.0;
			fixed_interest /= 12.0;
			
			n = inputs.loan_term * 12.0;
			$("#label3").html("Total monthly repayment:");
			
			s = 12 * inputs.fixed_period;	// start after n months		
		}	
			
		var fixed_loan_amount = inputs.loan_amount * inputs.fixed_portion / 100.0;
		var pmt_fixed = PMT(fixed_interest, n, fixed_loan_amount, 0);
		
		var variable_loan_amount = inputs.loan_amount * (100 - inputs.fixed_portion) / 100.0;
		var pmt_variable = PMT(variable_interest, n, variable_loan_amount, 0);
		
		$("#res1").html("$" + addCommas(pmt_fixed.toFixed(0)));
		$("#res2").html("$" + addCommas(pmt_variable.toFixed(0)));
		
		var x = pmt_fixed + pmt_variable;
		$("#res3").html("$" + addCommas(x.toFixed(0)));
		
		var pmt_normal = PMT(variable_interest, n, inputs.loan_amount, 0);
		var total_interest = TotalInterest(variable_interest, n, pmt_normal, inputs.loan_amount);
		$("#res5").html("$" + addCommas(total_interest.toFixed(0)));
		
		var a = Total(fixed_interest, s, pmt_fixed, fixed_loan_amount);
		var b = Total(variable_interest, s, pmt_variable, variable_loan_amount);	
		
		var r =	inputs.loan_amount - a.total_principal - b.total_principal;
		var pmt4 = PMT(variable_interest, n-s, r, 0);
		var c = a.total_interest + b.total_interest + TotalInterest(variable_interest, n-s, pmt4, r);
		
		$("#res4").html("$" + addCommas(c.toFixed(0)));
			
		var arr = new Array();	
	
		var p1 = fixed_loan_amount;
		var p2 = variable_loan_amount;
		var p3 = r;

				
		for (var i = 0; i <= n; i++)
		{			
			arr[i] = {};
						
			if (i < s)
			{				
				var a = calculatePeriodRepayment(pmt_variable, variable_interest, s, i);
				var b = calculatePeriodRepayment(pmt_fixed, fixed_interest, s, i);
				
				arr[i].original = p1;	
				p1 -= a.principal_repayment;	
				
				arr[i].alt = p2;	
				p2 -= b.principal_repayment;							
			}
			else
			{
				var a = calculatePeriodRepayment(pmt4, variable_interest, n-s, i);
				
				arr[i].alt = p3;	
				p3 -= a.principal_repayment;	
				
				arr[i].original = 0;	
				//p2 -= a.principal_repayment;					
			}
			
		}
		
		if (inputs.repayment_frequency == "weekly")
			drawChart(arr,52);
		else
		if (inputs.repayment_frequency == "fortnightly")
			drawChart(arr,26);
		else
			drawChart(arr,12);
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Split Loan", value: ""};
		result[i++] = {key: "loan amount", value:"$" + addCommas(inputs.loan_amount.toFixed(2))};
		result[i++] = {key: "fixed portion", value: inputs.fixed_portion + " %"};
		result[i++] = {key: "fixed period", value: inputs.fixed_period + " yr"};
		result[i++] = {key: "fixed interest rate", value: inputs.fixed_interest_rate + "%"};
		result[i++] = {key: "variable interest rate", value: inputs.variable_interest_rate + "%"};
		result[i++] = {key: "loan term", value: inputs.loan_term + " years"};
		result[i++] = {key: "repayment frequency", value: inputs.repayment_frequency};	
		
		result[i++] = {key: "fixed repayment", value: "$" + addCommas(pmt_fixed.toFixed(0))};
		result[i++] = {key: "variable repayment", value:"$" + addCommas(pmt_variable.toFixed(0))};
		result[i++] = {key: "total monthly repayment", value: "$" + addCommas(x.toFixed(0))};
		result[i++] = {key: "total interest payable", value: "$" + addCommas(c.toFixed(0))};
		result[i++] = {key: "variable interest rate", value: "$" + addCommas(total_interest.toFixed(0))};		
		
	}
	
	$(".info").click(function() {	
		$( "#infodialog" ).html("<h3>Split Loan calculator.</h3><p> The Split Loan Calculator calculates the total interest amount under a variable interest rate for the full loan term compared the same loan having a fixed rate proportion (entered by user) at the start, with the fixed rate and term entered by the user.</p><p> The calculation is done at the repayment frequency entered (monthly, fortnightly or weekly), in respect of the original loan parameters entered, namely amount, annual variable rate and total term in years.</p>");
		
		$( "#infodialog" ).dialog();
	});			
	
	$(".calc .print").click(function() {
		window.print();
	});
	
	$(".calc .save").click(function() {
			
		//var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		var uriContent = "data:application/text," + encodeURIComponent(resultToString(result));
		w = window.open(uriContent, 'loan_repayment.txt');
	});	
	
	$(".calc .email").toggle(function() { 
		var h = $(".calc .outer-container").height();
		$(".calc .outer-container").height(h + 330); 
		$(".calc #email-form").toggle(); 
		$(".calc #message").val(resultToString(result));
		},
	function() { 
		var h = $(".calc .outer-container").height();
		$(".calc .outer-container").height(h - 330); 
		$(".calc #email-form").toggle(); 
	});	
	
	$(".calc #send_email").click(function() {
		
		if (!validateForm())
			return false;
					
		var path = baseurl + "/send_email.php";
		
		var from = $(".calc #from").val();
		var to = $(".calc #to").val();
		var subject = $(".calc #subject").val();
		var message = $(".calc #message").val();
		
		/*
		var datastr ='from=' + from + '&to=' + to + '&subject=' + subject + '&message=' + message;	
		
		$.ajax({
		type: "POST",
		url: path,
		data: datastr,
		cache: false,
		success: function(html){
			$(".calc #email-response").fadeIn("slow");
			$(".calc #email-response").html(html);
			setTimeout('$(".calc #email-response").fadeOut("slow")',4000);
		}
		});		
		*/
				
		$(".calc #email-response").html("<img src='" + baseurl + "/images/ajax-loader2.gif" + "' />");
		
		$.ajax({ url: path,
			 data: {from: from, to: to, subject: subject, message: message},
			 type: 'GET',
			 async: false,
			 contentType: "application/json",
			 dataType: 'jsonp',
			 success: function(output) {
				$(".calc #email-response").fadeIn("slow");
				$(".calc #email-response").html(output.msg);
				setTimeout('$(".calc #email-response").fadeOut("slow")',4000);				
			},
			error: function(e) {
				console.log("AJAX Error: " + e.message);
			}
		});			
		
		return false;
	});
	
	function validateForm()
	{	
		$(".calc #errmsg").html("");
	
		var from = $(".calc #from").val();
		var to = $(".calc #to").val();
		var subject = $(".calc #subject").val();
		var message = $(".calc #message").val();
		
		var errmsg = "";

		if (to == null || to == "")
			errmsg += "friends email address is required<br>";
			
		if (subject == null || subject == "")
			errmsg += "subject is required<br>";
		
		if (message == null || message == "")
			errmsg += "message is required<br>";
			
		var atpos=to.indexOf("@");
		var dotpos=to.lastIndexOf(".");
		
		if (atpos < 1 || dotpos < atpos+2 || dotpos+2 >= to.length)
			errmsg += "invalid friend email address<br>";		
								
		if (errmsg.length > 0)
		{
			$(".calc #errmsg").html(errmsg);
			return false;
		}
			
		return true;
	}
	
	redraw();	
  };

})( jQuery );



