const express = require('express')
const app = express()
const { MongoClient} = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ObjectID=require('mongodb').ObjectId
require('dotenv').config();
const fileUpload=require('express-fileupload');
const fs=require('fs-extra')



const port = process.env.PORT || 9999;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());
app.use(express.json())
// app.use(express.static('photos'))
app.use(fileUpload())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mvdkd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
  const servicesCollection = client.db(`${process.env.DB_NAME}`).collection("services");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
  const orderedCollection = client.db(`${process.env.DB_NAME}`).collection("orderedList");



app.post('/admin',async(req,res)=>{
  const email= await req.body.body
  adminCollection.insertOne(email)
  .then(result=>{
    console.log(result.acknowledged)
  })
});

app.post('/addService',(req,res)=>{
  const file=req.files.file
  const title=req.body.title
  const description= req.body.description
  const status= req.body.status
  const image=file.data;
  const enCodedImage=image.toString('base64');

  const finalImageData={
    contentType:file.mimetype,
    size:file.size,
    img:Buffer.from(enCodedImage,'base64')
  }

  console.log(file,title,description);
  servicesCollection.insertOne({title:title,description:description,status:status, image:finalImageData})
  .then(result=>{
    console.log(result.acknowledged);
  })
})


app.get('/getServices',(req,res)=>{
  servicesCollection.find({})
  .toArray((error,documents)=>{
    res.send(documents);
  })
})

app.post('/addReview',(req,res)=>{
  const data=req.body
  reviewCollection.insertOne(data)
  .then(result=>{
    console.log(result.acknowledged)
  })
})

app.get('/getReview',(req,res)=>{
  reviewCollection.find({})
  .toArray((error,documents)=>{
    res.send(documents);
    console.log(error)
  })
})

app.post('/addOrder',(req,res)=>{
  const data=req.body
  console.log(data)
  orderedCollection.insertOne(data)
  .then(result=>{
    res.send(result.acknowledged)
  })
})

app.get('/orderedData/:email',(req,res)=>{
  const email=req.params.email
  orderedCollection.find({email:email})
  .toArray((error, documents)=>{
    res.send(documents)
  })
})

app.get('/allOrderedList',(req,res)=>{
  orderedCollection.find({})
  .toArray((error, documents)=>{
    res.send(documents)
  })
})

app.put('/changeStatus',(req,res)=>{
  const id=req.query.id
  const status= req.query.status

  orderedCollection.updateOne({_id:ObjectID(id)},{
    $set:{
      status:status
    }
  })
  .then(result=>{
    // console.log(result);
  })
})


app.delete('/deleteFromOrderedLis/:id',(req,res)=>{
  const id=req.params.id
  orderedCollection.deleteOne({_id:ObjectID(id)})
  .then(result=>{
    res.send(result.acknowledged)
  })
})


console.log("database connected!")
});


app.get('/',(req,res)=>{
    res.send('Hello World-Test!')
  })
  
app.listen(port)