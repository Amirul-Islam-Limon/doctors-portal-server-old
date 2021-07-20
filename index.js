const express = require('express')
const app = express()
const { MongoClient} = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectID=require('mongodb').ObjectID
require('dotenv').config();
const fileUpload=require('express-fileupload');
const fs=require('fs-extra')


const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'))
app.use(fileUpload())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvdkd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
  const doctorCollection = client.db(`${process.env.DB_NAME}`).collection('doctors');

  
  app.post('/addAppointment',(req,res)=>{
      const appointment=req.body;
      appointmentCollection.insertOne(appointment)
      .then(results=>{
          res.send(results.acknowledged)
          console.log(results);
      })
  })

    app.post('/appointmentsByDate',(req,res)=>{
      const date=req.body;
      const email=req.body.email;
      doctorCollection.find({email:email})
      .toArray((error,documents)=>{

        if(documents.length > 0){
          appointmentCollection.find({date:date.date})
          .toArray((err, documents)=>{
            res.send(documents)
          })
        }
        else{
          appointmentCollection.find({email:email})
          .toArray((err, documents)=>{
            res.send(documents)
          })
        }

      })    
  })

  app.post('/addDoctor',(req,res)=>{
    const file= req.files.file
    const fileName=req.files.file.name
    const name=req.body.name
    const email=req.body.email
    const newImage=file.data
    const enCodedImage=newImage.toString('base64')
    const image={
        contentType:file.mimetype,
        size:file.size,
        img:Buffer.from(enCodedImage,'base64')
      }

      doctorCollection.insertOne({name,email,image})
      .then(result=>{
          res.send(result.acknowledged)
      })

  })

  app.get('/doctors',(req,res)=>{
    doctorCollection.find()
    .toArray((error,documents)=>{
      res.send(documents)
    })
  })

  app.post('/isDoctor',(req,res)=>{
    const email=req.body.email;
    doctorCollection.find({email:email})
    .toArray((error,documents)=>{
        res.send(documents.length > 0)
    })    
})



console.log("database connected!")
});



app.get('/',(req,res)=>{
    res.send('Hello World!')
  })
  
app.listen(port)