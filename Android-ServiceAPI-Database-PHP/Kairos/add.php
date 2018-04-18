<?php
error_reporting(0);
include("Kairos.php");
require "checkkey.php";
$image      = $_POST['image'];
$gallery_name = $_POST['gallery_name'];
$subject_id = $_POST['subject_id'];
$argumentArray =  array(
    "image" => $image,
    "gallery_name" => $gallery_name,
    "subject_id" => $subject_id
);
$obj = new Kairos('7a2d50db','d2de832edbb3eeafafe949c7fdd7f36a');
$response   = $obj->enroll($argumentArray);
echo $response;


?>