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
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter(item => {
    // Copia el objeto sin el campo consecutivo
    const obj = { ...item };
    delete obj.consecutivo;
    // Crea un string único para comparar
    const key = JSON.stringify(obj);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function convertirNombre(nombre) {
  if (typeof nombre !== 'string') return '';
  const match = nombre.match(/^FEV-(\d+)$/);
  if (!match) return '';
  const numero = parseInt(match[1], 10); // Elimina ceros a la izquierda
  return `dian_FEV${numero}`;
}

app.post('/jsonmasivo', async (req, res) => {
  const { numDocumentoIdObligado, tipoNota, numNota, usuarios } = req.body;

  if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
    return res.status(400).json({ mensaje: "No hay usuarios en el JSON" });
  }

  // Ruta Documentos Windows
  const documentos = path.join(os.homedir(), 'Documentos');
  const carpetaReporte = path.join(documentos, 'reporteRips');
  console.log('Carpeta principal:', carpetaReporte);

  // Limpiar o crear carpeta principal
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

  // Procesar usuarios y guardar archivos
  let guardados = 0;
  const resultado = usuarios.map(usuario => {
    // FILTRA consultas y procedimientos para eliminar los de identificacion null o undefined
    let consultas = (usuario.servicios?.consultas || []).filter(
      c => c.numDocumentoIdentificacion !== null && c.numDocumentoIdentificacion !== undefined
    );
    let procedimientos = (usuario.servicios?.procedimientos || []).filter(
      p => p.numDocumentoIdentificacion !== null && p.numDocumentoIdentificacion !== undefined
    );

    // ---- ELIMINAR DUPLICADOS ----
    consultas = removeDuplicates(consultas);
    procedimientos = removeDuplicates(procedimientos);

    let numFactura = null;

    if (consultas.length > 0 && consultas[0].numFEVPagoModerador) {
      numFactura = consultas[0].numFEVPagoModerador;
    } else if (procedimientos.length > 0 && procedimientos[0].numFEVPagoModerador) {
      numFactura = procedimientos[0].numFEVPagoModerador;
    }
    if (!numFactura) {
      console.log('Usuario sin numFEVPagoModerador, se omite:', usuario.numDocumentoIdentificacion || 'sin ID');
      return null;
    }

    // Suma de vrServicio
    let totalConsultas = consultas.reduce((suma, c) => suma + (parseFloat(c.vrServicio) || 0), 0);
    let totalProcedimientos = procedimientos.reduce((suma, p) => suma + (parseFloat(p.vrServicio) || 0), 0);
    let total = totalConsultas + totalProcedimientos;

    // Repartir vrServicio
    let consultasOut = [];
    let procedimientosOut = [];

    if (consultas.length > 0) {
      let porConsulta = 10000 / consultas.length;
      consultasOut = consultas.map(c => ({
        ...c,
        vrServicio: porConsulta
      }));

      let resto = total - 10000;
      if (procedimientos.length > 0 && resto > 0) {
        let porProcedimiento = resto / procedimientos.length;
        procedimientosOut = procedimientos.map(p => ({
          ...p,
          vrServicio: porProcedimiento
        }));
      } else if (procedimientos.length > 0) {
        procedimientosOut = procedimientos.map(p => ({
          ...p,
          vrServicio: 0
        }));
      }
    } else if (procedimientos.length > 0) {
      let porProcedimiento = total / procedimientos.length;
      procedimientosOut = procedimientos.map(p => ({
        ...p,
        vrServicio: porProcedimiento
      }));
    }

    let nuevoUsuario = {
      ...usuario,
      servicios: {
        ...usuario.servicios,
        consultas: consultasOut,
        procedimientos: procedimientosOut
      }
    };

    // JSON final para este usuario
    const jsonUsuario = {
      numDocumentoIdObligado,
      numFactura,
      tipoNota,
      numNota,
      usuarios: [nuevoUsuario]
    };

    // --- CREA SUBCARPETA Y GUARDA EL ARCHIVO ---
    try {
      const subcarpeta = path.join(carpetaReporte, numFactura);
      if (!fs.existsSync(subcarpeta)) {
        fs.mkdirSync(subcarpeta, { recursive: true });
        console.log('Creada subcarpeta:', subcarpeta);
      }
      const nombreArchivo = `${numFactura}.json`;
      const rutaArchivo = path.join(subcarpeta, nombreArchivo);
      fs.writeFileSync(rutaArchivo, JSON.stringify(jsonUsuario, null, 2), 'utf8');
      console.log('Guardado:', rutaArchivo);
      guardados++;

      // -------- COPIA EL XML SI EXISTE ---------
      const nombreXml = convertirNombre(numFactura) + '.xml';
      const origenXml = path.join('C:', 'facturas_dian', nombreXml);
      const destinoXml = path.join(subcarpeta, nombreXml);
      if (fs.existsSync(origenXml)) {
        fs.copyFileSync(origenXml, destinoXml);
        console.log('Copiado XML:', destinoXml);
      } else {
        console.warn('No se encontró el archivo XML para:', numFactura);
      }

    } catch (error) {
      console.error(`Error al guardar archivo para ${numFactura}:`, error);
    }

    return jsonUsuario;
  }).filter(u => u !== null);
  exec(`explorer "${carpetaReporte}"`);
  res.json({
    mensaje: `Se procesaron y guardaron ${guardados} archivos JSON (y XML si existe) en subcarpetas dentro de ${carpetaReporte}`,
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