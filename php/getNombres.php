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
			$sql="select citas.identificacion as paciente,nombres from citas";
			$sql.=" inner join paciente on citas.paciente=paciente.historia";
		//$sql.=" inner join procedimientos on citas.procedimiento=procedimientos.codigo";
			$sql.=" where 1=1";
			if (isset($fecha)&&($fecha!=""))
			$sql.=" and citas.fecha='$fecha'";	
			else
			$sql.=" and citas.fecha=curdate()";
			
			$sql.=" UNION ";
			$sql.=" select cppre.identificacion,nombres from cppre";
			$sql.=" inner join cppredata on cppre.paciente=cppredata.identificacion";
		//	$sql.=" inner join procedimientos on cppre.procedimiento=procedimientos.codigo";
			$sql.=" where 1=1";
			if (isset($fecha)&&($fecha!=""))
			$sql.=" and cppre.fecha='$fecha'";	
			else
			$sql.=" and cppre.fecha=curdate()";
			$sql.=" order by nombres";
			
			//echo $sql;
			
			$resultado=mysql_query($sql,$enlace);
			$datos=array();
			while($dato=mysql_fetch_assoc($resultado)) {
				
				$dato['nombres']=utf8_encode($dato['nombres']);
				$datos[]=$dato;
				
			}
			
			echo json_encode($datos);
			mysql_close($enlace);
?>