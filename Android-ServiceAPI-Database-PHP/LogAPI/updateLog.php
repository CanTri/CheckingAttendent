<?php
$connect = mysqli_connect("localhost","id5355724_hcmusattendance","123456","id5355724_demo");


if(isset($_POST['log']))
{
	$log = $_POST['log'];
}
if(isset($_POST['name']))
{
	$name = $_POST['name'];
}

$query = "UPDATE loghistory SET log = CONCAT(log,'$log') WHERE name = '$name'  ";
$data = mysqli_query($connect,$query);


?>
