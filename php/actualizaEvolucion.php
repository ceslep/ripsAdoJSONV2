<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require_once("jsede.php");
			

			$enlace =  mysql_connect($host, $user, $pass);

			$data=json_decode(file_get_contents('php://input'));	
			$campo=$data->campo;
			$value=$data->value;
			$ind=$data->ind;
			
			mysql_select_db($database,$enlace);
			
			$sql="update evolucion set $campo='$value' where ind=$ind";
			mysql_query($sql,$enlace);
		    echo json_encode(array("Informacion"=>"Ok"));
			mysql_close($enlace);
?>