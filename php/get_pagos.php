<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			
			$identificacion=$_REQUEST['identificacion'];	
			mysql_select_db($database,$enlace);
			mysql_query("SET CHARACTER SET utf8 ",$enlace);
			$sql="select abonos.fecha,abonos.facturano,valor_abono as valor,detalle,tipo_pago,personal_salud.nombres as doctor from abonos";
			$sql.=" left join personal_salud on abonos.doctor=personal_salud.identificacion";
			$sql.=" where abonos.identificacion='$identificacion' order by fecha desc";
			
			//echo $sql;		
		
			
			$resultado=mysql_query($sql,$enlace);
			$datos=array();
			while($dato=mysql_fetch_assoc($resultado)) {
				
				
				$datos[]=$dato;
				
			}
			
			echo json_encode($datos);
			mysql_close($enlace);
?>