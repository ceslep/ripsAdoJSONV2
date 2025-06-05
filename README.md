## RIPS A.D.O.  
Aplicación web para generación y gestión de archivos RIPS (Registro Individual de Prestación de Servicios de Salud)

---

### Índice

1. [Descripción](#descripción)  
2. [Tecnologías](#tecnologías)  
3. [Instalación](#instalación)  
4. [Configuración](#configuración)  
5. [Estructura del proyecto](#estructura-del-proyecto)  
6. [Endpoints disponibles](#endpoints-disponibles)  
7. [Uso](#uso)  
8. [Contribuir](#contribuir)  
9. [Licencia](#licencia)  

---

### Descripción

Este proyecto es una pequeña aplicación construida con **Node.js** y **Express** que funciona como piedra angular de un sistema RIPS (Registro Individual de Prestación de Servicios de Salud).  
- El servidor en `index.js` actúa como proxy/puente hacia un conjunto de scripts PHP que generan y obtienen datos RIPS mediante peticiones HTTP.  
- El cliente (HTML y JavaScript) ofrece una interfaz interactiva para:  
  - Visualizar estadísticas de pagos (efectivo, tarjeta, transferencia, etc.)  
  - Cargar y filtrar citas entre rangos de fechas  
  - Generar y descargar archivos CSV y JSON (para cada usuario o por facturación)  
  - Ejecutar procesos de actualización/desactualización de indicadores (“actualizaInds” y “noactualizaInds”)  
  - Preparar ficheros JSON masivos y copiar XML asociados a cada usuario en carpetas específicas  

En resumen, el flujo principal es:  
1. El navegador hace peticiones a distintos endpoints en Node.js.  
2. Node.js reenvía esas peticiones a scripts PHP locales (o remotos) para obtener datos de RIPS.  
3. El cliente muestra tablas dinámicas y genera descargas (CSV/JSON).  
4. Existe un proceso extra (`/jsonmasivo`) que construye carpetas en el disco local con archivos JSON y copia los XML de facturación correspondientes.  

---

### Tecnologías

- **Node.js** (v14+ recomendado)  
- **Express** (servidor HTTP y gestión de rutas)  
- **node-fetch** (para hacer peticiones HTTP a scripts PHP)  
- **body-parser** (parseo de JSON en las peticiones entrantes)  
- **reload** (recarga automática del servidor en desarrollo)  
- **morgan** (logger HTTP, opcional)  
- **Bootstrap 4.6** (interfaz web)  
- **jQuery 3.5.1** (manipulación del DOM y peticiones AJAX en cliente)  
- **SweetAlert2** (modales y alertas amigables)  
- **andypf-json-viewer** (visualizador JSON dentro de la ventana modal)  
- **HTML5 / CSS3 / JavaScript (ES6+)** en el frontend  

---

### Instalación

1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/tu-usuario/rips-ado.git
   cd rips-ado
   ```

2. **Instalar dependencias de Node.js**  
   Asegúrate de tener instalado Node.js (v14 o superior) y npm.  
   ```bash
   npm install
   ```

3. **Configurar scripts PHP**  
   El servidor Node.js actúa como “proxy” hacia varios endpoints PHP. Por defecto, en `index.js` hay una constante:
   ```js
   const URL = \`http://127.0.0.1/adoweb/php/\`;
   ```
   - **Modifica esta constante** para que apunte a la carpeta donde residan tus scripts PHP (por ejemplo:  
     ```js
     const URL = \`https://mi-servidor-php.com/ruta/a/php/\`; 
     ```  
   - Asegúrate de que todos los archivos `.php` requeridos existan en esa carpeta y respondan con JSON correctamente estructurado.

4. **Estructura de carpetas**  
   ```text
   rips-ado/
   ├── index.js         # Servidor principal de Express
   ├── app.js           # Lógica JavaScript del cliente (frontend)
   ├── index.html       # Página principal (interfaz web)
   ├── public/          # Carpeta para archivos estáticos (opcional)
   ├── package.json     # Metadatos y dependencias de Node.js
   └── README.md        # Este archivo de documentación
   ```

5. **Arrancar el servidor en modo desarrollo**  
   ```bash
   npm start
   ```
   o, si usas **nodemon**:
   ```bash
   npx nodemon index.js
   ```
   Por defecto, el servidor escucha en el puerto **3000** (o el que asigne `process.env.PORT`).

---

### Configuración

- **Puerto de escucha**:  
  - En `index.js` se define:  
    ```js
    app.set('port', process.env.PORT || 3000);
    ```
  - Para cambiarlo, puedes exportar la variable de entorno `PORT` o editar este valor manualmente.

- **Ruta base de PHP**:  
  - Edita la línea:
    ```js
    const URL = \`http://127.0.0.1/adoweb/php/\`;
    ```
    para indicar la ubicación exacta de tus scripts PHP en tu entorno (local o servidor).

- **Carpeta de “public”**:  
  - Actualmente, `index.js` monta `/public` como estático:
    ```js
    app.use('/', express.static(__dirname + '/public'));
    ```
  - Si deseas servir `index.html` y `app.js` desde `/public`, mueve estos archivos dentro de `public/` o ajusta la ruta según tu conveniencia.

---

### Estructura del proyecto

```text
rips-ado/
├── index.js
│   ├─ Configura un servidor Express
│   ├─ Define múltiples rutas (endpoints) que invocan funciones `getData`, `getDatai` y `postData`
│   ├─ Procesa un endpoint especial `/jsonmasivo` que crea carpetas, genera JSON y copia XML
│   └─ Arranca un servidor HTTP con recarga automática (reload)
│
├── app.js
│   ├─ Contiene todo el código cliente en JavaScript (uso de jQuery + fetch)  
│   ├─ Carga datos (citas, RIPS) desde Node.js y genera tablas dinámicas  
│   ├─ Permite filtrar, exportar CSV, generar JSON en pantalla y guardarlo localmente  
│   └─ Controla modales de Bootstrap, lógica de selección de filas y envío de actualizaciones
│
├── index.html
│   ├─ Página principal en HTML5 con Bootstrap 4.6  
│   ├─ Barra de navegación para acceder a distintas secciones (Citas, RIPS, JSON, etc.)  
│   ├─ Tablas responsivas para mostrar datos de pagos y RIPS  
│   ├─ Módulos de modales para errores, información y descarga JSON  
│   └─ Referencia a `app.js` y a `reload/reload.js` (para recarga automática en desarrollo)
│
├── public/            # (Opcional) Carpeta para almacenar assets estáticos (CSS, imágenes, etc.)
│   └─ ...
│
├── package.json       # Dependencias y scripts de Node.js
├── package-lock.json  # Versión exacta de dependencias
└── README.md          # Documentación (este archivo)
```

---

### Endpoints disponibles

> **Importante**: todos los endpoints funcionan por método **POST** (excepto `/url` y `/`) y devuelven JSON. Node.js reenvía la petición al script PHP correspondiente.

1. **GET `/`**  
   - Devuelve el archivo `index.html`, que despliega la interfaz de usuario.  
   - Equivalente a `http://localhost:3000/`.

2. **GET `/url`**  
   - Responde con `{ servidor: <URL_donde_están_los_php> }`.  
   - Sirve para que el cliente sepa a qué ruta PHP apuntar (se muestra en pantalla).

3. **POST `/citas`**  
   - Recibe `{ fecha1: "YYYY-MM-DD", fecha2: "YYYY-MM-DD" }`.  
   - Llama internamente a `getData("getCitas_", fechas)`, que hace `fetch a <URL>/getCitas_.php?fecha1=...&fecha2=...`.  
   - Devuelve un array de objetos “citas” con detalles de pagos, identificaciones, fechas, valores, etc.

4. **POST `/arips`**  
   - Recibe `{ fecha1, fecha2 }`.  
   - Llama a `fetch <URL>/arips.php?fecha1=...&fecha2=...`.  
   - Devuelve datos de “arips” (probablemente un subconjunto filtrado para arcos de RIPS).

5. **POST `/ripsUsuarios`**  
   - Recibe `{ fecha1, fecha2 }`.  
   - Llama a `<URL>/ripsUsuarios.php?fecha1=...&fecha2=...`.  
   - Devuelve un listado de usuarios que han tenido actividad en ese rango de fechas.

6. **POST `/ripsConsulta`**  
   - Recibe `{ fecha1, fecha2 }`.  
   - Llama a `<URL>/ripsConsulta.php?fecha1=...&fecha2=...`.  
   - Devuelve datos de consultas RIPS para todos los pacientes.

7. **POST `/ripsConsultai`**  
   - Recibe `{ paciente: "<identificación>", fecha1, fecha2 }`.  
   - Llama a `<URL>/ripsConsulta.php?paciente=...&fecha1=...&fecha2=...`.  
   - Devuelve únicamente las consultas RIPS de un paciente específico.

8. **POST `/ripsProcedimientos`**  
   - Recibe `{ fecha1, fecha2 }`.  
   - Llama a `<URL>/ripsProcedimientos.php?fecha1=...&fecha2=...`.  
   - Devuelve datos de procedimientos RIPS.

9. **POST `/ripsProcedimientosi`**  
   - Recibe `{ paciente, fecha1, fecha2 }`.  
   - Llama a `<URL>/ripsProcedimientosi.php?paciente=...&fecha1=...&fecha2=...`.  
   - Devuelve procedimientos RIPS sólo para un paciente.

10. **POST `/ripsTransacciones`**  
    - Recibe `{ fecha1, fecha2 }`.  
    - Llama a `<URL>/ripsTransacciones.php?fecha1=...&fecha2=...`.  
    - Devuelve las transacciones RIPS (por ejemplo, movimientos de pagos) en el rango de fechas.

11. **POST `/actualizaInds`**  
    - Recibe un array de objetos `[{ citasind: <id>, fecha: "<YYYY-MM-DD>" }, ...]`.  
    - Internamente hace `postData("actualizaInds", datos)`, que invoca `<URL>/actualizaInds.php` con JSON.  
    - Sirve para marcar (o “actualizar”) ciertas citas en la base de datos PHP.

12. **POST `/actuaEvol`**  
    - Recibe `{ campo: "...", value: "...", ind: <id>, database: "ado" }`.  
    - Llama a `<URL>/actualizaEvolucion.php` mediante `postData("actualizaEvolucion", ...)`.  
    - Actualiza datos asociados a evolución clínica (parece específico de la aplicación médica).

13. **POST `/noactualizaInds`**  
    - Mismo formato que `/actualizaInds`, pero invoca `<URL>/noactualizaInds.php`.  
    - Reversa la acción de “actualizar” para un conjunto de citas (marcarlas como no procesadas).

14. **POST `/jsonmasivo`**  
    - Recibe un objeto con esta estructura:
      ```jsonc
      {
        "numDocumentoIdObligado": "31405200",
        "numFactura": null,
        "tipoNota": "RS",
        "numNota": "FE-1000",
        "usuarios": [ /* array de usuarios con servicios.consultas y servicios.procedimientos */ ]
      }
      ```
    - Realiza:
      1. Limpia o crea la carpeta local `Documents/reporteRips` en el disco.  
      2. Para cada usuario en `usuarios`:
         - Filtra y elimina duplicados de consultas y procedimientos.
         - Normaliza el número de factura (por ejemplo, `"FEV-0001" → "FEV1"`).
         - Reparte los valores de servicio (10 000 para consultas y el resto para procedimientos).
         - Crea una subcarpeta llamada `<facturaNormalizada>_<tipoDoc><númeroDoc>` (ej: `FEV1_CC123456`).
         - Guarda un JSON en dicha carpeta con nombre `<facturaNormalizada>.json`.  
         - Copia el XML correspondiente (`<dian_FEVX>.xml`) desde `C:acturas_dian\` a `<carpetaUsuario>/<facturaNormalizada>.xml`.
      3. Abre la ventana del explorador de archivos en Windows apuntando a la carpeta principal.  
      4. Devuelve un JSON con `{ mensaje, cantidad, ruta }`.  
    - Este endpoint automatiza la creación de ficheros JSON+XML para cada usuario, listos para cargar en la DIAN o sistema RIPS.

---

### Uso

1. **Arrancar el servidor**  
   ```bash
   npm start
   ```
   Esto levantará un servidor en `http://localhost:3000/` (a menos que definas otra variable `PORT`).

2. **Abrir la interfaz web**  
   En tu navegador, ve a `http://localhost:3000/`. Deberías ver la pantalla principal con:  
   - Un navbar que permite acceder a “Inicio”, “Citas” y al menú desplegable de “Archivos R.I.P.S.”.  
   - Un panel de “Resumen Pagos” con indicadores (efectivo, tarjeta, transferencia, total y seleccionado).  
   - Un formulario de búsqueda con rangos de fecha (`fecha1` y `fecha2`), botón “Cargar” y campo de búsqueda de texto.  
   - Una tabla responsiva donde se listan las citas/pagos y, según la opción seleccionada, usuarios, consultas, procedimientos o transacciones.

3. **Flujo de interacción**  
   - **Cargar citas/estadísticas**  
     1. Selecciona rango de fechas (por defecto se muestra del inicio del mes actual a la fecha actual).  
     2. Haz clic en “Cargar” (o espera 3 segundos para carga automática).  
     3. La tabla principal mostrará todas las citas entre esas fechas, con casillas para marcar según la forma de pago.  
     4. Los totales (efectivo, tarjeta, transferencia, total) se calculan dinámicamente. Si marcas una o varias filas, la suma “Seleccionado” se actualiza al instante.

   - **Filtrar RIPS**  
     1. Haz clic en “R.I.P.S. A.D.O.” (navbar) para alternar entre vista general y filtrada (“arips”).  
     2. Si está activado, la aplicación obtendrá sólo los registros marcados como “arips” en la base de datos PHP.

   - **Ver Usuarios / Consultas / Procedimientos / Transacciones**  
     1. En el menú “Archivos R.I.P.S.” selecciona:
        - **Usuarios [US]**: muestra un listado de usuarios en un rango de fechas.  
        - **Consulta [AC]**: lista todas las consultas RIPS.  
        - **Procedimientos [AP]**: lista todos los procedimientos RIPS.  
        - **Transacciones [AF]**: lista las transacciones RIPS.  
     2. Cada listado se muestra en una tabla responsiva que permite exportar a CSV con un botón específico.

   - **Exportar CSV**  
     1. Una vez cargada una tabla (Usuarios, Consulta, Procedimientos o Transacciones), haz clic en el botón “Exportar a csv”.  
     2. El sistema generará automáticamente un archivo CSV con nombre según el prefijo y las fechas (por ejemplo `US2025-06-01-al-2025-06-05.csv`).

   - **Generar JSON en pantalla**  
     1. Desde el menú “Archivos R.I.P.S.” haz clic en “Generar JSON”.  
     2. La aplicación obtendrá los usuarios, sus consultas y procedimientos, y mostrará un modal con un visualizador JSON.  
     3. Puedes inspeccionar, ver la estructura y luego “Guardar” localmente el archivo `.json` haciendo clic en el botón “Guardar”.

   - **Generar JSON con facturas**  
     1. Similar a “Generar JSON”, pero sólo incluye aquellos elementos que posean campo `factura_consulta`.  
     2. Permite guardar un JSON filtrado por facturación.

   - **Enviar JSON masivo ( `/jsonmasivo` )**  
     1. Desde el modal donde aparece el JSON, haz clic en “Guardar Fs”.  
     2. Esto envía el JSON completo al endpoint `/jsonmasivo`.  
     3. Al procesar, Node.js creará automáticamente carpetas con JSON y copiará los XML correspondientes (si existen en `C:\facturas_dian\`).  
     4. Al terminar, mostrará una alerta de éxito y abrirá la carpeta principal (`reporteRips`) en el explorador de Windows.

   - **Actualizar / Desactualizar citas**  
     1. Si marcas casillas en la tabla principal y haces clic en “Actualizar” o “Desactualizar” (menú “Archivos R.I.P.S.”), se enviará un array de objetos con `{ citasind, fecha }` a los endpoints `/actualizaInds` o `/noactualizaInds`.  
     2. Estos scripts PHP actualizarán el estado de dichas citas en la base de datos.

---

### Contribuir

1. Haz un _fork_ de este repositorio.  
2. Crea una rama (`git checkout -b mi-mejora`).  
3. Haz tus cambios y haz _commit_ (`git commit -m "Agrega nueva funcionalidad X"`).  
4. Empuja tu rama al repositorio remoto (`git push origin mi-mejora`).  
5. Abre un _Pull Request_ describiendo el cambio.  

Se recibirán con gusto mejoras relacionadas con:  
- Optimización de endpoints y manejo de errores.  
- Documentación adicional (por ejemplo, un diagrama de flujo de `/jsonmasivo`).  
- Tests unitarios (por ejemplo, para la función `normalizarFactura` en `index.js`).  
- Adaptación para entornos no Windows (por ejemplo, cambiar la ruta de copiado de XML).  

---

### Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

> **Nota final**: recuerda ajustar las rutas y credenciales de los scripts PHP en tu entorno antes de desplegar en producción. Si usas un servidor distinto a Windows, modifica la lógica de apertura del explorador y la gestión de archivos en `index.js`.
