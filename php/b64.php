<?php
	header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			mysql_select_db($database,$enlace);
	$query = mysql_query("SELECT foto FROM paciente where foto is not null limit 1");
	while($data=mysql_fetch_array($query)) {
    header('Content-type: image/jpg');
    echo $data['myImage'];
}
?>