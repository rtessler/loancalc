//function loancalc() {

	function executeFunctionByName(functionName, context /*, args */) {
	    var args = Array.prototype.slice.call(arguments, 2);
	    var namespaces = functionName.split(".");
	    var func = namespaces.pop();

	    for (var i = 0; i < namespaces.length; i++) {
	        context = context[namespaces[i]];
	    }
	    return context[func].apply(context, args);
	}
	
	function addCommas(nStr)
	{	
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;

		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}

		return x1 + x2;
	}	
	
	function removeCommas(str)
	{
		if (!str)
			return "";
			
		return str.replace(/\,/g, "");
	}
	
	function format(x, fmt) {

	    switch (fmt) {
	        case "C":
	            return app.currency_symbol + addCommas(x.toFixed(2));
	            break;
	    }
	}

	function getVal(e) {

	    var val = removeCommas(e.val());
	    val = parseFloat(val);

	    if (isNaN(val))
	        return 0;

	    return val;
	}

	function getInt(e) {

	    val = parseInt(e.val());

	    if (isNaN(val))
	        return 0;

	    return val;
	}

	function resultToString(arr)
	{
		var str = "";
		
		for (var i = 0; i < arr.length; i++)
		{
			str += arr[i].key;
			str += ": \t\t";
			str += arr[i].value;
			str += "\r\n";		
		}
		
		return str;
	}


				
//function changeImages(baseurl)
//{
//	$(".calc .info img").attr("src", baseurl + "images/info.png");
//	$(".calc .print img").attr("src", baseurl + "images/print.png");
//	$(".calc .save img").attr("src", baseurl + "images/save.png");
//	$(".calc .email img").attr("src", baseurl + "images/email.png");	
//}	

	