(function( $ ) {
  $.fn.stampDutyCalculator = function(html, baseurl, loancalc) {	
	
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
		var state = $("#state").val();
		
		var property_value = removeCommas($("#property_value").val());
		property_value = parseFloat(property_value);			
		
		var loan_amount = removeCommas($("#loan_amount").val());
		loan_amount = parseFloat(loan_amount);		
		
		var property_type = $('input:radio[name=property_type]:checked').val();
		var first_home_buyer = $('input:radio[name=first_home_buyer]:checked').val();		
				
		if ( isNaN(property_value) )
			property_value = 0;
		
		if ( isNaN(loan_amount) )
			loan_amount = 0;
			
		return {state: state, 
		property_value: property_value, 
		loan_amount: loan_amount, 
		property_type: property_type, 
		first_home_buyer: first_home_buyer};
	}
	
	$( "#property_value_slider" ).slider({ min: 0, max: 5000000, step: 5000, range: "min", animate: "true", value: 7.25,
			slide: function( event, ui ) {
				$( "#property_value" ).val( ui.value );
			},	
			stop: function( event, ui ) {
				$( "#property_value" ).val( ui.value );
				redraw();
			}		
	 });	
		
	$( "#loan_amount_slider" ).slider({ min: 1000, max: 5000000, step: 5000, range: "min", animate: "true", value: 100000,
			slide: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
			},
			stop: function( event, ui ) {
				$( "#loan_amount" ).val( addCommas(ui.value) );
				redraw();
			}
	});
		
	$("#property_value").change(function() {
		
		redraw();		
		var v = parseFloat($("#property_value").val());
		$( "#property_value_slider" ).slider({ value: v });		
	});	
	 
	$("#loan_amount").change(function() {

		redraw();		
		var v = removeCommas($("#loan_amount").val());
		v = parseFloat(v);
		
		$( "#loan_amount_slider" ).slider({ value: v });
	});	 
	
	$("#state").change(function() {
		redraw();
	});	
	 			 
	$("input[name=property_type]").change(function() {
		redraw();
	});

	$("input[name=first_home_buyer]").change(function() {
		redraw();
	});
	
	function redraw()
	{
		var inputs = get_inputs();		
		var arr = new Array();
		var i = 0, j = 0;
		var duty = 0;
		var registration_fee = 0;
		var transfer_fee = 0;
		
		// http://www.varcalc.com.au/calculators/main/640AU/stampduty.asp		
		
		if (inputs.state == "ACT")
		{
			arr[i++] = {min:0, max:200000, f:0, p:2.40, q:0};
			arr[i++] = {min:200001, max:300000, f:4800, p:3.70, q:200001};
			arr[i++] = {min:300001, max:500000, f:8550, p:4.75, q:300000};
			arr[i++] = {min:500001, max:750000, f:18050, p:5.50, q:500000};
			arr[i++] = {min:750000, max:1000000, f:31800, p:6.50, q:750000};
			arr[i++] = {min:1000000, max:100000000, f:48050, p:7.25, q:1000000};

			registration_fee = 110;
			transfer_fee = 213;	
		}
		else				
		if (inputs.state == "NSW")
		{			
			arr[i++] = {min:0, max:14000, f:0, p:1.25, q:0}; 			
			arr[i++] = {min:14001, max:30000, f:175, p:1.5, q:14000};	
			arr[i++] = {min:30001, max:80000, f:415, p:1.75, q:30000};	
			arr[i++] = {min:80001, max:300000, f:1290, p:3.5, q:80000};	
			arr[i++] = {min:300001, max:1000000, f:8990, p:4.5, q:300000};	
			arr[i++] = {min:1000000, max:3000000, f:40490, p:5.5, q:1000000};	
			arr[i++] = {min:3000000, max:10000000, f:0, p:7, q:3000000};	
			
			registration_fee = 102;
			transfer_fee = 204;					
		}
		else
		if (inputs.state == "NT")
		{			
			registration_fee = 109;
			transfer_fee = 109;
		}		
		else
		if (inputs.state == "QLD")
		{
			if (inputs.property_type == "investment")
			{
				arr[i++] = {min:0, max:5000, f:0, p:0, q:0};
				arr[i++] = {min:5001, max:105000, f:0, p:1.5, q:5000};
				arr[i++] = {min:105001, max:480000, f:1500, p:3.5, q:105000};
				arr[i++] = {min:480001, max:980000, f:14625, p:4.5, q:480000};
				arr[i++] = {min:980000, max:100000000, f:37125, p:5.25, q:980000};
			}
			else
			{											
				arr[i++] = {min:0, max:350000, f:0, p:1, q:0};
				arr[i++] = {min:350001, max:540000, f:3500, p:3.5, q:350000};
				arr[i++] = {min:540001, max:980000, f:10150, p:4.5, q:540000};
				arr[i++] = {min:980000, max:100000000, f:29950, p:5.25, q:980000};						
			}
			
			registration_fee = 137.10;
					
			transfer_fee = 137.10;
			
			if (inputs.property_value > 180000)
				transfer_fee += 28.8 * (inputs.property_value - 180000) / 10000;		
		}
		else	
		if (inputs.state == "SA")
		{
			arr[i++] = {min:0, max:12000, f:0, p:1, q:0};
			arr[i++] = {min:12001, max:30000, f:120, p:2, q:12000};
			arr[i++] = {min:30001, max:50000, f:480, p:3, q:30000};
			arr[i++] = {min:50001, max:100000, f:1080, p:3.5, q:50000};
			arr[i++] = {min:100001, max:200000, f:2830, p:4, q:100000};
			arr[i++] = {min:200001, max:250000, f:6830, p:4.25, q:200000};			
			arr[i++] = {min:250001, max:300000, f:8955, p:4.75, q:250000};
			arr[i++] = {min:300001, max:500000, f:11330, p:5, q:300000};			
			arr[i++] = {min:500000, max:100000000, f:21330, p:5.5, q:500000};
			
			registration_fee = 144;
						
			if (inputs.property_value < 5000)
				transfer_fee = 144;
			else
			if (inputs.property_value > 5000 && inputs.property_value < 20001)
				transfer_fee = 159
			else
			if (inputs.property_value > 20000 && inputs.property_value < 40001)
				transfer_fee = 175;
			else
			if (inputs.property_value > 40000)	
				transfer_fee = 245 + 71 * (inputs.property_value - 50000) / 10000;								
		}
		else
		if (inputs.state == "TAS")
		{
			arr[i++] = {min:0, max:1300, f:20, p:0, q:0};
			arr[i++] = {min:13001, max:25000, f:20, p:1.75, q:13000};
			arr[i++] = {min:25001, max:75000, f:435, p:2.25, q:25000};
			arr[i++] = {min:75001, max:200000, f:1560, p:3.5, q:75000};
			arr[i++] = {min:200001, max:375000, f:5935, p:4.35, q:200000};
			arr[i++] = {min:375001, max:725000, f:12935, p:4.25, q:375000};
			arr[i++] = {min:725001, max:100000000, f:27810, p:4.50, q:725000};
			
			registration_fee = 123.12;
			transfer_fee = 188.64;				
		}		
		else			
		if (inputs.state == "VIC")
		{
			if (inputs.property_type == "investment")
			{													
				arr[i++] = {min:0, max:25000, f:0, p:1.4, q:0};
				arr[i++] = {min:25001, max:130000, f:350, p:2.4, q:25000};
				arr[i++] = {min:130001, max:960000, f:2870, p:6, q:130000};
				arr[i++] = {min:960001, max:100000000, f:0, p:5.5, q:0};
			}
			else
			{			
				arr[i++] = {min:0, max:130000, f:0, p:0, q:0};
				arr[i++] = {min:130000, max:440000, f:2870, p:5, q:130000};
				arr[i++] = {min:440001, max:550000, f:18370, p:6, q:440000};
				arr[i++] = {min:550000, max:100000000, f:0, p:0, q:0};	
			}
		
			registration_fee = 105;			
			transfer_fee = 127.90;	
		}
		else
		if (inputs.state == "WA")
		{
			registration_fee = 160;
/*			
			if (inputs.property_type == "investment")
			{
				arr[i++] = {min:0, max:80000, f:0, p:1.9, q:0};
				arr[i++] = {min:80001, max:100000, f:1520, p:2.85, q:80000};
				arr[i++] = {min:100001, max:250000, f:2090, p:3.8, q:100000};
				arr[i++] = {min:250001, max:500000, f:7790, p:4.75, q:250000};
				arr[i++] = {min:500001, max:100000000, f:19665, p:5.15, q:500000};
			}
			else
			{*/
			
				if (inputs.first_home_buyer == "no")
				{
					arr[j++] = {min:0, max:120000, f:0, p: 1.9, q: 0};
					arr[j++] = {min:120001, max:150000, f:2280, p:2.85, q: 120000};
					arr[j++] = {min:150001, max:360000, f:3135, p:3.8, q: 150000};
					arr[j++] = {min:360001, max:725000, f:11115, p:4.75, q:360000};
					arr[j++] = {min:725001 , max:10000000, f:28453, p:5.15, q:725000};	
				}
			//}
			
			// transfer fee
			
			var t = new Array();
			i = 0;
			t[i++] = {min:0, max:85000, val: 160};
			t[i++] = {min:85001, max:120000, val: 170};
			t[i++] = {min:120001, max:200000, val: 190};
			t[i++] = {min:200001, max:300000, val: 210};
			t[i++] = {min:300001, max:400000, val: 230};
			t[i++] = {min:400001, max:500000, val: 250};
			t[i++] = {min:500001, max:600000, val: 270};
			t[i++] = {min:600001, max:700000, val: 290};
			t[i++] = {min:700001, max:800000, val: 310};
			t[i++] = {min:800001, max:900000, val: 330};
			t[i++] = {min:900001, max:1000000, val: 350};
			t[i++] = {min:1000001, max:1100000, val: 370};
			t[i++] = {min:1100001, max:1200000, val: 390};
			t[i++] = {min:1200001, max:1300000, val: 410};
			t[i++] = {min:1300001, max:1400000, val: 430};
			t[i++] = {min:1400001, max:1500000, val: 450};	
			t[i++] = {min:1500001, max:1600000, val: 470};
			t[i++] = {min:1600001, max:1700000, val: 490};	
			t[i++] = {min:1700001, max:1800000, val: 510};
			t[i++] = {min:1800001, max:1900000, val: 530};
			t[i++] = {min:1900001, max:2000000, val: 550};	
			t[i++] = {min:2000000, max:100000000, val: 550};		
			
			for (var j = 0; j < t.length; j++)
			{
				if (inputs.property_value >= t[j].min && inputs.property_value <= t[j].max)
				{
					transfer_fee = t[j].val;
					
					if (t[j].min == 2000000)
						transfer_fee = 550 + 20 * (inputs.property_value / 100000);
					break;
				}
			}														
		}
		
		for (var i = 0; i < arr.length; i++)
		{
			if (inputs.property_value >= arr[i].min && inputs.property_value <= arr[i].max)
			{
				duty = arr[i].f + (arr[i].p / 100.0) * (inputs.property_value - arr[i].q);
				break;
			}
		}	
		
		if (inputs.state == "NT")
		{
			// special rule for NT
			
			if (inputs.property_type == "investment" || inputs.first_home_buyer == "no")
			{
				if (inputs.property_value < 525000)
				{
					var v = inputs.property_value / 1000;
					duty = (0.06571441 * Math.pow(v, 2) ) + 15.0 * v;
				}
				else
					duty = 0.0495 * inputs.property_value;
			}
		}
		
		if (inputs.state == "VIC" && inputs.first_home_buyer && inputs.property_type != "investment")
		{
			// 20 % reduction for 1st home buyers in VIC
			
			duty = 0.8 * duty;
		}
			
		$("#duty").html("$" + addCommas(duty.toFixed(2)));	
		$("#registration_fee").html("$" + addCommas(registration_fee.toFixed(2)));
		$("#transfer_fee").html("$" + addCommas(transfer_fee.toFixed(2)));			
		
		var total = duty + registration_fee + transfer_fee;
		
		$("#total").html("$" + addCommas(total.toFixed(2)));
		
		result = new Array();
		var i = 0;
		result[i++] = {key: "Stamp Duty", value: ""};
		result[i++] = {key: "state", value: inputs.state};
		result[i++] = {key: "property value", value: addCommas(inputs.property_value.toFixed(0))};
		result[i++] = {key: "loan amount", value: "$" + addCommas(inputs.loan_amount.toFixed(0))};
		
		result[i++] = {key: "property type", value: inputs.property_type};
		result[i++] = {key: "first home buyer", value: inputs.first_home_buyer};
								
		result[i++] = {key: "registration fee", value: "$" + addCommas(registration_fee.toFixed(2))};				
		result[i++] = {key: "transfer fee", value: "$" + addCommas(transfer_fee.toFixed(2))};		
		result[i++] = {key: "stamp duty", value: "$" + addCommas(duty.toFixed(2))};		
		
		result[i++] = {key: "total", value: "$" + addCommas(total.toFixed(2))};	
	}
	
	$(".info").click(function() {	
		//alert("Stamp Duty calculator. The Stamp Duty Calculator calculates transfer duty, mortgage duty, mortgage registration and transfer fees for properties with an existing dwelling. Different rates of duty and fees may apply for vacant land and you should contact the OSR in your state or territory for the correct rates.");
		
		$( "#infodialog" ).html("<h3>Stamp Duty calculator.</h3><p>The Stamp Duty Calculator calculates transfer duty, mortgage duty, mortgage registration and transfer fees for properties with an existing dwelling.</p<p> Different rates of duty and fees may apply for vacant land and you should contact the OSR in your state or territory for the correct rates.</p>");
		

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



