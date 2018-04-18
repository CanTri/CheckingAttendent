<?php
error_reporting(0);
$client_id = '8626efc30438dff';

#$file = file_get_contents("image.jpg");

$url = 'https://api.imgur.com/3/image.json';
$headers = array("Authorization: Client-ID $client_id");
$image      = $_POST['image'];
$pvars  = array('image' => $image);
#$pvars  = array('image' => base64_encode($file));

$curl = curl_init();

curl_setopt_array($curl, array(
   CURLOPT_URL=> $url,
   CURLOPT_TIMEOUT => 30,
   CURLOPT_POST => 1,
   CURLOPT_RETURNTRANSFER => 1,
   CURLOPT_HTTPHEADER => $headers,
   CURLOPT_POSTFIELDS => $pvars
));

$json_returned = curl_exec($curl); // blank response
#echo "Result: " . $json_returned ;
$data = json_decode($json_returned);
echo $data->data->link;

curl_close ($curl); 

?>