<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			
			mysql_select_db($database,$enlace);
			$sql="select nombre,descripcion from especialidades";
			
			$resultado=mysql_query($sql,$enlace);
			$datos=array();
			while($dato=mysql_fetch_assoc($resultado)) $datos[]=$dato;
			
			echo json_encode($datos);
			mysql_close($enlace);
?>