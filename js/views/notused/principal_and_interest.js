(function( $ ) {
  $.fn.principalAndInterestCalculator = function(html, baseurl, loancalc) {	
	
	//var WEEKS_PER_YEAR = 52.177457;
	var WEEKS_PER_YEAR = 52.0;
	var FORTNIGHTS_PER_YEAR = 26.0;
	var MONTHS_PER_YEAR = 12;	
	
	var PRINCIPAL_AND_INTEREST = 1;
	var INTEREST_ONLY = 2;	
	
	var result = new Array();
	
	this.html(html);
	loancalc.changeImages(baseurl);
	

	function get_inputs()
	{
		var loan_amount = removeCommas($("#loan_amount").val());
		loan_amount = parseFloat(loan_amount);	
			
		var interest_rate = parseFloat($("#interest_rate").val());	
		var extra_payments = parseFloat($("#extra_payments").val());		
		var loan_term = parseFloat($("#loan_term").val());
	
		if ( isNaN(loan_amount) )
			loan_amount = 0;
		
		if ( isNaN(interest_rate) )
			interest_rate = 0;
			
		if ( isNaN(extra_payments) )
			extra_payments = 0;
			
		if ( isNaN(loan_term) )
			loan_term = 0;									
			
		return {loan_amount: loan_amount, 
		interest_rate: interest_rate, 
		extra_payments: extra_payments, 
		loan_term: loan_term
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
		
	$( "#interest_rate_slider" ).slider({ min: 0.25, max: 25, step: 0.1, range: "min", animate: "true", value: 7.25,
			slide: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
				redraw();
			}		
	 });
	 
	$( "#extra_payments_slider" ).slider({ min: 0, max: 10000, step: 100, range: "min", animate: "true", value: 0,
			slide: function( event, ui ) {
				$( "#extra_payments" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#extra_payments" ).val( ui.value );
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
	 
	$("#interest_rate").change(function() {
		
		redraw();		
		var v = parseFloat($("#interest_rate").val());
		$( "#interest_rate_slider" ).slider({ value: v });		
	});	
	 
	$("#extra_payments").change(function() {

		redraw();		
		var v = parseFloat($("#extra_payments").val());
		$( "#extra_payments_slider" ).slider({ value: v });		
	});	
				 			
	$("#pageno").change(function() {
		redraw();
	});	
	
	$(".spinner #up").click(function() {
		var v = $(".spinner #yearno").val();
		v = parseInt(v);
		
		v++;
		
		$("#yearno").val(v);	
		redraw();	

	});
	
	$(".spinner #down").click(function() {
		var v = $(".spinner #yearno").val();
		v = parseInt(v);

		v--;
		
		if (v < 1)
			v = 1;
			
		$("#yearno").val(v);
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

		var interest = inputs.interest_rate / 100.0;
		interest /= 12.0;
		n = inputs.loan_term * 12.0;			
		var pmt = PMT(interest, n, inputs.loan_amount, 0);
		
		pmt += inputs.extra_payments;		
		n = NPER(interest, pmt, -(inputs.loan_amount), 0);			
		
		$("#monthly-payment").html("$" + pmt.toFixed(2));
			
		var arr = new Array();	
	
		var principal = inputs.loan_amount;		
		var total_interest = 0;
		var total_principal = 0;	
				
		for (var i = 0; i < n; i++)
		{					
			var interest_payment = principal * interest;
			var principal_payment = pmt - interest_payment;
			principal -= principal_payment;
			
			total_principal += principal_payment;
			total_interest += interest_payment;
			
			arr[i] = {interest: interest_payment, 
					principal: principal_payment, 
					total_interest: total_interest, 
					total_principal: total_principal,
					principal_remaining: principal};							
		}			
		
		var yearno = $("#yearno").val();
		yearno = parseInt(yearno);
		
		$("#yearid").html(yearno);
		
		yearno -= 1;	
		
		$("#result-table").find("tr:gt(0)").remove();

		
		for (var i = 12 * yearno; i < (12 * yearno) + 12 && i < n; i++)
		{
			var str = "<tr>";
			str += "<td>" + (i+1) + "</td>";
			str += "<td>$" + arr[i].interest.toFixed(2) + "</td>";
			str += "<td>$" + addCommas(arr[i].principal.toFixed(2)) + "</td>";
			str += "<td>$" + addCommas(arr[i].total_interest.toFixed(2)) + "</td>";
			str += "<td>$" + addCommas(arr[i].total_principal.toFixed(2)) + "</td>";
			str += "<td>$" + addCommas(arr[i].principal_remaining.toFixed(2)) + "</td>";
			str += "</tr>";
			
			$("#result-table").append(str);
		}
		
		$("#result-table tr:odd").css("background", "#eee");
		$("#result-table tr:even").css("background", "#fff");
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Principal and Interest", value: ""};
		result[i++] = {key: "loan amount", value:"$" + addCommas(inputs.loan_amount.toFixed(2))};
		result[i++] = {key: "interest rate", value: inputs.interest_rate.toFixed(2) + "%"};
		result[i++] = {key: "loan term", value: inputs.loan_term + " years"};
		result[i++] = {key: "extra payments", value: addCommas(inputs.extra_payments.toFixed(2))};	
		
		result[i++] = {key: "monthly payment", value: addCommas("$" + pmt.toFixed(2))};
	}	
	
	$(".info").click(function() {	
		$( "#infodialog" ).html("<h3>Principal and Interest calculator.</h3><p> The Principal and Interest Calculator provides a schedule of your monthly repayments and shows you what portion goes towards interest and what portion goes toward paying off the principal amount borrowed.</p>");
		
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



