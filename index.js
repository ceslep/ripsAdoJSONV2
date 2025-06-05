//npm install express http body-parser reload morgan path node-fetch socket.io nodemon reload
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var reload = require('reload');
var logger = require('morgan');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
var app = express();
var path = require('path');
const fetch = require('node-fetch');
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());
//app.use(logger('combined'));
app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

const uri = "d1be1b68";

//const URL=`https://${uri}.ngrok.io/adoweb/php/`;
const URL = `http://127.0.0.1/adoweb/php/`;

const getData = async (file, fechas) => {


  console.log(`${URL}${file}.php`);
  try {
    let data = `?fecha1=${fechas.fecha1}&fecha2=${fechas.fecha2}`;
    console.log(`${URL}${file}.php${data}`);
    const response = await fetch(`${URL}${file}.php${data}`);
    let datos = await response.json();
    //    console.log(datos);
    return (datos);
  } catch (error) {
    console.error("Error:" + error.message);

  }
}

const getDatai = async (file, dfechas) => {

  console.log(dfechas);
  console.log(`${URL}${file}.php`);
  try {
    let data = `?paciente=${dfechas.paciente}&fecha1=${dfechas.fecha1}&fecha2=${dfechas.fecha2}`;
    console.log(`${URL}${file}.php${data}`);
    const response = await fetch(`${URL}${file}.php${data}`);
    let datos = await response.json();
    //    console.log(datos);
    return (datos);
  } catch (error) {
    console.error("Error:" + error.message);

  }
}


const postData = async (file, data) => {


  console.log(`${URL}${file}.php`);
  console.log(data);
  try {


    let info = { data: data };
    console.log(info);
    const response = await fetch(`${URL}${file}.php`, {

      method: 'POST', // or 'PUT'
      body: JSON.stringify(data), // data can be `string` or {object}!
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    });


    let datos = await response.json();
    console.log(datos);
    return (datos);
  } catch (error) {
    console.error("Error:" + error.message);

  }
}



app.post('/citas', async (req, res) => {

  console.log(req.body);
  res.send(await getData("getCitas_", req.body));

});

app.post('/arips', async (req, res) => {

  console.log(req.body);
  res.send(await getData("arips", req.body));

});


app.get('/url', async (req, res) => {

  res.send({ "servidor": URL });
});

app.post('/ripsUsuarios', async (req, res) => {


  res.send(await getData("ripsUsuarios", req.body));

});


app.post('/ripsConsulta', async (req, res) => {


  res.send(await getData("ripsConsulta", req.body));

});

app.post('/ripsConsultai', async (req, res) => {

  console.log(req.body);
  res.send(await getDatai("ripsConsulta", req.body));

});

app.post('/ripsProcedimientos', async (req, res) => {


  res.send(await getData("ripsProcedimientos", req.body));

});


app.post('/ripsProcedimientosi', async (req, res) => {


  res.send(await getDatai("ripsProcedimientosi", req.body));

});

app.post('/ripsTransacciones', async (req, res) => {


  res.send(await getData("ripsTransacciones", req.body));

});


app.post('/actualizaInds', async (req, res) => {


  res.send(await postData("actualizaInds", req.body));

});

app.post('/actuaEvol', async (req, res) => {


  res.send(await postData("actualizaEvolucion", req.body));

});



app.post('/noactualizaInds', async (req, res) => {


  res.send(await postData("noactualizaInds", req.body));

});




//json procesado
/** 
 * Normaliza "FEV-0001" → "FEV1", "FEV-0011" → "FEV11", etc.
 */
function normalizarFactura(nombre) {
  if (typeof nombre !== 'string') return '';
  const match = nombre.match(/^FEV-0*(\d+)$/);
  if (!match) return nombre;
  return `FEV${match[1]}`;
}

/** 
 * Convierte "FEV-0001" → "dian_FEV1" (para buscar XML en C:\facturas_dian).
 */
function convertirNombre(nombre) {
  if (typeof nombre !== 'string') return '';
  const match = nombre.match(/^FEV-0*(\d+)$/);
  if (!match) return '';
  return `dian_FEV${match[1]}`;
}

/** 
 * Elimina duplicados de un arreglo, ignorando el campo "consecutivo".
 */
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter(item => {
    const obj = { ...item };
    delete obj.consecutivo;
    const key = JSON.stringify(obj);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

app.post('/jsonmasivo', async (req, res) => {
  const { numDocumentoIdObligado, tipoNota, numNota, usuarios } = req.body;

  if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
    return res.status(400).json({ mensaje: "No hay usuarios en el JSON" });
  }

  // Ruta a "C:\Users\<Usuario>\Documents\reporteRips"
  const documentos = path.join(os.homedir(), 'Documents');
  const carpetaReporte = path.join(documentos, 'reporteRips');
  console.log('Carpeta principal:', carpetaReporte);

  // 1. Limpiar o crear carpeta principal
  try {
    if (fs.existsSync(carpetaReporte)) {
      fs.readdirSync(carpetaReporte).forEach(archivo => {
        const ruta = path.join(carpetaReporte, archivo);
        if (fs.lstatSync(ruta).isDirectory()) {
          fs.rmSync(ruta, { recursive: true, force: true });
          console.log('Borrada subcarpeta:', ruta);
        } else {
          fs.unlinkSync(ruta);
          console.log('Borrado archivo:', ruta);
        }
      });
    } else {
      fs.mkdirSync(carpetaReporte, { recursive: true });
      console.log('Creada carpeta:', carpetaReporte);
    }
  } catch (err) {
    console.error('Error preparando carpeta principal:', err);
    return res.status(500).json({ mensaje: "Error preparando carpeta principal", error: err.message });
  }

  // 2. Procesar cada usuario individualmente
  let guardados = 0;

  usuarios.forEach(usuario => {
    // a) Filtrar consultas/procedimientos con numDocumentoIdentificacion != null
    let consultas = (usuario.servicios?.consultas || []).filter(
      c => c.numDocumentoIdentificacion !== null && c.numDocumentoIdentificacion !== undefined
    );
    let procedimientos = (usuario.servicios?.procedimientos || []).filter(
      p => p.numDocumentoIdentificacion !== null && p.numDocumentoIdentificacion !== undefined
    );

    // b) Eliminar duplicados (ignorando "consecutivo")
    consultas = removeDuplicates(consultas);
    procedimientos = removeDuplicates(procedimientos);

    // c) Obtener el primer numFEVPagoModerador válido (priorizar consultas)
    let originalNumFactura = null;
    if (consultas.length > 0 && consultas[0].numFEVPagoModerador) {
      originalNumFactura = consultas[0].numFEVPagoModerador;
    } else if (procedimientos.length > 0 && procedimientos[0].numFEVPagoModerador) {
      originalNumFactura = procedimientos[0].numFEVPagoModerador;
    }

    if (!originalNumFactura) {
      console.log('Usuario omitido (sin numFEVPagoModerador válido):', usuario.numDocumentoIdentificacion);
      return; // Omite este usuario
    }

    // d) Normalizar la factura (ej: "FEV-0001" → "FEV1")
    const facturaNormalizada = normalizarFactura(originalNumFactura);

    // e) Calcular totales de vrServicio
    let totalConsultas = consultas.reduce((sum, c) => sum + (parseFloat(c.vrServicio) || 0), 0);
    let totalProcedimientos = procedimientos.reduce((sum, p) => sum + (parseFloat(p.vrServicio) || 0), 0);
    let total = totalConsultas + totalProcedimientos;

    // f) Repartir vrServicio:
    //    - 10000 en total para las consultas (repartidas equitativamente)
    //    - el resto en procedimientos (también equitativo)
    let consultasOut = [];
    let procedimientosOut = [];

    if (consultas.length > 0) {
      const porConsulta = 10000 / consultas.length;
      consultasOut = consultas.map(c => ({
        ...c,
        vrServicio: porConsulta,
        numFEVPagoModerador: facturaNormalizada
      }));

      const resto = total - 10000;
      if (procedimientos.length > 0 && resto > 0) {
        const porProcedimiento = resto / procedimientos.length;
        procedimientosOut = procedimientos.map(p => ({
          ...p,
          vrServicio: porProcedimiento,
          numFEVPagoModerador: facturaNormalizada
        }));
      } else if (procedimientos.length > 0) {
        procedimientosOut = procedimientos.map(p => ({
          ...p,
          vrServicio: 0,
          numFEVPagoModerador: facturaNormalizada
        }));
      }
    } else if (procedimientos.length > 0) {
      const porProcedimiento = total / procedimientos.length;
      procedimientosOut = procedimientos.map(p => ({
        ...p,
        vrServicio: porProcedimiento,
        numFEVPagoModerador: facturaNormalizada
      }));
    }

    // g) Construir el usuario modificado
    const nuevoUsuario = {
      ...usuario,
      servicios: {
        ...usuario.servicios,
        consultas: consultasOut,
        procedimientos: procedimientosOut
      }
    };

    // h) Construir el JSON final para este usuario
    const jsonUsuario = {
      numDocumentoIdObligado,
      numFactura: facturaNormalizada,
      tipoNota,
      numNota,
      usuarios: [nuevoUsuario]
    };

    // i) Crear carpeta individual para este usuario:
    //    Nombre: <facturaNormalizada>_ <tipoDocumentoIdentificacion><numDocumentoIdentificacion>
    const carpetaUsuario = path.join(
      carpetaReporte,
      `${facturaNormalizada}_${usuario.tipoDocumentoIdentificacion || 'X'}${usuario.numDocumentoIdentificacion}`
    );
    if (!fs.existsSync(carpetaUsuario)) {
      fs.mkdirSync(carpetaUsuario, { recursive: true });
      console.log('Creada subcarpeta:', carpetaUsuario);
    }

    // j) Guardar el JSON con nombre "<facturaNormalizada>.json"
    const nombreJson = `${facturaNormalizada}.json`;
    const rutaJson = path.join(carpetaUsuario, nombreJson);
    fs.writeFileSync(rutaJson, JSON.stringify(jsonUsuario, null, 2), 'utf8');
    console.log('Guardado JSON:', rutaJson);

    // k) Copiar el XML correspondiente:
    //    - El archivo original en "C:\facturas_dian" se llama "<dian_FEVX>.xml"
    //    - En la carpeta del usuario se guardará como "<facturaNormalizada>.xml"
    const nombreXmlOriginal = `${convertirNombre(originalNumFactura)}.xml`;
    const rutaOrigenXml = path.join('C:', 'facturas_dian', nombreXmlOriginal);
    const rutaDestinoXml = path.join(carpetaUsuario, `${facturaNormalizada}.xml`);
    if (fs.existsSync(rutaOrigenXml)) {
      fs.copyFileSync(rutaOrigenXml, rutaDestinoXml);
      console.log('Copiado XML:', rutaDestinoXml);
    } else {
      console.warn('No se encontró XML para:', originalNumFactura);
    }

    guardados++;
  });

  // 3. Abrir la carpeta principal en el explorador de archivos (solo en Windows)
  exec(`explorer "${carpetaReporte}"`);

  // 4. Responder al cliente
  res.json({
    mensaje: `Se procesaron y guardaron ${guardados} usuarios en carpetas separadas dentro de ${carpetaReporte}`,
    cantidad: guardados,
    ruta: carpetaReporte
  });
});
//ejsonprocesado


var server = http.createServer(app);
reload(app).then(function (reloadReturned) {
  // reloadReturned is documented in the returns API in the README

  // Reload started, start web server
  server.listen(app.get('port'), function () {
    console.log('Web server listening on port ' + app.get('port'))
  })
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})
/*
app.listen(8080,()=>{


  console.log("Server on port 8080");

});*/