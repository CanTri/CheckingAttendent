<?php
error_reporting(E_ERROR | E_PARSE);
$myObj->baselink = "https://checkingattendance.000webhostapp.com/";


$myJSON = json_encode($myObj,JSON_UNESCAPED_SLASHES);

echo $myJSON;
?>