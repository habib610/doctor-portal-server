const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();
const port = 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploaddoctor'));
app.use(fileUpload());


app.get("/", (req, res) =>{
    res.send("doctors portal server")
})


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zcwe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });


client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection("doctors");
 const doctorsCollection =  client.db(`${process.env.DB_NAME}`).collection("mycollection");

 app.post("/addAppointment", (req, res)=>{
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

 app.post("/appointmentsByDate", (req, res)=>{
    const date = req.body;
    console.log(date);
    const email = req.body.email
    appointmentCollection.find({date: date.date})
    .toArray((err, documents)=>{
      res.send(documents)
    })
  })

app.post('/addDoctor', (req, res)=>{
  const file = req.files.file;
  const email = req.body.email;
  const name = req.body.name; 
  console.log( email,name, file);
//
const newImg = file.data;
const encImg = newImg.toString('base64');

var image = {
  contentType: file.mimetype,
  size:file.size,
  img: Buffer.from(encImg, 'base64')
}

doctorsCollection.insertOne({name, email, image})
.then(result =>{
  res.send(result.insertedCount > 0)
})
})

app.get('/getDoctor', (req, res)=>{
  doctorsCollection.find({})
  .toArray((err, documents)=>{
    res.send(documents)
  })
})


app.get('/allPatients', (req, res)=>{
  appointmentCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents)
    })
})

app.get('/isAdmin', (req, res) => {
  doctorsCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
          res.send(documents.length > 0);
      })
})

app.get('/myAppointment', (req, res) => {
  appointmentCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
          res.send(documents);
      })
})

//   client.close();
});



app.listen(process.env.PORT || port)