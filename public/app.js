"use strict";

const url = "/";
var dataUrl = {};
var seleccionado = 0;
jQuery.fn.redraw = function () {
	return this.hide(0, function () {
		$(this).show();
	});
};

Date.prototype.toDateInputValue = (function () {
	var local = new Date(this);
	local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
	return local.toJSON().slice(0, 10);
});

var datosAgenda = [];
var citas = [];
var filtrado = false;
var evolInd;
var tconsulta = false;
var campo;
var vind;
var vvalue;
$(document).ready(() => {


	(async () => {
		const response = await fetch("/url");
		const url = await response.json();
		console.log(url.servidor);
		$("#infoUrl").text(url.servidor);

	})();


	const fechas = (async () => {

		console.log(new Date());
		let d = new Date();
		let year = d.getFullYear();
		let month = d.getMonth();

		$('#fecha1').val(new Date(year, month, "01").toDateInputValue());
		$('#fecha2').val(new Date().toDateInputValue());

	})();


	const getCitas = async () => {

		try {

			let data = { fecha1: $("#fecha1").val(), fecha2: $("#fecha2").val() };
			const response = await fetch(url + "citas", {
				method: 'POST', // or 'PUT'
				body: JSON.stringify(data), // data can be `string` or {object}!
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const datos = await response.json();
			console.log(datos);
			return (datos);
		} catch (error) {
			console.error(error);
			$("#errorcargaModal").modal("show");
		}
	}


	const showCitas = async () => {

		//$("#infoPagos").hide();
		//$("#tresp").hide();
		$("#spinner").show();
		citas = await getCitas();
		console.log(citas);
		$("#spinner").hide();
		//	$("#infoPagos").show();
		//		$("#tresp").show();
		return (citas);

	}


	const dibujaAgenda = async (datosAgenda) => {

		let html = "";
		let efectivo = 0;
		let tarjeta = 0;
		let transferencia = 0;
		seleccionado = 0;
		let total = 0;
		let consignacion = 0;
		let checked = "";
		let k = 0;
		await datosAgenda.forEach(datoAgenda => {


			let valor_abono = Number(datoAgenda.valor_abono).toLocaleString('es-CO');
			let imgForma = datoAgenda.forma_de_pago == "EFECTIVO" ? "efectivo" : "tarjeta";
			efectivo += datoAgenda.forma_de_pago == "EFECTIVO" ? parseFloat(datoAgenda.valor_abono) : 0;
			if (datoAgenda.forma_de_pago != null) {
				//	console.log(k,datoAgenda.forma_de_pago.indexOf("TRANSFERENCIA",0),datoAgenda.valor_abono,transferencia);
				tarjeta += datoAgenda.forma_de_pago.indexOf("TARJETA", 0) >= 0 ? parseFloat(datoAgenda.valor_abono) : 0;
				transferencia += datoAgenda.forma_de_pago.indexOf("TRANSFERENCIA", 0) >= 0 ? parseFloat(datoAgenda.valor_abono) : 0;
			}
			k++;


			if (datoAgenda.forma_de_pago != null)
				consignacion += datoAgenda.forma_de_pago == "CONSIGNACION" ? parseFloat(datoAgenda.valor_abono) : 0;
			total += typeof datoAgenda.valor_abono != undefined ? parseFloat(datoAgenda.valor_abono) : 0;
			if (datoAgenda.forma_de_pago != null)
				checked = (datoAgenda.forma_de_pago.indexOf("TRANSFERENCIA") >= 0) || (datoAgenda.forma_de_pago.indexOf("TARJETA", 0) >= 0) || (datoAgenda.forma_de_pago == "CONSIGNACION") || (datoAgenda.arips == "S") ? "checked" : "";
			if (checked == "checked")
				seleccionado += parseFloat(datoAgenda.valor_abono);
			let fpagos = (datoAgenda.forma_de_pago != null) ? datoAgenda.forma_de_pago : "";
			html += `<tr id="${datoAgenda.ind}">
			<td>
			  <h5>
			  <div class="form-check">
			  <input type="checkbox" class="form-check-input position-static chk" ${checked} data-value=${datoAgenda.valor_abono}></h5>
			  </div>
			</td> 
			<td>
			  <h5 class="ident">${datoAgenda.identificacion}</h5>
			</td> 
			<td>
			  <h5 class="nomb">${datoAgenda.nombres}</h5>
			</td>
			<td>
			  <h5 class="text-nowrap fechas">${datoAgenda.fecha}</h5>
			</td>
			<td>
			  <h5 class="fp">
			  ${(datoAgenda.forma_de_pago != null) ? datoAgenda.forma_de_pago : ""}
			  <!--<img src="${imgForma}.png" alt="Forma_de_pago" class="img-thumbnail">-->
			  </h5>
			</td>
			<td class="bg-success alg text-dark">
			  <h5>${valor_abono}</h5>
			</td>
			<td>
			  <h5 class="nomb">${(datoAgenda.items != null) ? datoAgenda.items : ""}</h5>
			</td>
			<td>
			  <h5 class="nomb">${(datoAgenda.tipopago != null) ? datoAgenda.tipopago : ""}</h5>
			</td>
		  </tr>`;
		});
		$("#pefectivo").text(Number(efectivo).toLocaleString('es-CO'));
		$("#ptarjeta").text(Number(tarjeta).toLocaleString('es-CO'));
		$("#ptransferencia").text(Number(transferencia).toLocaleString('es-CO'));
		$("#ptotal").text(Number(total).toLocaleString('es-CO'));
		$("#ptotals").text(Number(seleccionado).toLocaleString('es-CO'));
		$("#usuarios").hide();
		$("#infoPagos").show();
		$("#tresp").show();
		$("#pcantidad").text(datosAgenda.length);
		return (html);

	}

	setTimeout(_ => {
		$("#btnFechas").click();
	}, 3000);

	function hideModal(modal) {
		$(modal).removeClass("in");
		$(".modal-backdrop").remove();
		$(modal).hide();
	}


	const agendaCitas = async () => {

		console.log("Cargando Datos de Citas ");
		$("#smModal").modal().modal("show");
		$("#infoSpinner").text("Cargando Datos de Citas");

		const citas = await showCitas();
		console.log("Cargando Datos de Agenda ");
		$("#infoSpinner").text("Cargando Datos de Agenda");
		$("#spinner").addClass("text-secondary");

		$("#dataInfo").empty().html(await dibujaAgenda(citas));
		$("#smModal").click();

		$(document).click();
		hideModal("#smModal");
		console.log("fin");



	}

	agendaCitas();

	$("#btnFechas").click(e => {

		e.preventDefault();
		agendaCitas();
	});

	$("#filtrar").click(async e => {

		filtrado = !filtrado;
		if (filtrado) {


			let data = { fecha1: $("#fecha1").val(), fecha2: $("#fecha2").val() };
			const datosFilter = await fetch(url + "arips", {
				method: 'POST', // or 'PUT'
				body: JSON.stringify(data), // data can be `string` or {object}!
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const datos = await datosFilter.json();
			$("#dataInfo").empty().html(await dibujaAgenda(datos));
		}
		else
			$("#dataInfo").empty().html(await dibujaAgenda(citas));
	});


	$(document).on("click", "td", async e => {

		var celda = $(e.currentTarget);
		var cell = $(celda).closest('td');
		var cellIndex = cell[0].cellIndex
		//console.log(cellIndex);
		if (cellIndex >= 1) {
			campo = celda.data("campo");
			/*$("#infot").text("Información de la Celda");
			$("#infot2").text($("#tableh").children().children().children()[cellIndex].innerText);
			$("#infoModal").text(celda.text());*/
			let result = await swal.fire({
				title: 'Introduza el nuevo valor de la celda ' + campo,
				input: 'text',
				inputAttributes: {
					autocapitalize: 'off'
				},
				inputValue: celda.text().trim(),
				showCancelButton: true,
				confirmButtonText: 'Aceptar',
				cancelButtonText: 'Cancelar',
				showLoaderOnConfirm: true,
				allowOutsideClick: () => !Swal.isLoading()
			});
			console.log(result);
			if (result.isConfirmed) {
				vvalue = result.value;
				celda.text(result.value);
			}

			//	$("#infoModalCenter").modal("show");
			if (tconsulta) {
				tconsulta = false;
				let response = await fetch("http://192.168.1.250/adoweb/php/actualizaEvolucion.php", {
					method: "POST",
					body: JSON.stringify({ 'campo': campo, 'value': vvalue, 'ind': vind, 'database': 'ado' }),
					heades: {
						"Content-Type": "application/json"
					}
				});
				let res = await response.json();
				if (res.Informacion == "Ok") swal.fire("Actualizado");
			}
		}
	});

	$("#reintentar").click(e => {

		location.reload();
	});

	$("#buscarBtn").click(async e => {

		e.preventDefault();
		let PATTERN = $("input[type='search']").val().toUpperCase();
		let datosAgendaFiltered = datosAgenda.filter(datoAgenda => { return datoAgenda.nombres.indexOf(PATTERN) != -1; });
		console.log(datosAgendaFiltered);
		$("#dataInfo").empty().html(await dibujaAgenda(datosAgendaFiltered));
	});

	$("input[type='search']").on("input", e => {

		console.log($(e.currentTarget).val());
		$("#buscarBtn").click();
	});

	//signature





	//fin signature



	$("#fecha1,#fecha2").change(e => {


		$("#infoPagos").show();
		$("#tresp").show();
		agendaCitas();


	});


	//RIPS


	const getRips = async (file) => {

		try {

			let data = { fecha1: $("#fecha1").val(), fecha2: $("#fecha2").val() };
			const response = await fetch(url + file, {
				method: 'POST', // or 'PUT'
				body: JSON.stringify(data), // data can be `string` or {object}!
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const datos = await response.json();
			return (datos);
		} catch (error) {
			console.error(error);
			$("#errorcargaModal").modal("show");
		}
	}


	$("#call").click(e => {


		if ($(e.currentTarget).prop("checked") == true) {

			$(".chk").each((i, k) => {

				$(k).prop("checked", true);

			});
		} else {

			$(".chk").each((i, k) => {

				$(k).prop("checked", false);

			});
		}

	});

	$("#ripsUsuarios").click(async e => {

		e.preventDefault();
		$(".navbar-toggler").click();
		$("#infoPagos").hide();
		$("#tresp").hide();
		$("#usuarios").show();
		//	$("#smModal").modal().modal({keyboard:false}).modal("show");
		console.log("Usuarios");
		let ripsUsuarios = await getRips("ripsUsuarios");
		let html = `<div class='mx-auto text-center'><h3>Archivo de Usuarios [<span class="canti"></span>]</h3></div><div class="table-responsive" id="tresp">
				<button class="btn btn-primary" id="btnExportar">Exportar a csv</button><br/><br/>
				<table class="table table-bordered table-striped table-hover table-bordered table-sm" id="tusuarios">
				  <thead class="thead-dark sticky-top" id="tableUsuarios">
					<tr>
					  
					   <th>
				   			<h5>tdei</h4>
				   		</th>
				  <th>
				   <h5>Ident.</h5>
				   </th>
				  <th>
				   <h5>Coda</h5>
				  </th>
				  <th>
					<h5>Tu</h5>
				  </th>
				  <th>
			  		<h5>Apellido1</h5>
				  </th>
				  <th>
					<h5>Apellido2</h5>
				  </th>
				  <th>
					<h5>Nombre1</h5>
				  </th>
				  <th>
					<h5>Nombre2</h5>
				  </th>
				  <th>
					<h5>Edad</h5>
				  </th>
				  <th>
					<h5>Ume</h5>
				  </th>
				  <th>
					<h5>Sexo</h5>
				  </th>
				  <th>
					<h5>Codepto</h5>
				  </th>
				  <th>
					<h5>Codmunic</h5>
				  </th>
				  <th>
					<h5>Zona</h5>
				  </th>
				  </tr>
				  </thead>
				  <tbody id="dataInfoUsuarios">`;
		await ripsUsuarios.forEach(cita => {
			html += `<tr>
					 
					   <th>
				   			<h5>${cita.tdei}</h4>
				   		</th>
				  <th>
				   <h5>${cita.identificacion}</h5>
				   </th>
				  <th>
				   <h5>${cita.coda}</h5>
				  </th>
				  <th>
					<h5>${cita.tu}</h5>
				  </th>
				  <th>
			  		<h5>${cita.apellido1}</h5>
				  </th>
				  <th>
					<h5>${cita.apellido2}</h5>
				  </th>
				  <th>
					<h5>${cita.nombre1}</h5>
				  </th>
				  <th>
					<h5>${cita.nombre2}</h5>
				  </th>
				  <th>
					<h5>${cita.edad}</h5>
				  </th>
				  <th>
					<h5>${cita.ume}</h5>
				  </th>
				  <th>
					<h5>${cita.sexo}</h5>
				  </th>
				  <th>
					<h5>${cita.codepto}</h5>
				  </th>
				  <th>
					<h5>${cita.codmunic}</h5>
				  </th>
				  <th>
					<h5>${cita.zona}</h5>
				  </th>
				  </tr>`;


		});
		html += `</tbody>
				</table>
				
			  </div>`;

		$("#usuarios").empty().html(html);
		$(".canti").text(ripsUsuarios.length);
		//	  $("#smModal").modal("hide");


	});


	$("#ripsConsulta").click(async e => {

		e.preventDefault();
		$(".navbar-toggler").click();
		$("#infoPagos").hide();
		$("#tresp").hide();
		$("#usuarios").show();
		$("#smModal").modal().modal({ keyboard: false }).modal("show");
		console.log("Consulta");
		let ripsConsultas = await getRips("ripsConsulta");
		if (ripsConsultas.length === 0) {
			console.log("No hay datos");
			$("#nodataModalCenter").modal().modal("show");
			return;
		}
		console.log(ripsConsultas);
		let html = `<div class="table-responsive" id="tresp">
                    <div class='mx-auto text-center'><h3>Archivo de Consulta [<span class="canti"></span>]</h3></div>
						<button class="btn btn-primary" id="btnExportarCons">Exportar a csv</button><br/><br/>
						<table class="table table-bordered table-striped table-hover table-bordered table-sm" id="tconsultas">
						<thead class="thead-dark sticky-top" id="tableConsultas">
						<tr>`;
		Object.keys(ripsConsultas[0]).forEach(key => {
			if (key != 'ind')
				html += `<th>${key}</th>`;

		});

		html += `</tr>
						</thead>
						<tbody id="dataInfoUsuarios">`;
		await ripsConsultas.forEach(ripsConsulta => {

			html += `<tr data-id="${ripsConsulta.ind}" class="consulta">"`;

			Object.keys(ripsConsulta).forEach(key => {
				if (key != 'ind')
					html += `<td data-campo="${key}">${ripsConsulta[key]}</td>`;

			})
			html += "</tr>";

		});
		$("#usuarios").empty().html(html);
		$(".canti").text(ripsConsultas.length);
		hideModal("#smModal");

	});


	$("#ripsProcedimientos").click(async e => {

		e.preventDefault();
		$(".navbar-toggler").click();
		$("#infoPagos").hide();
		$("#tresp").hide();
		$("#usuarios").show();
		$("#smModal").modal().modal({ keyboard: false }).modal("show");
		console.log("Procedimientos");
		let ripsProcedimientos = await getRips("ripsProcedimientos");
		if (ripsProcedimientos.length === 0) {
			console.log("No hay datos");
			$("#nodataModalCenter").modal().modal("show");
			return;
		}
		console.log(ripsProcedimientos);
		let html = `<div class="table-responsive" id="tresp">
                    <div class='mx-auto text-center'><h3>Archivo de Procedimientos [<span class="canti"></span>]</h3></div>
						<button class="btn btn-primary" id="btnExportarProc">Exportar a csv</button><br/><br/>
						<table class="table table-bordered table-striped table-hover table-bordered table-sm" id="tprocedimientos">
						<thead class="thead-dark sticky-top" id="tableProcedimientos">
						<tr>`;
		Object.keys(ripsProcedimientos[0]).forEach(function (key) {

			html += `<th>${key}</th>`;

		});

		html += `</tr>
						</thead>
						<tbody id="dataInfoUsuarios">`;
		await ripsProcedimientos.forEach(ripsProcedimiento => {

			html += "<tr>";
			Object.keys(ripsProcedimiento).forEach(function (key) {
				html += `<td>${ripsProcedimiento[key]}</td>`;

			})
			html += "</tr>";

		});
		$("#usuarios").empty().html(html);
		$(".canti").text(ripsProcedimientos.length);
		hideModal("#smModal");


	});

	$("#ripsTransacciones").click(async e => {

		e.preventDefault();
		$(".navbar-toggler").click();
		$("#infoPagos").hide();
		$("#tresp").hide();
		$("#usuarios").show();
		$("#smModal").modal().modal({ keyboard: false }).modal("show");
		console.log("Transacciones");
		let ripsTransacciones = await getRips("ripsTransacciones");
		if (ripsProcedimientos.length === 0) {
			console.log("No hay datos");
			$("#nodataModalCenter").modal().modal("show");
			return;
		}
		console.log(ripsTransacciones);
		let html = `<div class="table-responsive" id="tresp">
    <div class='mx-auto text-center'><h3>Archivo de Transacciones [<span class="canti"></span>]</h3></div>
        <button class="btn btn-primary" id="btnExportarTrans">Exportar a csv</button><br/><br/>
        <table class="table table-bordered table-striped table-hover table-bordered table-sm" id="ttransacciones">
        <thead class="thead-dark sticky-top" id="tableProcedimientos">
        <tr>`;
		Object.keys(ripsTransacciones[0]).forEach(function (key) {

			html += `<th>${key}</th>`;

		});

		html += `</tr>
        </thead>
        <tbody id="dataInfoUsuarios">`;
		await ripsTransacciones.forEach(ripsTransaccion => {

			html += "<tr>";
			Object.keys(ripsTransaccion).forEach(function (key) {
				html += `<td>${ripsTransaccion[key]}</td>`;

			})
			html += "</tr>";

		});
		$("#usuarios").empty().html(html);
		$(".canti").text(ripsTransacciones.length);
		hideModal("#smModal");


	});
	function downloadCSV(csv, filename) {
		var csvFile;
		var downloadLink;

		// CSV file
		csvFile = new Blob([csv], { type: "text/csv" });

		// Download link
		downloadLink = document.createElement("a");

		// File name
		downloadLink.download = filename;

		// Create a link to the file
		downloadLink.href = window.URL.createObjectURL(csvFile);

		// Hide download link
		downloadLink.style.display = "none";

		// Add the link to DOM
		document.body.appendChild(downloadLink);

		// Click download link
		downloadLink.click();
	}

	function exportTableToCSV(filename, table) {
		var csv = [];
		var rows = document.querySelectorAll(table + " tr");

		for (var i = 1; i < rows.length; i++) {
			var row = [], cols = rows[i].querySelectorAll("td, th");

			for (var j = 0; j < cols.length; j++)
				row.push(cols[j].innerText);

			csv.push(row.join(","));
		}
		console.log(csv);
		// Download CSV file
		downloadCSV(csv.join("\n"), filename);
	}

	$(document).on("click", "#btnExportar", e => {

		console.log("exportando...");
		exportTableToCSV(`US${$("#fecha1").val()}-al-${$("#fecha2").val()}.csv`, "#tusuarios");
	});


	$(document).on("click", "#btnExportarProc", e => {

		console.log("exportando...");
		exportTableToCSV(`AP${$("#fecha1").val()}-al-${$("#fecha2").val()}.csv`, "#tprocedimientos");
	});

	$(document).on("click", "#btnExportarCons", e => {

		console.log("exportando...");
		exportTableToCSV(`AC${$("#fecha1").val()}-al-${$("#fecha2").val()}.csv`, "#tconsultas");
	});

	$(document).on("click", "#btnExportarTrans", e => {

		console.log("exportando...");
		exportTableToCSV(`AF${$("#fecha1").val()}-al-${$("#fecha2").val()}.csv`, "#ttransacciones");
	});

	$("#btnAactualizar").click(async e => {

		e.preventDefault();

		console.log("actualizando");
		//	$("#smModal").modal().modal({ keyboard: false }).modal("show");
		$("#infoSpinner").text("Actualizando Espere por favor");
		let dataJson = [];
		await $(".chk").each((i, k) => {


			if ($(k).is(":checked")) {
				let row = $(k).parent().parent().parent().parent();
				let fecha = row;
				let id = row.attr("id");
				let elemento = { "citasind": id, "fecha": fecha.children()[3].innerText };
				dataJson.push(elemento);
			}

		});
		const response = await fetch(url + "actualizaInds", {
			method: 'POST', // or 'PUT'
			body: JSON.stringify(dataJson), // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const datos = await response.json();
		console.log(datos);
		//		$("#smModal").modal().modal("hide");
		$(".navbar-toggler").click();

	});

	$("#btnBorrarActualizados").click(async e => {

		e.preventDefault();

		console.log("actualizando");
		//	$("#smModal").modal().modal({ keyboard: false }).modal("show");
		$("#infoSpinner").text("Actualizando Espere por favor");
		let dataJson = [];
		await $(".chk").each((i, k) => {


			if ($(k).is(":checked")) {
				let row = $(k).parent().parent().parent().parent();
				let fecha = row;
				let id = row.attr("id");
				let elemento = { "citasind": id, "fecha": fecha.children()[3].innerText };
				dataJson.push(elemento);
			}

		});
		const response = await fetch(url + "noactualizaInds", {
			method: 'POST', // or 'PUT'
			body: JSON.stringify(dataJson), // data can be `string` or {object}!
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const datos = await response.json();
		console.log(datos);
		//		$("#smModal").modal().modal("hide");
		$(".navbar-toggler").click();

	});

	$(document).on("click", "input[type='checkbox']", e => {
		let check = $(e.currentTarget);
		let value = parseFloat(check.data("value"));
		if (!isNaN(value))
			if (check.is(":checked")) seleccionado += value;
			else seleccionado -= value;
		$("#ptotals").text(Number(seleccionado).toLocaleString('es-CO'));

	});

	$(document).on("click", ".consulta", e => {
		e.preventDefault();
		tconsulta = true;
		let value = $(e.currentTarget);
		console.log(value.data("id"));
		vind = value.data("id");
	});

});


let dataJSON = {
	"numDocumentoIdObligado": "31405200",
	"numFactura": null,
	"tipoNota": "RS",
	"numNota": "FE-1000",
	usuarios:[]
};


let usuarios = [];


function formatearFecha(fecha) {
	// Separar la fecha en día, mes y año
	const [dia, mes, año] = fecha.split("/");

	// Retornar el formato deseado
	return `${año}-${mes}-${dia} `;
}

function extraerHoraYMinuto(horaCompleta) {
	// Dividir la cadena usando ":" como separador
	const [hora, minuto] = horaCompleta.split(":");

	// Retornar los valores de hora y minuto
	return `${hora}:${minuto} `;
}

const modalJSONelement = document.getElementById("modalJSON");
let modalJSON;

document.getElementById("btnJSON").addEventListener('click', async e => {


	document.getElementById("spnjson").classList.remove("d-none");
	let data = { fecha1: $("#fecha1").val(), fecha2: $("#fecha2").val() };
	const response = await fetch(url + "ripsUsuarios", {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	const datos = await response.json();

	if (datos.length) {
		const fecha1 = document.getElementById("fecha1").value;
		const fecha2 = document.getElementById("fecha2").value;

		const usuarios = [];
		const promises = datos.map(async (dato, index) => {
			const { identificacion, tdei, tu, sexo, fecnac, codepto,codmunic, apellido1, apellido2, nombre1, nombre2 } = dato;

			// Fetch consultas
			const consultasResponse = await fetch(url + "ripsConsultai", {
				method: 'POST',
				body: JSON.stringify({ paciente: identificacion, fecha1, fecha2 }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const dconsultas = await consultasResponse.json();
			const dataConsultas = dconsultas.map((consulta, index2) => {
				const { cod_prestador, fechaj, hora, diagnostico_principal, diagnostico_relacionado1, diagnostico_relacionado2, diagnostico_relacionado3, tipo_dx, valor_consulta,factura_consulta,EditRight1 } = consulta;
				return {
					codPrestador: cod_prestador,
					fechaInicioAtencion: fechaj,
					numAutorizacion: "",
					codConsulta: "890304",
					modalidadGrupoServicioTecSal: "01",
					grupoServicios: "01",
					codServicio: 397,
					finalidadTecnologiaSalud: "16",
					causaMotivoAtencion: "38",
					codDiagnosticoPrincipal: diagnostico_principal==""?"K088":diagnostico_principal,
					codDiagnosticoRelacionado1: null,
					codDiagnosticoRelacionado2: null,
					codDiagnosticoRelacionado3: null,
					tipoDiagnosticoPrincipal: `0${tipo_dx}`,
					tipoDocumentoIdentificacion: "CC",
					numDocumentoIdentificacion: identificacion,
					vrServicio: parseFloat(valor_consulta??"0"),
					conceptoRecaudo: "05",
					valorPagoModerador: EditRight1,
					numFEVPagoModerador: factura_consulta,
					consecutivo:  1,
				};
			});

			// Fetch procedimientos
			const procedimientosResponse = await fetch(url + "ripsProcedimientosi", {
				method: 'POST',
				body: JSON.stringify({ paciente: identificacion, fecha1, fecha2 }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const dprocedimientos = await procedimientosResponse.json();
			const dataProcedimientos = dprocedimientos.map((procedimiento, index3) => {
				const { cod_prestador, fechaj, hora, diagnostico_principal, diagnostico_relacionado1, valor,factura_consulta,EditRight1 } = procedimiento;
				return {
					codPrestador: cod_prestador,
					fechaInicioAtencion: fechaj,
					idMIPRES: null,
					numAutorizacion: null,
					codProcedimiento: "890304",
					viaIngresoServicioSalud: "01",
					modalidadGrupoServicioTecSal: "01",
					grupoServicios: "04",
					codServicio: 338,
					finalidadTecnologiaSalud: "44",
					tipoDocumentoIdentificacion: "CC",
					numDocumentoIdentificacion: identificacion,
					codDiagnosticoPrincipal:  diagnostico_principal==""?"K088":diagnostico_principal,
					codDiagnosticoRelacionado: null,
					codComplicacion: null,
					vrServicio: parseFloat(valor??"0"),
					conceptoRecaudo: "05",
					valorPagoModerador: valor,
					numFEVPagoModerador: factura_consulta,
					consecutivo:  1
				};
			});

			// Push user data
			usuarios.push({
				tipoDocumentoIdentificacion: tdei,
				numDocumentoIdentificacion: identificacion,
				//primerApellido: apellido1,
				//segundoApellido: apellido2,
				//primerNombre: nombre1,
				//segundoNombre: nombre2,
				tipoUsuario: `0${tu}`,
				fechaNacimiento: fecnac,
				codSexo: sexo,
				codPaisResidencia: "170",
				codMunicipioResidencia: `${codepto??76}${codmunic??147}`,
				codZonaTerritorialResidencia: "01",
				incapacidad: "NO",
				codPaisOrigen: "170",
				consecutivo: 1,
				servicios: {
					consultas: dataConsultas,
					procedimientos: dataProcedimientos,
				}
			});
			if (dataConsultas.length===0) usuarios.pop()
				else 
				if (dataProcedimientos.length===0) usuarios.pop()	
		});

		// Wait for all promises to resolve
		await Promise.all(promises);

		// Populate the textarea and show the modal
		dataJSON.usuarios =  usuarios ;
		const textAreaJSON = document.getElementById("textAreaJSON");
		textAreaJSON.value = JSON.stringify(dataJSON, null, 2);

		if (!modalJSON) {
			modalJSON = new bootstrap.Modal(modalJSONelement);
		}
		const jsonViewer = document.querySelector("andypf-json-viewer");
		jsonViewer.data = dataJSON;
		jsonViewer.expanded = 5;
		modalJSON.show();
		document.getElementById("spnjson").classList.add("d-none");
	}

});


document.getElementById("btnJSONFactura").addEventListener('click', async e => {


	document.getElementById("spnjson").classList.remove("d-none");
	let data = { fecha1: $("#fecha1").val(), fecha2: $("#fecha2").val() };
	const response = await fetch(url + "ripsUsuarios", {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});
	const datos = await response.json();

	if (datos.length) {
		const fecha1 = document.getElementById("fecha1").value;
		const fecha2 = document.getElementById("fecha2").value;

		const usuarios = [];
		const promises = datos.map(async (dato, index) => {
			const { identificacion, tdei, tu, sexo, fecnac, codepto,codmunic, apellido1, apellido2, nombre1, nombre2 } = dato;

			// Fetch consultas
			const consultasResponse = await fetch(url + "ripsConsultai", {
				method: 'POST',
				body: JSON.stringify({ paciente: identificacion, fecha1, fecha2 }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const dconsultas = await consultasResponse.json();
			const dataConsultas = dconsultas.filter(f=>f.factura_consulta).map((consulta, index2) => {
				const { cod_prestador, fechaj, hora, diagnostico_principal, diagnostico_relacionado1, diagnostico_relacionado2, diagnostico_relacionado3, tipo_dx, valor_consulta,factura_consulta,EditRight1 } = consulta;
				return {
					codPrestador: cod_prestador,
					fechaInicioAtencion: fechaj,
					numAutorizacion: "",
					codConsulta: "890304",
					modalidadGrupoServicioTecSal: "01",
					grupoServicios: "01",
					codServicio: 397,
					finalidadTecnologiaSalud: "16",
					causaMotivoAtencion: "38",
					codDiagnosticoPrincipal: diagnostico_principal==""?"K088":diagnostico_principal,
					codDiagnosticoRelacionado1: null,
					codDiagnosticoRelacionado2: null,
					codDiagnosticoRelacionado3: null,
					tipoDiagnosticoPrincipal: `0${tipo_dx}`,
					tipoDocumentoIdentificacion: "CC",
					numDocumentoIdentificacion: identificacion,
					vrServicio: parseFloat(valor_consulta??"0"),
					conceptoRecaudo: "05",
					valorPagoModerador: 0,
					numFEVPagoModerador: factura_consulta,
					consecutivo: 1,
				};
			});

			// Fetch procedimientos
			const procedimientosResponse = await fetch(url + "ripsProcedimientosi", {
				method: 'POST',
				body: JSON.stringify({ paciente: identificacion, fecha1, fecha2 }),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const dprocedimientos = await procedimientosResponse.json();
			const dataProcedimientos = dprocedimientos.filter(f=>f.factura_consulta).map((procedimiento, index3) => {
				const { cod_prestador, fechaj, hora, diagnostico_principal, diagnostico_relacionado1, valor,factura_consulta,EditRight1 } = procedimiento;
				return {
					codPrestador: cod_prestador,
					fechaInicioAtencion: fechaj,
					idMIPRES: null,
					numAutorizacion: null,
					codProcedimiento: "890304",
					viaIngresoServicioSalud: "01",
					modalidadGrupoServicioTecSal: "01",
					grupoServicios: "04",
					codServicio: 338,
					finalidadTecnologiaSalud: "44",
					tipoDocumentoIdentificacion: "CC",
					numDocumentoIdentificacion: identificacion,
					codDiagnosticoPrincipal:  diagnostico_principal==""?"K088":diagnostico_principal,
					codDiagnosticoRelacionado: null,
					codComplicacion: null,
					vrServicio: parseFloat(valor??"0"),
					conceptoRecaudo: "05",
					valorPagoModerador: 0,
					numFEVPagoModerador: factura_consulta,
					consecutivo: 1
				};
			});

			// Push user data
			usuarios.push({
				tipoDocumentoIdentificacion: tdei,
				numDocumentoIdentificacion: identificacion,
				//primerApellido: apellido1,
				//segundoApellido: apellido2,
				//primerNombre: nombre1,
				//segundoNombre: nombre2,
				tipoUsuario: `0${tu}`,
				fechaNacimiento: fecnac,
				codSexo: sexo,
				codPaisResidencia: "170",
				codMunicipioResidencia: `${codepto??76}${codmunic??147}`,
				codZonaTerritorialResidencia: "01",
				incapacidad: "NO",
				codPaisOrigen: "170",
				consecutivo: 1,
				servicios: {
					consultas: dataConsultas,
					procedimientos: dataProcedimientos,
				}
			});
			if (dataConsultas.length===0) usuarios.pop()
				else 
				if (dataProcedimientos.length===0) usuarios.pop()	
		});

		// Wait for all promises to resolve
		await Promise.all(promises);

		// Populate the textarea and show the modal
		dataJSON.usuarios =  usuarios ;
		const textAreaJSON = document.getElementById("textAreaJSON");
		textAreaJSON.value = JSON.stringify(dataJSON, null, 2);

		if (!modalJSON) {
			modalJSON = new bootstrap.Modal(modalJSONelement);
		}
		const jsonViewer = document.querySelector("andypf-json-viewer");
		jsonViewer.data = dataJSON;
		jsonViewer.expanded = 5;
		modalJSON.show();
		document.getElementById("spnjson").classList.add("d-none");
	}

});




document.getElementById("guardarJSON").addEventListener('click', async e => {
	const jsonData=document.getElementById("textAreaJSON").value;
	const blob = new Blob([jsonData], { type: 'application/json' });

	const now = new Date();
	const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Formato seguro para nombres de archivo
	const filename = `datos-${timestamp}.json`;
	// Crear un enlace de descarga
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = filename; // Nombre del archivo
	a.style.display = 'none';

	// Agregar el enlace al DOM y hacer clic en él
	document.body.appendChild(a);
	a.click();

	// Eliminar el enlace después de descargar
	document.body.removeChild(a);
	
});


document.getElementById("guardarJSONF").addEventListener('click', async e => {
	const jsonData=document.getElementById("textAreaJSON").value;
	try {
    const response = await fetch(url+'jsonmasivo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    });

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const respuestaServidor = await response.json();
    console.log('Respuesta del servidor:', respuestaServidor);
		swal.fire({
	  title: 'Éxito',
	  text: 'Carpetas JSON creadas correctamente',
	  icon: 'success'
	});  



  } catch (error) {
    console.error('Error al enviar el JSON:', error);
  }

	
});
