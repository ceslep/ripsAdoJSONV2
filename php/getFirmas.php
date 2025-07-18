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
            
            $sql=" select paciente,signature,evolucion.fecha,nombres from evolucion";
            $sql.=" inner join total_pacientes on evolucion.identificacion=total_pacientes.identificacion";
            $sql.=" order by evolucion.fecha desc";
            $sql.=" limit 500";
            if ($resultado=mysql_query($sql,$enlace)){
				$datos=array();
				while($dato=mysql_fetch_assoc($resultado)){
					
					$datos[]=$dato;
					
				}
				
				
			}else{
				
				$datos=array("Tipo"=>"Error","Mensaje"=>mysql_error($enlace),"SQL"=>$sql);
				
			}
			
			
			echo json_encode($datos);
