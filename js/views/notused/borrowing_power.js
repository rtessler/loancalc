(function( $ ) {
  $.fn.borrowingPowerCalculator = function(html, baseurl, loancalc) {	
	
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
		var joint_income = $('#joint_income:checked').val();			
		var dependents = parseInt($('#dependents').val());	
		
		var net_salary_type1 = $("#net_salary_type1").val();
		var net_salary1 = removeCommas($("#net_salary1").val());
		net_salary1 = parseFloat(net_salary1);
		
		var net_salary_type2 = $("#net_salary_type2").val();
		var net_salary2 = removeCommas($("#net_salary2").val());
		net_salary2 = parseFloat(net_salary2);
		
		var other_net_income_type = $("#other_net_income_type").val();
		var other_net_income = removeCommas($("#other_net_income").val());
		other_net_income = parseFloat(other_net_income);			
			
		max_income_available = parseFloat($("#max_income_available").val());
		var max_income_available_default = $('#max_income_available_default:checked').val();
							
		var annual_expenses = removeCommas($("#annual_expenses").val());
		annual_expenses = parseFloat(annual_expenses);
		var annual_expenses_default = $('#annual_expenses_default:checked').val();
						
		var car_loan = parseFloat($("#car_loan").val());		
		var credit_card = parseFloat($("#credit_card").val());
		
		var other_payments_type = $("#other_payments_type").val();
		var other_payments = parseFloat($("#other_payments").val());
		
		
		var interest_rate = parseFloat($("#interest_rate").val());
		var loan_term = parseFloat($("#loan_term").val());
		var interest_rate_buffer = parseFloat($("#interest_rate_buffer").val());
		var interest_rate_buffer_default = $('#interest_rate_buffer_default:checked').val();
		
	
		if ( isNaN(net_salary1) )
			net_salary1 = 0;
		
		if ( isNaN(net_salary2) )
			net_salary2 = 0;
			
		if ( isNaN(other_net_income) )
			other_net_income = 0;
			
		if ( isNaN(max_income_available) )
			max_income_available = 0;	
			
		if ( isNaN(annual_expenses) )
			annual_expenses = 0;
			
		if ( isNaN(car_loan) )
			car_loan = 0;
			
		if ( isNaN(credit_card) )
			credit_card = 0;	
			
		if ( isNaN(other_payments) )
			other_payments = 0;															
			
		return {joint_income: joint_income, 
		dependents: dependents, 
		
		net_salary_type1: net_salary_type1, 
		net_salary1: net_salary1,

		net_salary_type2: net_salary_type2, 
		net_salary2: net_salary2, 
		
		other_net_income_type: other_net_income_type,
		other_net_income: other_net_income,
		
		max_income_available: max_income_available,
		max_income_available_default: max_income_available_default,
		
		annual_expenses: annual_expenses,
		annual_expenses_default: annual_expenses_default,
		
		car_loan: car_loan,
		credit_card: credit_card,
		
		other_payments_type: other_payments_type,
		other_payments: other_payments,
		
		car_loan: car_loan,
		credit_card: credit_card,
		
		other_payments_type: other_payments_type,
		other_payments: other_payments,
		
		interest_rate: interest_rate,
		loan_term: loan_term,
		interest_rate_buffer: interest_rate_buffer,
		interest_rate_buffer_default: interest_rate_buffer_default
		};
	}
		
	$( "#interest_rate_slider" ).slider({ min: 0.25, max: 25, step: 0.1, range: "min", animate: "true", value: 7.25,
			slide: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#interest_rate" ).val( ui.value );
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
	 
	$("#interest_rate").change(function() {

		redraw();		
		var v = removeCommas($("#interest_rate").val());
		v = parseFloat(v);		
		$( "#interest_rate_slider" ).slider({ value: v });
	});	 
	 
	$("#loan_term").change(function() {
		
		redraw();		
		var v = parseFloat($("#loan_term").val());
		$( "#loan_term_slider" ).slider({ value: v });		
	});	
	
	$("#dependents").change(function() {
		
		setAnnualExpenses();
		redraw();
	});		
	
	$("#net_salary_type1").change(function() {
		redraw();
	});	
	
	$("#net_salary1").change(function() {
		redraw();
	});		
	
	$("#net_salary_type2").change(function() {
		redraw();
	});
	
	$("#net_salary2").change(function() {
		redraw();
	});	
	
	$("#other_net_income_type").change(function() {
		redraw();
	});
	
	$("#other_net_income").change(function() {
		redraw();
	});	
	
	$("#other_payments_type").change(function() {
		redraw();
	});		
	
	$("#joint_income").click(function() {
		
		var joint_income = $('#joint_income:checked').val();
		
		if (joint_income)
		{
			$("#net_salary2").removeAttr('readonly');
			$("#net_salary2").removeClass("readonly");
			$("#net_salary_type2").removeAttr('disabled');

		} else {
			$("#net_salary2").attr('readonly', true);
			$("#net_salary2").addClass("readonly");
			$("#net_salary_type2").attr('disabled', 'disabled');
			$("#net_salary2").val(0);

		}
		
		setAnnualExpenses();
		
		redraw();
	});	
	
	$("#max_income_available_default").click(function() {
		
		var max_income_available_default = $('#max_income_available_default:checked').val();
		
		if (!max_income_available_default)
		{
			$("#max_income_available").removeAttr('readonly');
			$("#max_income_available").removeClass("readonly");

		} else {
			$("#max_income_available").attr('readonly', true);
			$("#max_income_available").addClass("readonly");
		}
		
		redraw();
	});	
	
	$("#annual_expenses_default").click(function() {
		
		var annual_expenses_default = $('#annual_expenses_default:checked').val();
		
		if (!annual_expenses_default)
		{
			$("#annual_expenses").removeAttr('readonly');
			$("#annual_expenses").removeClass("readonly");
		} else {
			$("#annual_expenses").attr('readonly', true);
			$("#annual_expenses").addClass("readonly");
		}
		
		setAnnualExpenses();
	
		redraw();
	});	
	
	$("#interest_rate_buffer_default").click(function() {
		
		var interest_rate_buffer_default = $('#interest_rate_buffer_default:checked').val();
		
		if (!interest_rate_buffer_default)
		{
			$("#interest_rate_buffer").removeAttr('readonly');
			$("#interest_rate_buffer").removeClass("readonly");
		} else {
			$("#interest_rate_buffer").attr('readonly', true);
			$("#interest_rate_buffer").addClass("readonly");
		}
		
		redraw();
	});	
	
	function setAnnualExpenses()
	{
		var joint_income = $("#joint_income:checked").val();
		var dependents = parseInt($("#dependents").val());
		
		var annual_expenses_default = $('#annual_expenses_default:checked').val();
		
		if (!annual_expenses_default)
			return;
		
		var annual_expenses = "";
		
		if (!joint_income)
		{
			switch (dependents)
			{
			case 0: annual_expenses = "15,624"; break;
			case 1: annual_expenses = "21,459"; break;
			case 2: annual_expenses = "26,980"; break;
			case 3: annual_expenses = "32,500"; break;
			case 4: annual_expenses = "38,021"; break;
			}
		}
		else
		{
			switch (dependents)
			{
			case 0: annual_expenses = "22,715"; break;
			case 1: annual_expenses = "28,235"; break;
			case 2: annual_expenses = "33,756"; break;
			case 3: annual_expenses = "39,277"; break;
			case 4: annual_expenses = "44,736"; break;
			}			
		}
		
		$('#annual_expenses').val(annual_expenses);
	}
								 			
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
	
	function getMonthlyValue(f, val)
	{
		if (f == "annually")					
			val /= 12.0;
		else		
		if (f == "weekly")					
			val = val * 52.0 / 12.0;
		else
		if (f == "fortnightly")	
			val = val * FORTNIGHTS_PER_YEAR / 12.0;	
		
		return val;		
	}
	
	function redraw()
	{
		var inputs = get_inputs();

		var interest = (inputs.interest_rate + inputs.interest_rate_buffer) / 100.0;
		interest /= 12.0;

		var net_salary1 = getMonthlyValue(inputs.net_salary_type1, inputs.net_salary1);
		var net_salary2 = getMonthlyValue(inputs.net_salary_type2, inputs.net_salary2);
		var other_net_income = getMonthlyValue(inputs.other_net_income_type, inputs.other_net_income);
		var other_payments = getMonthlyValue(inputs.other_payments_type, inputs.other_payments);
		
		var expenses = (inputs.annual_expenses / 12.0) + inputs.car_loan + inputs.credit_card + other_payments;
		var salary = net_salary1 + net_salary2 + other_net_income;
		var available = (inputs.max_income_available / 100.0) * salary - expenses;
		
		n = inputs.loan_term * 12.0;
		
		// http://www.infobarrel.com/Financial_Math%3A__How_Much_Can_I_Afford_to_Borrow%3F
		
		var loan_amount = (available / interest) * (( Math.pow((1.0 + interest), n) - 1.0 ) / ( Math.pow((1.0 + interest), n) ));
		
		loan_amount = loan_amount - loan_amount % 1000;		// round down to nearest thousand
		
		var normal_interest = ((inputs.interest_rate ) / 100.0) / 12;
					
		var pmt = PMT(normal_interest, n, loan_amount, 0);
		
		$("#res1").html("$" + addCommas(loan_amount.toFixed(0)));
		$("#res2").html("$" + addCommas(pmt.toFixed(2)));		

			
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
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Borrowing Power", value: ""};
		result[i++] = {key: "joint income", value: inputs.joint_income ? "true" : "false"};
		result[i++] = {key: "dependents", value: inputs.dependents };
						
		result[i++] = {key: "net_salary_type1", value: inputs.net_salary_type1};
		result[i++] = {key: "net_salary1", value: "$" + inputs.net_salary1};
		
		result[i++] = {key: "net_salary_type2", value: inputs.net_salary_type2};
		result[i++] = {key: "net_salary2", value: "$" + inputs.net_salary2};
		
		result[i++] = {key: "annual expenses", value: "$" + inputs.annual_expenses};		
		result[i++] = {key: "car loan", value: "$" + inputs.car_loan};
		result[i++] = {key: "credit card", value: "$" + inputs.credit_card};
		result[i++] = {key: "other payments type", value: inputs.other_payments_type};		
		result[i++] = {key: "other payments", value: "$" + inputs.other_payments};
		result[i++] = {key: "max percent income available", value: "$" + inputs.max_income_available};		
				

		result[i++] = {key: "interest rate", value: inputs.interest_rate + "%"};
		result[i++] = {key: "loan term", value: inputs.loan_term + " years"};
		result[i++] = {key: "total interest:", value: inputs.interest_rate_buffer + "%"};
		
		result[i++] = {key: "you can borrow", value: "$" + addCommas(loan_amount.toFixed(0)) };	
		result[i++] = {key: "repayments", value: "$" + addCommas(pmt.toFixed(2)) };	
	}
	
	$(".info").click(function() {	
		$( "#infodialog" ).html("<h3>Borrowing Power calculator.</h3><p>The Borrowing Power Calculator calculates the maximum amount of loan available based on the income and expenses entered.</p><p> Default values provided assist in giving an estimate of the expenses and other factors which may determine the amount available for a loan.</p> ");
		
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



