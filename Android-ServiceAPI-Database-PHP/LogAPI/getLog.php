<?php
$connect = mysqli_connect("localhost","id5355724_hcmusattendance","123456","id5355724_demo");


$query = "SELECT * FROM loghistory ";
$data = mysqli_query($connect,$query);

if ($data->num_rows > 0) {
    // output data of each row
    while($row = $data->fetch_assoc()) {
        echo $row["name"]. " - Log: " . $row["log"] ."<br>";
    }
}
?>