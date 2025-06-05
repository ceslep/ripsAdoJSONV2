<?php

			header("Access-Control-Allow-Origin: *");
			require_once("datos_conexion.php");
			require("json_encode.php");
			
			if (isset($_REQUEST['tipo'])){
				$tipo=$_REQUEST['tipo'];
				if ($tipo==="undefined") unset($tipo);
				
			} else $tipo="ORTODONCIA";	
			if (isset($_REQUEST['fecha'])){
				$fecha=$_REQUEST['fecha'];
				if ($fecha==="undefined") unset($fecha);
				
			} else $fecha="curdate()";
			
			//$tipo="ORTODONCIA";
			//$fecha="2018-11-14";
			
			function SumarMinutosFechaStr($FechaStr, $MinASumar){
			  $FechaStr = str_replace("/", " ", $FechaStr);
			  $FechaStr = str_replace(":", " ", $FechaStr);
				
			  $FechaOrigen = explode(" ", $FechaStr);
				
			  $Dia = $FechaOrigen[0];
			  $Mes = $FechaOrigen[1];
			  $Anyo = $FechaOrigen[2];
				
			  $Horas = $FechaOrigen[3];
			  $Minutos = $FechaOrigen[4];
			  $Segundos = $FechaOrigen[5];
				
			  // Sumo los minutos
			  $Minutos = ((int)$Minutos) + ((int)$MinASumar); 
				
			  // Asigno la fecha modificada a una nueva variable
			  $FechaNueva = date("H:i:s",mktime($Horas,$Minutos,$Segundos,$Mes,$Dia,$Anyo));
				
			  return $FechaNueva;
}		
		
		
		function arraySearch($array, $field, $search){
		foreach($array as $key => $value){
			if ($value[$field] === $search)
				return $key;
		}
		return false;
		}
		
		
		function colorrgb1($color){
			
			
			
			      $color=str_replace(";"," ",$color);
			      $color=explode(" ",$color);
				  $color0=sprintf("%X",$color[0]);
  				  if (strlen($color0)<=1) $color0="0".$color0;
				  $color1=sprintf("%X",$color[1]);
				  if (strlen($color1)<=1) $color1="0".$color1;
			      $color2=sprintf("%X",$color[2]);
				  if (strlen($color2)<=1) $color2="0".$color2;
				  $color=$color0.$color1.$color2;
				  $color="#".$color;	
				  return $color;	
		}
		
		function colorrgb($color){
			
			
			
			      $color=str_replace(";"," ",$color);
			      $color=explode(" ",$color);
				  $color=sprintf("rgb(%s,%s,%s)",$color[0],$color[1],$color[2]);
				  return $color;	
		}
			
			function agenda($msql,$tipo,$fecha){
			  $sql="select hora_inicio,hora_final,duracion_de_la_cita,numero_de_consultorios from configuracitas";
			  $sql.=sprintf(" where tipo='%s'",$tipo);
			  $query=mysql_query($sql,$msql);
			  $result = mysql_fetch_array($query);
			  $inicio=$result['hora_inicio'];
			  if (stripos($inicio,"am")>0) $inicio=substr_replace($inicio,":00",stripos($inicio,"am")-1);
			  $final=$result['hora_final'];
			  if (stripos($final,"pm")>0) 
			  {
			     $final=substr_replace($final,":00",stripos($final,"pm")-1);
				 $hora_final=substr($final,1)+12;
				 $hora_media_final=substr($final,2,strlen($final));
				 $final=$hora_final.$hora_media_final;
				 
			  
			  }
			  
			  $duracita=$result['duracion_de_la_cita'];
			  $nocons=$result['numero_de_consultorios'];
			  $t=strtotime($inicio);
			  $a=array();
			  while($t<=strtotime($final))
			  {
			    
			    for($j=0;$j<$nocons;$j++)
				
					 $a[]=array("vhoras"=>sprintf("%s.%d",date("H:i",$t),$j+1),"paciente"=>"","nombres"=>"","procedimiento"=>"","confirmo"=>"","color"=>"","cara"=>"","abono"=>"","conhistoria"=>"");
				
				
				$t=strtotime(SumarMinutosFechaStr(date("d/m/Y H:i:s",$t), $duracita));
				
			  }
			  $sql="select concat_ws('.',time_format(vhoras,'%H:%i'),consultorio) as vhoras,citas.paciente,nombres,procedimientos.nombre as procedimiento,confirmo,if( asistio='N' and enatencion='N' and  conhistoria='N',color,if( asistio='S' and enatencion='N' and conhistoria='N','50;140;190',if (asistio='S' and enatencion='S' and conhistoria='N','83;125;79','00;00;00'))) as color,pagos.tipest,abono,citas.duracion,consultorio,conhistoria from citas";
			  $sql.=" left join paciente on citas.paciente=paciente.historia";
			  $sql.=sprintf(" left join procedimientos on  (citas.procedimiento=procedimientos.codigo) and (citas.tipo=procedimientos.tipoc) and (procedimientos.tipoc='%s')",$tipo);
			  $sql.=" left join pagos on citas.paciente=pagos.paciente and citas.tipo=pagos.tipo";
			  $sql.=sprintf(" where citas.fecha='%s' and citas.tipo='%s' and procedimientos.tipoc='%s' ",$fecha,$tipo,$tipo);
			  $sql.=" UNION ";
			  $sql.=" select concat_ws('.',time_format(vhoras,'%H:%i'),consultorio) as vhoras,cppre.paciente,nombres,procedimientos.nombre as procedimiento,confirmo,if( asistio='N' and enatencion='N' and  conhistoria='N',color,if( asistio='S' and enatencion='N' and conhistoria='N','50;140;190',if (asistio='S' and enatencion='S' and conhistoria='N','83;125;79','00;00;00'))) as color,'AZUL',abono,cppre.duracion,consultorio,conhistoria from cppre";
			  $sql.=" left join cppredata on cppre.paciente=cppredata.historia";
			  $sql.=sprintf(" left join procedimientos on  (cppre.procedimiento=procedimientos.codigo) and (cppre.tipo=procedimientos.tipoc) and (procedimientos.tipoc='%s')",$tipo);
			  $sql.=sprintf(" where cppre.fecha='%s' and cppre.tipo='%s' and procedimientos.tipoc='%s' ",$fecha,$tipo,$tipo);
			  $sql.=" order by vhoras";
			 
			  
			  
			  $result = mysql_query($sql,$msql);
			  while($fila=mysql_fetch_array($result))
			  {
				  
				 
				  $i=arraySearch($a,"vhoras",$fila["vhoras"]);		
				  
				  if ($a[$i]["vhoras"]==$fila["vhoras"]){
					
					$color=colorrgb($fila['color']);		
					$b=array("vhoras"=>$fila['vhoras'],"paciente"=>$fila['paciente'],"nombres"=>utf8_encode($fila['nombres']),"procedimiento"=>utf8_encode($fila['procedimiento']),"confirmo"=>$fila['confirmo'],"color"=>$color,"cara"=>$fila['tipest'],"abono"=>$fila['abono'],"conhistoria"=>$fila["conhistoria"]);  
					$a[$i]=$b;
					$repite=$fila["duracion"]/$duracita;
					
					$horacita=substr($fila['vhoras'],0,5);
					
					$t=strtotime($horacita);
					
					
					for($j=1;$j<=$repite-1;$j++){
						
						$t=strtotime(SumarMinutosFechaStr(date("d/m/Y H:i:s",$t), $duracita));
						$vhoras=sprintf("%s.%d",date("H:i",$t),$fila["consultorio"]);
						$i=arraySearch($a,"vhoras",$vhoras);	
						$b=array("vhoras"=>$vhoras,"paciente"=>$fila['paciente'],"nombres"=>utf8_encode($fila['nombres']),"procedimiento"=>utf8_encode($fila['procedimiento']),"confirmo"=>$fila['confirmo'],"color"=>$color,"cara"=>$fila['tipest'],"abono"=>$fila['abono'],"conhistoria"=>$fila["conhistoria"]);  
						$a[$i]=$b;
					}
				  }
				  	  
				
				 
			  }
			  return json_encode($a);
			}
			$enlace =  mysql_connect($host, $user, $pass);
			mysql_select_db($database,$enlace);
			echo agenda($enlace,$tipo,$fecha);
			mysql_close($enlace);

?>