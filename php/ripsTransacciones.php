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
			$sql="select '761470060801' as cod_prestador,'MARIA EUGENIA LONDOÑO GALVIS' as razon_social,'CC' as tdei,'31405200' as cedula,evolucion.factura_consulta,date_format(evolucion.fecha,'%d/%m/%Y') as fecha_factura,";
			$sql.="date_format('$fecha1','%d/%m/%Y') as fecha_inicial,date_format('$fecha2','%d/%m/%Y') as fecha_final,'76147' as codAdmin,'MUNICIPIO CARTAGO' as nomEntidad,'' as numContrato,'' as planBeneficios,0 as numPoliza,0 as copago,";
			$sql.="0 as comision,0 as total_descuentos,0 as netoApagar from evolucion";
         
			$sql.=sprintf(" where evolucion.arips='S' and evolucion.fecha between '%s' and '%s'",$fecha1,$fecha2);
			//$sql.=" group by evolucion.identificacion";
           
			$sql.=' order by evolucion.fecha';
			
			//echo $sql;
			//exit(0);
			mysql_select_db($database,$enlace);
			
			
		
			$datos=array();
			if ($resultado=mysql_query($sql,$enlace)){
			
			$num_fields=0;
			while($dato=mysql_fetch_assoc($resultado)) //$datos[]=$dato;
			{

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