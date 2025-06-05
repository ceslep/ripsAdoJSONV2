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
			$sql='select paciente.tdei,paciente.identificacion,';
			$sql.='"" as coda,"4" as tu,paciente.apellido1,paciente.apellido2,paciente.nombre1,paciente.nombre2,';
			$sql.='round((to_days(curdate())-to_days(fecnac))/365.242159) as edad,';
			$sql.='"1" as ume,left(sexo,1) as sexo,municipios.codepto,municipios.codmunic,"U" as zona';
			$sql.=' from paciente';
			$sql.=' left join municipios on paciente.ciudad_residencia=municipios.codigo';
			$sql.=' inner join citas on paciente.historia=citas.paciente and citas.fecha=evolucion.fecha';
			$sql.=" left join evolucion on citas.ind=evolucion.citasind";
			$sql.=' where citas.asistio="S" and evolucion.arips="S" and';
			$sql.=sprintf(" citas.fecha between '%s' and '$fecha2'",$fecha1,$fecha2);
			$sql.=' and paciente.identificacion<>"0"';
			$sql.=" UNION";
			$sql.=' select cppredata.tdei,cppredata.identificacion,';
			$sql.='"" as coda,"4" as tu,cppredata.apellido1,cppredata.apellido2,cppredata.nombre1,cppredata.nombre2,';
			$sql.='round((to_days(curdate())-to_days(fecnac))/365.242159) as edad,';
			$sql.='"1" as ume,left(sexo,1) as sexo,municipios.codepto,municipios.codmunic,"U" as zona';
			$sql.=' from cppredata';
			$sql.=' left join municipios on cppredata.ciudad_residencia=municipios.codigo';
			$sql.=' inner join cppre on cppredata.historia=cppre.paciente';
			$sql.=" left join evolucion on cppre.ind=evolucion.citasind and cppre.fecha=evolucion.fecha";
			$sql.=' where cppre.asistio="S" and evolucion.arips="S" and';
			$sql.=sprintf(" cppre.fecha between '%s' and '$fecha2'",$fecha1,$fecha2);
			$sql.=' and cppredata.identificacion<>"0"';
			//$sql.=' order by fecha';
			
			//echo $sql;
			//exit(0);
			mysql_select_db($database,$enlace);
			
			
		
			$datos=array();
			if ($resultado=mysql_query($sql,$enlace)){
			
			$num_fields=0;
			while($dato=mysql_fetch_assoc($resultado)) //$datos[]=$dato;
			{
				
			
			$dato['nombre1']=utf8_encode($dato['nombre1']);
			$dato['nombre2']=utf8_encode($dato['nombre2']);
			$dato['apellido1']=utf8_encode($dato['apellido1']);
			$dato['apellido2']=utf8_encode($dato['apellido2']);
			//$dato['procedimiento']=utf8_encode($dato['procedimiento']);
			
			$datos[]=$dato;
								
			}
			}
			else{
				
				$datos=array("Tipo"=>"Error","Mensaje"=>mysql_error($enlace),"SQL"=>$sql);
				
			}
			
			
			echo json_encode($datos);
			mysql_close($enlace);
?>