<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			if (isset($_REQUEST['paciente'])){
				$paciente=$_REQUEST['paciente'];
				if ($paciente==="undefined") unset($paciente);
				
			}
			
			mysql_query("SET CHARACTER SET utf8 ",$enlace);
			
			mysql_select_db($database,$enlace);
			
			$sql="select evolucion.ind,evolucion.fecha,citas.hora_salida as hora,evolucion.paciente,procedimientos.nombre as procedimiento,";
			$sql.="evolucion.anotaciones_cita,evolucion.adicional,procedimientos2.nombre as proxima_cita,citas.auxiliar,citas.especialista,";
			$sql.="evolucion.procedimiento as codproc,evolucion.proxima_cita as codproxima,evolucion.tipo";
			$sql.=" from evolucion";
			$sql.=" inner join procedimientos on evolucion.procedimiento=procedimientos.codigo";
			$sql.=" inner join procedimientos as procedimientos2 on evolucion.proxima_cita=procedimientos2.codigo";
			$sql.=" inner join citas on evolucion.citasind=citas.ind";
			$sql.=" where 1=1";
			$sql.=" and evolucion.paciente='$paciente'";
			$sql.=" order by fecha desc";
			
			//echo $sql;
			
			if ($resultado=mysql_query($sql,$enlace)){
				$datos=array();
				while($dato=mysql_fetch_assoc($resultado)){
					
					$dato['auxiliar']=utf8_encode($dato['auxiliar']);
					$dato['especialista']=utf8_encode($dato['especialista']);
					$datos[]=$dato;
					
				}
				
				
			}else{
				
				$datos=array("Tipo"=>"Error","Mensaje"=>mysql_error($enlace),"SQL"=>$sql);
				
			}
			
			
			echo json_encode($datos);


?>