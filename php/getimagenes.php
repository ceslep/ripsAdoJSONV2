<?php
			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			$enlace =  mysql_connect($host, $user, $pass);
			if (isset($_REQUEST['identificacion'])){
				$identificacion=$_REQUEST['identificacion'];
				if ($identificacion==="undefined") unset($identificacion);
				
			}	
			
			//$identificacion="1087989313";
				
			//mysql_set_charset($enlace,"utf8");
			mysql_query("SET CHARACTER SET utf8 ",$enlace);
			
			mysql_select_db($database_imagenes,$enlace);
			
			$sql="select * from fotos_pacientes";
			$sql.=" where identificacion='$identificacion'";
			
			if ($resultado=mysql_query($sql,$enlace)){
					
				$datos=array();	
				while($dato=mysql_fetch_assoc($resultado)) {
					
				for($i=1;$i<=9;$i++)if ($dato['foto'.$i]!=NULL) $dato['foto'.$i]='data:image/jpg;base64,'.base64_encode($dato['foto'.$i]);
				for($i=1;$i<=3;$i++)if ($dato['rx'.$i]!=NULL) $dato['rx'.$i]='data:image/jpg;base64,'.base64_encode($dato['rx'.$i]);
				for($i=1;$i<=3;$i++)if ($dato['cefalometria'.$i]!=NULL) $dato['cefalometria'.$i]='data:image/jpg;base64,'.base64_encode($dato['cefalometria'.$i]);
				for($i=1;$i<=8;$i++)if ($dato['otros'.$i]!=NULL) $dato['otros'.$i]='data:image/jpg;base64,'.base64_encode($dato['otros'.$i]);
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