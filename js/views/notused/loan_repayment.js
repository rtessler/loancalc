(function( $ ) {
  $.fn.loanRepaymentCalculator = function(html, baseurl, loancalc) {	
	
	//var WEEKS_PER_YEAR = 52.177457;
	var WEEKS_PER_YEAR = 52.0;
	var FORTNIGHTS_PER_YEAR = 26.0;
	var MONTHS_PER_YEAR = 12;	
	
	var PRINCIPAL_AND_INTEREST = "principal and interest";
	var INTEREST_ONLY = "interest only";	
	
	var result = new Array();
	
	//this.html(html);
	//loancalc.changeImages(baseurl);
		
      function drawChart(arr,scale) {
		
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
				
			data.addRow([i/scale, arr[i].principal/1000, arr[i].total/1000]);
		}

        var options = {
          //title: 'Amount Owing',
		  //backgroundColor: "#eee",
		  colors: ['#F7C244','#E4E4E4'],
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
		var repayment_type = $("#repayment_type").val();			
				
		if ( isNaN(loan_amount) )
			loan_amount = 0;
		
		if ( isNaN(loan_term) )
			loan_term = 0;
			
		if ( isNaN(interest_rate) )
			interest_rate = 0;
			
		return {loan_amount: loan_amount, loan_term: loan_term, interest_rate: interest_rate, repayment_frequency: repayment_frequency, repayment_type: repayment_type};
	}		
	
	function PV(rate, nper, pmt, fv)		// present value
	{
		rate = parseFloat(rate);
		pmt = parseFloat(pmt);
		nper = parseFloat(nper);
				
		if (pmt == 0 || nper == 0)
			return 0;
			
		if ( rate == 0 ) // Interest rate is 0
			return -(fv + (pmt * nper));
		
		var x = Math.pow(1 + rate, -nper);
		var y = Math.pow(1 + rate, nper);
		return - ( x * ( fv * rate - pmt + y * pmt )) / rate;
	}
	
	function FV(rate, nper, pmt, pv)
	{		
		rate = parseFloat(rate);
		pmt = parseFloat(pmt);
		nper = parseFloat(nper);
			
		if ( rate == 0 ) // Interest rate is 0
			return -(pv + (pmt * nper));
			
		x = Math.pow(1 + rate, nper);		
		return - ( -pmt + x * pmt + rate * x * pv ) /rate;
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
		
		
	function calculate(loan_amount, interest, n, repayment_type) 
	{			
		var principal = loan_amount;															
		var repayment = 0;
		var total_interest = 0;
		
		if (repayment_type == INTEREST_ONLY)
		{
			repayment = principal * interest;			
			total_interest = repayment * n;
		}
		else
		{		
			// see wikipedia amortization
			// http://en.wikipedia.org/wiki/Amortization_calculator			
			// or http://www.ext.colostate.edu/pubs/farmmgt/03757.html			
			// get number of repayments and interest for each repayment			
			// http://invested.com.au/71/rental-yield-2659/	
			// calculate repayment for this time period
			// http://www.hughchou.org/calc/formula.html	
			
			repayment = (interest * principal) / ( 1 - Math.pow((1 + interest), -n) );						
			total_interest = repayment * n - principal;									
		}				
								
		return {repayment: repayment, total_interest: total_interest};													
	}
	
	function calculatePeriodRepayment(total_repayment, interest, repayment_no, period)
	{
		// see http://www.ext.colostate.edu/pubs/farmmgt/03757.html
		
		principal_repayment = total_repayment * ( Math.pow((1 + interest), -(1 + repayment_no - period) ));
		interest_repayment = total_repayment - principal_repayment;
		
		return {principal_repayment: principal_repayment, interest_repayment: interest_repayment};			
	}
	
	function render()
	{
		var inputs = get_inputs();
				
		var t = 0;
		var interest = inputs.interest_rate / 100.0;
		var	repayment_no = 0;
		var scale = 0;
				
		if (inputs.repayment_frequency == "weekly")
		{
			interest = interest / WEEKS_PER_YEAR;
			n = inputs.loan_term * WEEKS_PER_YEAR;			
			$("#label1").html("Weekly repayments:");	
			scale = 52;
		}
		else
		if (inputs.repayment_frequency == "fortnightly")
		{
			interest = interest / FORTNIGHTS_PER_YEAR;
			n = inputs.loan_term * FORTNIGHTS_PER_YEAR;	
			$("#label1").html("Fortnightly repayments:");
			scale = 26;
		}
		else
		{
			interest = interest / 12.0;
			n = inputs.loan_term * 12.0;	
			$("#label1").html("Monthly repayments:");
			scale = 12;
		}	
		
		var res = calculate(inputs.loan_amount, interest, n, inputs.repayment_type);	
		$("#res1").html("$" + addCommas(res.repayment.toFixed(2)));
		t = res.repayment;			
		$("#res2").html("$" + addCommas(res.total_interest.toFixed(2)));	
				
		var arr = new Array();		
		var p = inputs.loan_amount;
		var a = p + res.total_interest;
		
		for (var i = 0; i <= n; i++)
		{
			if (inputs.repayment_type == INTEREST_ONLY)
			{
				arr[i] = {principal: p, total: a};
				a -= t;				
			}
			else
			{
				arr[i] = calculatePeriodRepayment(t, interest, n, i);					
					
				arr[i].principal = p;	
				p -= arr[i].principal_repayment;	
				
				arr[i].total = a;
				a -= t;
			}
		}
		
		drawChart(arr,scale);
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Loan Repayment", value: ""};
		result[i++] = {key: "loan amount", value: "$" + addCommas( inputs.loan_amount.toFixed(2) )};
		result[i++] = {key: "interest rate", value: inputs.interest_rate + "%"};
		result[i++] = {key: "loan term", value: inputs.loan_term + " years"};
		result[i++] = {key: "repayment frequency", value: inputs.repayment_frequency};		
		result[i++] = {key: "repayment type", value: inputs.repayment_type};		
		result[i++] = {key: "payments", value: "$" + addCommas(res.repayment.toFixed(2))};
		result[i++] = {key: "total interest", value: "$" + addCommas(res.total_interest.toFixed(2))};
	}
	
	
	
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
		
/*		
	var validator = new FormValidator('email-form', [{
		name: 'subject',   
		rules: 'required'
	}, {
		name: 'from',
		display: "your email",
		rules: 'required|valid_email'
	}, {
		name: 'to',
		display: "friends email",
		rules: 'required|valid_email'
	}, {
		name: 'message',
		rules: 'required'
	}], function(errors, event) {
		if (errors.length > 0) {
			var errorString = '';
        
			for (var i = 0, errorLength = errors.length; i < errorLength; i++) {
				errorString += errors[i].message + '<br />';
			}
			
			$("#errmsg").html(errorString);
			//document.getElementById("errmsg").innerHTML = errorString;

			return false;
		}
		else
		{
			send_email();
			return false;
		}
	});			
*/

	function startListening()
	{
$( "#loan_amount_slider" ).slider({ min: 1000, max: 5000000, step: 5000, range: "min", animate: "true", value: 100000,
				slide: function( event, ui ) {
					$( "#loan_amount" ).val( addCommas(ui.value) );
				},
				stop: function( event, ui ) {
					$( "#loan_amount" ).val( addCommas(ui.value) );
					render();
				}
		});
			
		$( "#interest_rate_slider" ).slider({ min: 0.25, max: 25.0, step: 0.1, range: "min", animate: "true", value: 7.25,
				slide: function( event, ui ) {
					$( "#interest_rate" ).val( ui.value );
				},	
				stop: function( event, ui ) {
					$( "#interest_rate" ).val( ui.value );
					render();
				}		
		 });
		
		$( "#loan_term_slider" ).slider({ min: 0.5, max: 50, step: 0.5, range: "min", animate: "true", value: 25,
				slide: function( event, ui ) {
					$( "#loan_term" ).val( ui.value );
				},	
				stop: function( event, ui ) {
					$( "#loan_term" ).val( ui.value );
					render();
				}	
		 });
		 
		$("#loan_amount").change(function() {

			render();		
			var v = removeCommas($("#loan_amount").val());
			v = parseFloat(v);
			
			$( "#loan_amount_slider" ).slider({ value: v });
		});	 
		 
		$("#interest_rate").change(function() {
			
			render();		
			var v = parseFloat($("#interest_rate").val());
			$( "#interest_rate_slider" ).slider({ value: v });		
		});	
		 
		$("#loan_term").change(function() {

			render();		
			var v = parseFloat($("#loan_term").val());
			$( "#loan_term_slider" ).slider({ value: v });		
		});	
				 
		$("#repayment_frequency").change(function() {
			render();
		});

		$("#repayment_type").change(function() {
			render();
		});

		$(".calc .info").click(function() {	
			$( "#infodialog" ).html("<h3>The Loan Repayments Calculator.</h3<p> The Loan Repayments Calculator calculates the type of repayment required, at the frequency requested, in respect of the loan parameters entered, namely amount, term and interest rate.</p>");
			
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
	}

	function init(e)
	{
		debug("init");

		
		var source = '<div class="calc loan-repayment"><div class="outer-container rounded"><h3>Loan Repayments</h3><div class="calculator rounded"><div class="left-div"><p class="section-heading">Enter your loan details</p><div class="calc-panel rounded panel"><div><label for="loan_amount" >Amount:</label><br><div id="loan_amount_slider" class="slider"></div> $ <input id="loan_amount" name="loan_amount" value="100,000" class="long-text"/></div><div><label for="interest_rate" >Interest Rate:</label><br><div id="interest_rate_slider" class="slider"></div>&nbsp;&nbsp;<input id="interest_rate" name="interest_rate" value="7.25" class="short-text"/> %</div><div><label for="loan_term" >Loan Term:</label><br><div id="loan_term_slider" class="slider"></div> &nbsp;&nbsp;<input id="loan_term" name="loan_term" value="25.0" class="short-text"/> years</div><div><p >Repayment Frequency:</p><select id="repayment_frequency" name="repayment_frequency"><option value="monthly">Monthly</option><option value="fortnightly">Fortnightly</option><option value="weekly">Weekly</option></select></div><div><p>Repayment Type:</p><select id="repayment_type" name="repayment_type"><option value="principal and interest">Principal &amp;Interest</option><option value="interest only">Interest only</option></select></div></div></div><div class="right-div"><p class="section-heading">View your results</p><div class="result-panel rounded panel"><div id="chart_div" ></div><br><div id="result" class="rounded"><table cellpadding="0" cellspacing="0" ><tr><td><label id="label1">Monthly repayments:</label></td><td><label id="res1">0</label></td></tr><tr><td><label id="label2">Total interest payable:</label></td><td><label id="res2">0</label></td></tr></table></div></div></div><div id="email-form" ><form name="email-form" action="#" method="post"><h3>Email a Friend</h3><div id="errmsg"></div><div id="email-response"></div><div style="float:left;padding-right: 30px;"><label for="from">Your email address</label><br><input id="from" name="from" class="text normal-text"/></div><div><label for="to">Your Friend&quot;s email address</label><br><input id="to" name="to" class="text normal-text"/></div><div><label for="subject">Subject</label><br><input id="subject" name="subject" class="text long-text" value="mortgage loan repayment"/></div><div><label for="message">Message</label><br><textarea id="message" name="message" cols="40" rows="4" class="text"></textarea></div><button type="submit" id="send_email" value="Send" >Send</button></form></div></div><div class="functions"><ul><li><br><a class="info" href="#" title="info"><img src="images/info.png" width="19" height="18"></a><br><br></li><li><a class="print" href="#" title="print"><img src="images/print.png" width="18" height="19"></a><br><br></li><li><a class="save" href="#" title="save"><img src="images/save.png" width="18" height="18"></a><br><br></li><li><a class="email" href="#" title="email"><img src="images/email.png" width="16" height="17"></a><br><br></li></ul></div><div id="infodialog" title="Loan Repayment Calculator"></div></div></div>';

		e.html(source);

		startListening();

			

		render();
	}
	

	init(this);
		
  };

})( jQuery );



