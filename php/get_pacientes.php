<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			
			$criterio=$_REQUEST['criterio'];	
			mysql_select_db($database,$enlace);
			mysql_query("SET CHARACTER SET utf8 ",$enlace);
			$sql="select identificacion,nombres from total_pacientes";
			$sql.=" where identificacion like '%$criterio%' or nombres like '%$criterio%'";
			
		
			
			$resultado=mysql_query($sql,$enlace);
			$datos=array();
			while($dato=mysql_fetch_assoc($resultado)) {
				
				
				$datos[]=$dato;
				
			}
			
			echo json_encode($datos);
			mysql_close($enlace);
?>