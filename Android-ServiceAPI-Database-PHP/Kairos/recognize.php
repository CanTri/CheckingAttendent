<?php
//------------------------------------
// Kairos.php
// sends curl requests to Kairos ID API  
// created: November 2016
// author: Steve Rucker
//------------------------------------
error_reporting(0);
include("Kairos.php");
require "checkkey.php";
$image      = $_POST['image'];
$gallery_name = $_POST['gallery_name'];
$argumentArray =  array(
    "image" => $image,
    "gallery_name" => $gallery_name
);
$obj = new Kairos('7a2d50db','d2de832edbb3eeafafe949c7fdd7f36a');
$response   = $obj->recognize($argumentArray);
echo $response;


?>