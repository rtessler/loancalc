<?php

$calcid = $_GET["calcid"];
$referrer = $_GET["referrer"];
$key = $_GET["key"];

$authorized_users = array("www.spionline.com.au" => "spionline",
			"www.rtessler.com" => "rtessler",
			"www.zgnome.com" => "zgnome",
			"localhost" => "localhost",
			"www.fredtessler.com" => "fred",
            "www.helpwise.com.au"  => "helpwise");
			   
$found = false;

foreach ($authorized_users as $k => $v) {
	
	if ($referrer == $k && $v == $key)
	{
		$found = true;
		break;
	}
}


if ($found == false)
{
	echo $_GET['callback'] . "();"; 
	return;
}


switch ($calcid)
{
case "loanRepaymentCalculator":
	$javascript_filename = "loan_repayment.min.js";
	$html_filename = "loan_repayment.html";
	break;
case "extraRepaymentCalculator":
	$javascript_filename = "extra_repayment.min.js";
	$html_filename = "extra_repayment.html";
	break;
case "lumpSumCalculator":
	$javascript_filename = "lump_sum.min.js";
	$html_filename = "lump_sum.html";
	break;	
case "splitLoanCalculator":
	$javascript_filename = "split_loan.min.js";
	$html_filename = "split_loan.html";
	break;	
case "principalAndInterestCalculator":
	$javascript_filename = "principal_and_interest.min.js";
	$html_filename = "principal_and_interest.html";
	break;	
case "borrowingPowerCalculator":
	$javascript_filename = "borrowing_power.min.js";
	$html_filename = "borrowing_power.html";
	break;
case "stampDutyCalculator":
	$javascript_filename = "stamp_duty.min.js";
	$html_filename = "stamp_duty.html";
	break;
case "loanComparisonCalculator":
	$javascript_filename = "loan_comparison.min.js";
	$html_filename = "loan_comparison.html";
	break;				
}

$javascript = file_get_contents("js/" . $javascript_filename);
$html = file_get_contents($html_filename);

$arr = array();
$arr['name'] = "response";
$arr['file'] = $javascript;
$arr['html'] = $html;

// we may need to know where the data came from
// in the case where it comes from a different server

$path = $_SERVER['SERVER_NAME'];

if ($_SERVER['SERVER_PORT'] != "80")
	$path .= ":" . $_SERVER['SERVER_PORT'];
	
$path .= $_SERVER['SCRIPT_NAME'];

$n = strrpos($path, '/');

if ($n > 1)
	$path =  substr($path, 0, $n);

$arr['path'] = $path;

//$mtype = "application/x-javascript";
//header("Content-Type: $mtype");

echo $_GET['callback'] . "(" . json_encode($arr) . ");"; 

?>