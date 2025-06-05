<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			
			if (isset($_REQUEST['fecha'])){
				$fecha=$_REQUEST['fecha'];
				if ($fecha==="undefined") unset($fecha);
				
			}	
			mysql_select_db($database,$enlace);
			$sql="select identificacion,nombresp as nombres from hoja_vida where activo='S' and tipo='Auxiliar' order by nombres";
			
		
			
			$resultado=mysql_query($sql,$enlace);
			$datos=array();
			while($dato=mysql_fetch_assoc($resultado)) {
				
				$dato['nombres']=utf8_encode($dato['nombres']);
				$datos[]=$dato;
				
			}
			
			echo json_encode($datos);
			mysql_close($enlace);
?>