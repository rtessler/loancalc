loancalc
========

mortgage calculation plugins

there are 8 jquery plugins:

loanRepaymentCalculator
extraRepaymentCalculator
lumpSumCalculator
splitLoanCalculator
principalAndInterestCalculator
borrowingPowerCalculator
stampDutyCalculator
loanComparisonCalculator

to run a plugin:

	// loancalcURL is the site where the code lives
	// key is the password for your domain

	var loancalcURL = "http://www.zgnome.com/sites/loancalc/";
	var key =  "zgnome";
	
	var c = new loancalc();

	c.getCalulator("name of calculator plugin", "calculator", loancalcURL, key);
	
Security

We are attempting to restrict the domains that access the plugins
in get_javascript.php there is a list of domains and passwords
the idea is that sterling owns the software and makes it available to third parties
the jaavascript is minified and passed to the caller via ajax only if their domain
is in the list and the password is correct
get_javascript.php allows cross domain data
Only loancalc.js and loancalc.css are needed by the caller

$authorized_users = array("www.spionline.com.au" => "spionline",
			"www.rtessler.com" => "rtessler",
			"www.zgnome.com" => "zgnome",
			"localhost" => "localhost",
			"www.fredtessler.com" => "fred",
            "www.helpwise.com.au"  => "helpwise");