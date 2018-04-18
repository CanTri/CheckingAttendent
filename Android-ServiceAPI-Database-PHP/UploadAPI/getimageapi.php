<?php
error_reporting(0);
$connect = mysqli_connect("localhost","id5355724_hcmusattendance","123456","id5355724_demo");

$name = $_POST['name'];


$query = "SELECT * FROM mystudent WHERE name = '$name'";
class Student
	{
		#function Student($name,$link)
		#{
		#	$this->name = $name;
		#	$this->link = $link;
		#}
		function Student($link)
		{
			$this->link = $link;
		}
	}
$data = mysqli_query($connect,$query);
$arrayStudent = array();
while($row = mysqli_fetch_assoc($data))
{
	array_push($arrayStudent, new Student($row['imagelink']));
}

echo json_encode($arrayStudent,JSON_UNESCAPED_SLASHES);


?>
