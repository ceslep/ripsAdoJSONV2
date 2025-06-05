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
            $sql="";
			$sql.='select evolucion.factura_consulta,"660010021401" as cod_prestador,paciente.tdei,paciente.identificacion,date_format(evolucion.fecha,"%d/%m/%Y") as fecha,';
            $sql.='autorizacion_consulta,tipoprocedimiento,evolucion.ambito,evolucion.finalidad,personal_que_atiende,evolucion.diag_previo,evolucion.diag_relacionado,';
            $sql.='evolucion.complicacion,evolucion.forma_realizacion_qx,evolucion.valor_procedimiento';
            $sql.=' from evolucion';
            $sql.=' inner join paciente on evolucion.paciente=paciente.historia';
            $sql.=' inner join procedimientos on evolucion.procedimiento=procedimientos.codigo';
            $sql.=sprintf(" where arips='S' and evolucion.fecha between '%s' and '%s'",$fecha1,$fecha2);
            $sql.=' UNION ';
            $sql.=' select evolucion.factura_consulta,"660010021401" as cod_prestador,cppredata.tdei,cppredata.identificacion,date_format(evolucion.fecha,"%d/%m/%Y") as fecha,';
            $sql.='autorizacion_consulta,tipoprocedimiento,evolucion.ambito,evolucion.finalidad,personal_que_atiende,evolucion.diag_previo,evolucion.diag_relacionado,';
            $sql.='evolucion.complicacion,evolucion.forma_realizacion_qx,evolucion.valor_procedimiento';
            $sql.=' from evolucion';
            $sql.=' inner join cppredata on evolucion.paciente=cppredata.historia';
            $sql.=' inner join procedimientos on evolucion.procedimiento=procedimientos.codigo';
            $sql.=sprintf(" where arips='S' and evolucion.fecha between '%s' and '%s'",$fecha1,$fecha2);
			$sql.=' order by fecha';
			
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