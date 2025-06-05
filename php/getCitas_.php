<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			
			if (isset($_REQUEST['paciente'])){
				$paciente=$_REQUEST['paciente'];
				if ($paciente==="undefined") unset($paciente);
				
			}	
			
			if (isset($_REQUEST['fecha1'])){
				$fecha1=$_REQUEST['fecha1'];
				if ($fecha1==="undefined") unset($fecha1);
				
			}

			if (isset($_REQUEST['fecha2'])){
				$fecha2=$_REQUEST['fecha2'];
				if ($fecha2==="undefined") unset($fecha2);
				
			}			
			
			if (isset($_REQUEST['tipo'])){
				$tipo=$_REQUEST['tipo'];
				if ($tipo==="undefined") unset($tipo);
				
			}	
			//mysql_set_charset($enlace,"utf8");
			mysql_query("SET CHARACTER SET utf8 ",$enlace);
			
			
			$sql="Select evolucion.citasind as ind,total_pacientes.identificacion,total_pacientes.nombres,evolucion.fecha,abonos.forma_de_pago,if(abonos.valor_abono is null,0,abonos.valor_abono) as valor_abono,abonos.items,abonos.tipo_pago,arips from evolucion";
			$sql.=" inner join total_pacientes on evolucion.paciente=total_pacientes.historia";
			$sql.=" left join abonos on evolucion.paciente=abonos.paciente and abonos.fecha=evolucion.fecha";
			$sql.=" where 1=1";
			$sql.=" and evolucion.fecha between '$fecha1' and '$fecha2'";
			$sql.=" order by evolucion.fecha desc,total_pacientes.nombres";
			
			mysql_select_db($database,$enlace);
			
			
		//	echo $sql;
			$datos=array();
			if ($resultado=mysql_query($sql,$enlace)){
			
			$num_fields=0;
			while($dato=mysql_fetch_assoc($resultado)) //$datos[]=$dato;
			{
				
			
			$dato['nombres']=utf8_encode($dato['nombres']);
			//$dato['procedimiento']=utf8_encode($dato['procedimiento']);
			
			$datos[]=$dato;
								
			}
			}
			else{
				echo $sql;
				$datos=array("Tipo"=>"Error","Mensaje"=>mysql_error($enlace),"SQL"=>$sql);
				
			}
			
			
			echo json_encode($datos);
			mysql_close($enlace);
?>