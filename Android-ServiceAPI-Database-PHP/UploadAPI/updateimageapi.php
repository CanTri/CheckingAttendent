<?php
error_reporting(0);
$connect = mysqli_connect("localhost","id5355724_hcmusattendance","123456","id5355724_demo");

$link = $_POST['link'];
$name = $_POST['name'];

$query = "UPDATE mystudent SET imagelink = '$link' WHERE name = '$name'  ";
$data = mysqli_query($connect,$query);


?>
