<?php

	$from = $_GET["from"];
	$to = $_GET["to"];
	$subject = "Mortgage Calculator: " . $_GET["subject"];
	$message = $_GET["message"];	
		
	$headers = 'From: ' . $from . ' "\r\n"' .
		'Reply-To:' . $from . ' "\r\n"' .
		'X-Mailer: PHP/' . phpversion();	
		
	$arr = array();
			
	if (mail($to, $subject , $message, $headers))
		//echo "email sent";	
		$arr['msg']	= "email sent";
	else
		//echo "error sending email";	
		$arr['msg']	= "error sending email";
		
	echo $_GET['callback'] . "(" . json_encode($arr) . ");";

?>