<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require_once("jsede.php");
			

			$enlace =  mysql_connect($host, $user, $pass);

			$data=file_get_contents('php://input');	
			$Array = json_decode($data);
            $sql="";
            $sqls="";
			mysql_select_db($database,$enlace);
			
			$error=true;
			foreach($Array as $dato) {
		
				$ind=$dato->citasind;
				$fecha=$dato->fecha;
                $sql=" update evolucion set arips='S' where citasind='$ind' and fecha='$fecha';";
                $sqls.=$sql;
				if (mysql_query($sql,$enlace)) $error=false;
				else {
					$error=true;
				break;
				}	
				usleep(10000);
				
			}
		
			$datos=array();
			if (!$error){
			
				$datos=array("Tipo"=>"Actualización","Mensaje"=>"Actualizado Correctamente","SQLs"=>$sqls);
								
			}
			
			else{
				
				$datos=array("Tipo"=>"Error","Mensaje"=>mysql_error($enlace),"SQL"=>$sql);
				
			}
			
			echo json_encode($datos);
			mysql_close($enlace);
?>