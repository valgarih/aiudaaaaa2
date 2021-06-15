const authRoutes = require('./auth/auth.routes');
const express = require('express');
const propierties = require('./config/properties');
const DB = require('./config/db');
// const SockectIO = require('socket.io');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//Initializations
DB();
const app = express();
const router = express.Router();
var data_presion;
const cors = require('cors');
const bodyParser = require('body-parser');
const bodyParserJson = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });
app.use(bodyParserJson);
app.use(bodyParserURLEncoded);
app.use(cors())
app.use('/api', router);
authRoutes(router);
router.get('/', (req, res) => {
  res.send('Hello from home');
});


//Post para recibir datos del modulo wifi
app.post('/tt', (req, res) => {
  console.log(req.body);
  const cadena = req.body['value2'].split(',');
  var infrarrojo = cadena[0];
  var rojo = cadena[1];
  console.log(infrarrojo, rojo);
  var absorbancia = -Math.log10(rojo / infrarrojo);
  console.log("absorbancia:" + absorbancia);
  var glucosa = Rango(absorbancia);
  console.log("glucosa:" + glucosa);

  if (glucosa !== undefined) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("loginTT");
      var myobj = { a: glucosa };
      dbo.collection("datosRecibidos").insertOne(myobj, function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
    res.send("recibido");
  }



})


//Post para recibir datos del front
app.post('/data_presion', async (req, res) => {
  console.log(req.body);
  var data = await datosRecibidos();
  console.log(1, data);
  res.send(JSON.stringify(data));
})

//Post para recibir datos del front de la glucosa
app.post('/data_glucosa', async (req, res) => {
  var data = await datosRecibidos();
  console.log(1, data);
  res.send(JSON.stringify(data));
})


app.delete('/borrar_dato', async (req, res) => {
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => { console.log(err) });

  if (!client) return;

  try {
    var dbo = client.db("loginTT");
    await dbo.collection("datosRecibidos").remove();
    res.send("Ok");
  } catch (e) {
    console.log(e);
    res.send("Peto");
  }
})

async function datosRecibidos() {
  var data;
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => { console.log(err) });

  if (!client) return;
  try {
    var dbo = client.db("loginTT");
    const result = await dbo.collection("datosRecibidos").find();
    data = await result.toArray();
    client.close();
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

function Rango(param) {
  var rango;
  if ((param > 0.01614828101) && (param < 0.02829077198)) {
    rango = (Number(param) + 1.1738) / 0.0121;
  }
  else if ((param > 0.00435181300) && (param < 0.02788977160)) {
    rango = (Number(param) + 1.1725) / 0.0118;
  }
  else if ((param > 0.02788977160) && (param < 0.03345397683)) {
    rango = (Number(param) - 0.0107) / 0.0002;
  } else if ((param > 0.01972795306) && (param < 0.01252177472)) {
    rango = (Number(param) - 0.0549) / (-0.0005);
  } else if ((param > 0.03345397683) && (param < 0.02286980995)) {
    rango = (Number(param) - 0.1434) / (-0.0008);
  } else if ((param > 0.02286980995) && (param < 0.011151647440)) {
    rango = (Number(param) - 0.0398) / (-0.0001);
  } else if ((param > 0.011151647440) && (param < 0.02659858899)) {
    rango = (Number(param) + 0.1505) / 0.0007;
  }
  return rango;
}

app.post('/save_presion', (req, res) => {
  console.log(req.body);
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("loginTT");
    // var myobj = { data_presion_alta: "180", data_presion_baja: "37", status: "OK", coments: "prueba desde el front", date: new Date() };
    var myobj = req.body;
    dbo.collection("Presion").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
  });
  res.json({ status: 'OK' })
})

app.post('/get_presion', async (req, res) => {
  var aux = req.body.fechabusqueda;
  var nombre_data = "date";
  var respuesta_datos = await obtenerDatosHistorial(nombre_data, aux);
  console.log(respuesta_datos);
  res.send(respuesta_datos)
})

async function obtenerDatosHistorial(nombre_data, aux) {
  console.log(nombre_data, aux);
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => { console.log(err) });

  if (!client) return;
  try {
    var dbo = client.db("loginTT");
    const result = await dbo.collection("Presion").find({ [nombre_data]: aux });
    data = await result.toArray();
    client.close();
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}


app.post('/get_data_graficas', async (req, res) => {
  var respuesta_datos = await obtenerDatosGraficas();
  console.log(respuesta_datos);
  res.send(respuesta_datos)
})


async function obtenerDatosGraficas() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(err => { console.log(err) });

  if (!client) return;
  try {
    var dbo = client.db("loginTT");
    const result = await dbo.collection("Presion").find();
    data = await result.toArray();
    client.close();
    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}
app.use(router);

app.listen(propierties.PORT, () => {
  console.log(`Server on port ${propierties.PORT}`);
})
