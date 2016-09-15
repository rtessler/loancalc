(function( $ ) {
  $.fn.loanComparisonCalculator = function(html, baseurl, loancalc) {	
	
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
		data.addColumn('number', 'total');
		data.addColumn('number', 'principal');
		
    					
		for (var i = 0; i < arr.length; i++)
		{
			if (arr[i].original < 0)
				arr[i].original = 0;
				
			if (arr[i].total < 0)
				arr[i].total = 0;				
				
			data.addRow([i/scale, arr[i].total/1000, arr[i].original/1000 ]);
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
		var upfront_fees1 = parseFloat($('#upfront_fees1').val());			
		var ongoing_fees_type1 = $('#ongoing_fees_type1').val();			
		var ongoing_fees1 = parseFloat($("#ongoing_fees1").val());
		var intro_rate1 = parseFloat($("#intro_rate1").val());		
		var intro_term1 = parseInt($("#intro_term1").val());
		var ongoing_rate1 = parseFloat($("#ongoing_rate1").val());
		
		var upfront_fees2 = parseFloat($('#upfront_fees2').val());			
		var ongoing_fees_type2 = $('#ongoing_fees_type2').val();			
		var ongoing_fees2 = parseFloat($("#ongoing_fees2").val());
		var intro_rate2 = parseFloat($("#intro_rate2").val());		
		var intro_term2 = parseInt($("#intro_term2").val());
		var ongoing_rate2 = parseFloat($("#ongoing_rate2").val());
	
		
		var loan_amount = removeCommas($("#loan_amount").val());
		loan_amount = parseFloat(loan_amount);
		var loan_term = parseFloat($("#loan_term").val());

		
	
		if ( isNaN(upfront_fees1) )
			upfront_fees1 = 0;
		
		if ( isNaN(ongoing_fees1) )
			ongoing_fees1 = 0;
			
		if ( isNaN(intro_rate1) )
			intro_rate1 = 0;
			
		if ( isNaN(intro_term1) )
			intro_term1 = 0;	
			
		if ( isNaN(ongoing_rate1) )
			ongoing_rate1 = 0;
			
		//-----------------------------------	
			
		if ( isNaN(upfront_fees2) )
			upfront_fees2 = 0;
		
		if ( isNaN(ongoing_fees2) )
			ongoing_fees2 = 0;
			
		if ( isNaN(intro_rate2) )
			intro_rate2 = 0;
			
		if ( isNaN(intro_term2) )
			intro_term2 = 0;	
			
		if ( isNaN(ongoing_rate2) )
			ongoing_rate2 = 0;
						
		//-------------------------------
			
		if ( isNaN(loan_amount) )
			loan_amount = 0;	
			
		if ( isNaN(loan_term) )
			loan_term = 0;			
									
		// get the monthly figure
																		
		if (ongoing_fees_type1 == "weekly")
			ongoing_fees1 = ongoing_fees1 * 52 / 12;
		else
		if (ongoing_fees_type1 == "fortnightly")
			ongoing_fees1 = ongoing_fees1 * 26 / 12;												
																		
		if (ongoing_fees_type2 == "weekly")
			ongoing_fees2 = ongoing_fees2 * 52 / 12;
		else
		if (ongoing_fees_type2 == "fortnightly")
			ongoing_fees2 = ongoing_fees2 * 26 / 12;												
			
						
		return {upfront_fees1: upfront_fees1, 
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
	}
		
	$( "#loan_amount_slider" ).slider({ min: 0, max: 5000000, step: 0.1, range: "min", animate: "true", value: 100000,
			slide: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
			},	
			stop: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
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
	 
	$("#loan_term").change(function() {
		
		redraw();		
		var v = parseFloat($("#loan_term").val());
		$( "#loan_term_slider" ).slider({ value: v });		
	});	
	
	$("#upfront_fees1").change(function() { redraw(); });			
	$("#ongoing_fees_type1").change(function() { redraw(); });		
	$("#ongoing_fees1").change(function() {	redraw(); });		
	$("#intro_rate1").change(function() { redraw();	});	
	$("#intro_term1").change(function() { redraw();	});		
	$("#ongoing_rate1").change(function() { redraw(); });
	
	$("#upfront_fees2").change(function() { redraw(); });			
	$("#ongoing_fees_type2").change(function() { redraw(); });		
	$("#ongoing_fees2").change(function() {	redraw(); });		
	$("#intro_rate2").change(function() { redraw();	});	
	$("#intro_term2").change(function() { redraw();	});		
	$("#ongoing_rate2").change(function() { redraw(); });
								 			
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

		var intro_rate1 = inputs.intro_rate1 / 100.0;
		intro_rate1 /= 12.0;
		var pmt_intro1 =  PMT(intro_rate1, inputs.loan_term * 12, inputs.loan_amount, 0);
		
		var t1 = Total(intro_rate1, inputs.intro_term1, pmt_intro1, inputs.loan_amount);
		
		var ongoing_rate1= inputs.ongoing_rate1 / 100.0;
		ongoing_rate1 /= 12.0;
		var pmt_ongoing1 =  PMT(ongoing_rate1, (inputs.loan_term * 12) - inputs.intro_term1, inputs.loan_amount - t1.total_principal, 0);
		
		pmt_intro1 += inputs.ongoing_fees1;
		t1 = Total(intro_rate1, inputs.intro_term1, pmt_intro1, inputs.loan_amount);
		pmt_ongoing1 += inputs.ongoing_fees1;
		
		$("#res2").html("$" + addCommas(pmt_intro1.toFixed(0)));
		$("#res4").html("$" + addCommas(pmt_ongoing1.toFixed(0)));
		
		var q1 = Total(ongoing_rate1, (inputs.loan_term * 12) - inputs.intro_term1, pmt_ongoing1, inputs.loan_amount - t1.total_principal);
		var total1 = t1.total_principal + t1.total_interest + q1.total_principal + q1.total_interest + inputs.upfront_fees1;
		
		$("#res6").html("$" + addCommas(total1.toFixed(0)));
		
		//--------------------------------------------------------
		
		var intro_rate2 = inputs.intro_rate2 / 100.0;
		intro_rate2 /= 12.0;
		var pmt_intro2 =  PMT(intro_rate2, inputs.loan_term * 12, inputs.loan_amount, 0);
		
		var t2 = Total(intro_rate2, inputs.intro_term2, pmt_intro2, inputs.loan_amount);
		
		var ongoing_rate2 = inputs.ongoing_rate2 / 100.0;
		ongoing_rate2 /= 12.0;
		var pmt_ongoing2 =  PMT(ongoing_rate2, (inputs.loan_term * 12) - inputs.intro_term2, inputs.loan_amount - t2.total_principal, 0);
		
		pmt_intro2 += inputs.ongoing_fees2;
		t2 = Total(intro_rate2, inputs.intro_term2, pmt_intro2, inputs.loan_amount);		// recalculate
		pmt_ongoing2 += inputs.ongoing_fees2;
		
		$("#res3").html("$" + addCommas(pmt_intro2.toFixed(0)));
		$("#res5").html("$" + addCommas(pmt_ongoing2.toFixed(0)));		
				
		var q2 = Total(ongoing_rate2, (inputs.loan_term * 12) - inputs.intro_term2, pmt_ongoing2, inputs.loan_amount - t2.total_principal);
		var total2 = t2.total_principal + t2.total_interest + q2.total_principal + q2.total_interest + inputs.upfront_fees2;
		
		$("#res7").html("$" + addCommas(total2.toFixed(0)));
		
		var x = total1 - total2;
		$("#res1").html("$" + addCommas(x.toFixed(0)));		
		
/*			
		var arr = new Array();	
			
		var principal = loan_amount;
		var total = loan_amount + TotalInterest(normal_interest, n, pmt, loan_amount);
		
		for (var i = 0; i < n; i++)
		{
			var interest_payment = principal * normal_interest;
			var principal_payment = pmt - interest_payment;
						
			arr[i] = {};
			
			arr[i].original = principal;
			principal -= principal_payment;	
			
			arr[i].total = total;
			total -= pmt;
		}		
				
		drawChart(arr,12);
*/		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Loan Comparison", value: ""};
		
		result[i++] = {key: "Loan 1", value: ""};
		result[i++] = {key: "upfront fees", value: "$" + inputs.upfront_fees1};
		result[i++] = {key: "ongoing fees frequency", value: inputs.ongoing_fees_type1 };
		result[i++] = {key: "ongoing fees", value: inputs.ongoing_fees1 };						
		result[i++] = {key: "intro rate", value: inputs.intro_rate1 + "%"};
		result[i++] = {key: "intro term", value: inputs.intro_term1 + " months"};		
		result[i++] = {key: "ongoing rate", value: inputs.ongoing_rate1 + "%"};
		
		result[i++] = {key: "Loan 2", value: ""};
		result[i++] = {key: "upfront fees", value: "$" + inputs.upfront_fees2};
		result[i++] = {key: "ongoing fees frequency", value: inputs.ongoing_fees_type2 };
		result[i++] = {key: "ongoing fees", value: inputs.ongoing_fees2 };						
		result[i++] = {key: "intro rate", value: inputs.intro_rate2 + "%"};
		result[i++] = {key: "intro term", value: inputs.intro_term2 + " months"};		
		result[i++] = {key: "ongoing rate", value: inputs.ongoing_rate2 + "%"};	
				

		result[i++] = {key: "loan amount", value: "$" + inputs.loan_amount};
		result[i++] = {key: "loan term", value: inputs.loan_term + " years"};

		result[i++] = {key: "Loan 1", value: ""};
		result[i++] = {key: "initial per month", value: "$" + addCommas(pmt_intro1.toFixed(0)) };	
		result[i++] = {key: "outgoing per month", value: "$" + addCommas(pmt_ongoing1.toFixed(0)) };	
		result[i++] = {key: "total payable", value: "$" + addCommas(total1.toFixed(0)) };
		
		result[i++] = {key: "Loan 2", value: ""};
		result[i++] = {key: "initial per month", value: "$" + addCommas(pmt_intro2.toFixed(0)) };	
		result[i++] = {key: "outgoing per month", value: "$" + addCommas(pmt_ongoing2.toFixed(0)) };	
		result[i++] = {key: "total payable", value: "$" + addCommas(total2.toFixed(0)) };	
		
		result[i++] = {key: "loan #2 will save you ", value: "$" + addCommas(x.toFixed(0)) };			
	}
	
	$(".info").click(function() {	
		$( "#infodialog" ).html("<p>Loan Comparison calculator.</p><p> The Loan Comparison Calculator calculates the total amounts payable under two alternative loans and then provides the comparative amount saved by using the lower cost loan. The two loans allow for the entry of different expense amounts, both initial and monthly ongoing. </p><p>In addition, the two loans allow for the entry of different introductory interest rates and terms, with different ongoing interest rates for the balance of the loan term. The calculation is done based on the repayment frequency selected by the user, in respect of the common loan parameters entered, namely amount and total term in years.</p>");
		
		$( "#infodialog" ).dialog();
	});	
	
	$(".calc .print").click(function() {
		window.print();
	});
	
	$(".calc .save").click(function() {
			
		//var uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		var uriContent = "data:application/text," + encodeURIComponent(resultToString(result));
		w = window.open(uriContent, 'loan_comparison.txt');
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



