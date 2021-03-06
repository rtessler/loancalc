(function( $ ) {
  $.fn.lumpSumCalculator = function(html, baseurl, loancalc) {
	
	//var WEEKS_PER_YEAR = 52.177457;
	var WEEKS_PER_YEAR = 52.0;
	var FORTNIGHTS_PER_YEAR = 26.0;
	var MONTHS_PER_YEAR = 12;	
	
	var PRINCIPAL_AND_INTEREST = 1;
	var INTEREST_ONLY = 2;	
	
	var result = new Array();
	
	this.html(html);
	loancalc.changeImages(baseurl);

      function drawChart(arr, scale) {
		
	    var data = new google.visualization.DataTable();
		
    	data.addColumn('number', 'years');
		data.addColumn('number', 'original');
		data.addColumn('number', 'with lump sum');
    					
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

        var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
        chart.draw(data, options);
      }			

	function get_inputs()
	{
		var loan_amount = removeCommas($("#loan_amount").val());
		loan_amount = parseFloat(loan_amount);		
		
		var loan_term = parseFloat($("#loan_term").val());
		var interest_rate = parseFloat($("#interest_rate").val());
		
		var repayment_frequency = $("#repayment_frequency").val();	
		
		var lump_sum = removeCommas($("#lump_sum").val());
		lump_sum = parseFloat(lump_sum);		
		var lump_sum_year =parseFloat($("#lump_sum_year").val());
				
		if ( isNaN(loan_amount) )
			loan_amount = 0;
		
		if ( isNaN(loan_term) )
			loan_term = 0;
			
		if ( isNaN(interest_rate) )
			interest_rate = 0;
			
		if ( isNaN(lump_sum) )
			lump_sum = 0;
			
		if ( isNaN(lump_sum_year) )
			lump_sum_year = 0;						
			
		return {loan_amount: loan_amount, 
		loan_term: loan_term, 
		interest_rate: interest_rate, 
		repayment_frequency: repayment_frequency,
		lump_sum: lump_sum,
		lump_sum_year: lump_sum_year
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
		
	$( "#interest_rate_slider" ).slider({ min: 0.25, max: 25.0, step: 0.1, range: "min", animate: "true", value: 7.25,
			slide: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
				redraw();
			}		
	 });
	
	$( "#loan_term_slider" ).slider({ min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25,
			slide: function( event, ui ) {
				$( "#loan_term" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#loan_term" ).val( ui.value );
				redraw();
			}	
	 });
	 
	$( "#lump_sum_slider" ).slider({ min: 0, max: 92000, step: 1000, range: "min", animate: "true", value: 10000,
			slide: function( event, ui ) {
				$( "#lump_sum" ).val( addCommas(ui.value) );
			},	
			stop: function( event, ui ) {
				$( "#lump_sum" ).val( addCommas(ui.value) );
				redraw();
			}	
	 });
	 
	$( "#lump_sum_year_slider" ).slider({ min: 0, max: 25, step: 0.5, range: "min", animate: "true", value: 5,
			slide: function( event, ui ) {
				$( "#lump_sum_year" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#lump_sum_year" ).val( ui.value );
				redraw();
			}	
	 });	 	 
	 
	$("#loan_amount").change(function() {

		redraw();		
		var v = removeCommas($("#loan_amount").val());
		v = parseFloat(v);		
		$( "#loan_amount_slider" ).slider({ value: v });
	});	 
	 
	$("#interest_rate").change(function() {
		
		redraw();		
		var v = parseFloat($("#interest_rate").val());
		$( "#interest_rate_slider" ).slider({ value: v });		
	});	
	 
	$("#loan_term").change(function() {

		redraw();		
		var v = parseFloat($("#loan_term").val());
		$( "#loan_term_slider" ).slider({ value: v });		
	});	
			 
	$("#repayment_frequency").change(function() {
		redraw();
	});
	
	$("#lump_sum").change(function() {

		redraw();		
		var v = removeCommas($("#lump_sum").val());
		v = parseFloat(v);
		$( "#lump_sum_slider" ).slider({ value: v });		
	});	
	
	$("#lump_sum_year").change(function() {

		redraw();		
		var v = parseFloat($("#lump_sum_year").val());
		$( "#lump_sum_year_slider" ).slider({ value: v });
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
				
		var interest = inputs.interest_rate / 100.0;
		var s = 0;
				
		if (inputs.repayment_frequency == "weekly")
		{
			interest = interest / WEEKS_PER_YEAR;
			n = inputs.loan_term * WEEKS_PER_YEAR;
			$("#label1").html("Weekly repayments:");
			
			s = 52 * inputs.lump_sum_year;		// start after n weeks
		}
		else
		if (inputs.repayment_frequency == "fortnightly")
		{
			interest = interest / FORTNIGHTS_PER_YEAR;
			n = inputs.loan_term * FORTNIGHTS_PER_YEAR;	
			$("#label1").html("Fortnightly repayments:");
			
			s = 26 * inputs.lump_sum_year;	// start after n fortnights
		}
		else
		{
			interest = interest / 12.0;
			n = inputs.loan_term * 12.0;
			$("#label1").html("Monthly repayments:");
			
			s = 12 * inputs.lump_sum_year;	// start after n months		
		}	
		
		var res = calculate(inputs.loan_amount, interest, n);	
		$("#res1").html("$" + addCommas(res.repayment.toFixed(2)));
		
		// normal case
		
		var pmt1 = PMT(interest, n, inputs.loan_amount, 0);		
		var nper1 = NPER(interest, pmt1, -inputs.loan_amount, 0);
		var total_interest1 = TotalInterest(interest, nper1, pmt1, inputs.loan_amount);
		
		// with extra lump sum
			
		var q = Total(interest, s, pmt1, inputs.loan_amount);		// before lump sum
		
		var x = inputs.loan_amount - q.total_principal - inputs.lump_sum;
		var nper2 = NPER(interest, pmt1, -x, 0);
		var total_interest2 = q.total_interest + TotalInterest(interest, nper2, pmt1, x);
		
		
		var arr = new Array();	
	
		var p1 = inputs.loan_amount;
		var p2 = inputs.loan_amount;	
		var jump = true;
				
		for (var i = 0; i <= nper1; i++)
		{			
			arr[i] = {};
			
			a = calculatePeriodRepayment(pmt1, interest, nper1, i);
										
			arr[i].original = p1;	
			p1 -= a.principal_repayment;
			
			if (i >= s)
			{				 
				b = calculatePeriodRepayment(pmt1, interest, nper2, i-s);
				
				arr[i].extra = p2;	
				p2 -= b.principal_repayment;
				
				if (jump)
				{
					p2 -= inputs.lump_sum;
					jump = false;
				}
			}
			else
			{
				arr[i].extra = p1;	
				p2 -= a.principal_repayment;
			}
		}
			
		var original_years = inputs.loan_term;
		var years_saved = 0;
		
		if (inputs.repayment_frequency == "weekly")
		{
			years_saved = original_years - ((s+nper2) / 52);
			drawChart(arr,52);
		}
		else
		if (inputs.repayment_frequency == "fortnightly")
		{
			years_saved = original_years - ((s+nper2) / 26);
			drawChart(arr,26);
		}
		else
		{
			years_saved = original_years - ((s+nper2) / 12);
			drawChart(arr,12);
		}
				
		var months_saved = (years_saved - Math.floor(years_saved)) * 12.0;
		
		$("#res2").html(Math.floor(years_saved) + " years, " + Math.ceil(months_saved) + " months");	
		
		var interest_saved = total_interest1 - total_interest2;	
		$("#res3").html("$" + addCommas(interest_saved.toFixed(2)));
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Lump Sum", value: ""};
		result[i++] = {key: "loan_amount", value: addCommas( inputs.loan_amount.toFixed(2) )};
		result[i++] = {key: "interest rate", value: inputs.interest_rate + "%"};
		result[i++] = {key: "loan term", value: inputs.loan_term};
		result[i++] = {key: "repayment frequency", value: inputs.repayment_frequency};	
		result[i++] = {key: "lump sum", value: inputs.lump_sum};	
		result[i++] = {key: "lump sum year", value: lump_sum_year};	
		
		result[i++] = {key: "repayments", value: "$" + addCommas(res.repayment.toFixed(2))};	
		result[i++] = {key: "Time saved", value: Math.floor(years_saved) + " years, " + Math.ceil(months_saved) + " months"};	
		result[i++] = {key: "Interest saved", value: "$" + addCommas(interest_saved.toFixed(2))};	
	}
	
	$(".info").click(function() {	
		$( "#infodialog" ).html("<h3>Lump Sum calculator.</h3><p> The Lump Sum Calculator calculates the time saved to pay off the loan and the amount of interest saved if a single additional lump sum repayment is made, equal to the entered amount of additional lump sum repayment after the loan has been in force for the entered number of years, in addition to continuing the regular repayments. The calculation is done at the repayment frequency entered, in respect of the original loan parameters entered, namely amount, annual interest rate and term in years.</p>");
		
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


