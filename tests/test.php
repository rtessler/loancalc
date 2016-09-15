<?php

//print_r($_SERVER);

echo "SERVER_NAME = " . $_SERVER['SERVER_NAME'] . "<br>";
echo "SERVER_PORT = " . $_SERVER['SERVER_PORT'] . "<br>";
echo "SCRIPT_FILENAME = " . $_SERVER['SCRIPT_FILENAME'] . "<br>";
echo "REQUEST_URI = " . $_SERVER['REQUEST_URI'] . "<br>";
echo "SCRIPT_NAME = " . $_SERVER['SCRIPT_NAME'] . "<br>";

$path = $_SERVER['SERVER_NAME'];

if ($_SERVER['SERVER_PORT'] != "80")
	$path .= ":" . $_SERVER['SERVER_PORT'];
	
$path .= $_SERVER['SCRIPT_NAME'];

$n = strrpos($path, '/');

if ($n > 1)
	$path =  substr($path, 0, $n);

echo "path = " . $path . "<br>";

//print_r($GLOBALS);


?>