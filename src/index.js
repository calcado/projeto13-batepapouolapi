import express, { json } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";
import dayjs from "dayjs";
dotenv.config();


const participantsSchema = joi.object({
  name: joi.string().required(),  
});

const messagesSchema= joi.object({
  to:joi.string().required(),
  text:joi.string().required(),
  type:joi.string().required(),
  
})

const mongoClient = new MongoClient(process.env.MONGO_URI);
try {
  await mongoClient.connect();
} catch (err) {
  console.log(err);
}

const db = mongoClient.db("batePapoUolApi");
const collectionParticipants = db.collection("participants");
const collectionMessages = db.collection("messages");

const app = express();
app.use(cors());
app.use(json());


setInterval(async (interval) => {
  
  const allParticipants = await collectionParticipants.find().toArray();
  allParticipants.forEach(async (participant)=>{
    if (Date.now() - participant.lastStatus  > 10000) {
      try{
        await collectionParticipants.deleteOne({name:participant.name})
        await collectionMessages.insertOne({
          from: participant.name,
          to: "Todos",
          text: "sai da sala...",
          type: "status",
          time: dayjs().format('HH:mm:ss')

        })
      }catch(err){
        console.log(err)
      }
      }
  })}, 15000);

app.post("/participants", async (req, res) => {
  const { name } = req.body;

  const validationParticipant = participantsSchema.validate(req.body, {
    abortEarly: false,
  });
  
  if (validationParticipant.error) {
    const error = validationParticipant.error.details.map((detail)=>detail.message);
    res.status(422).send(error);
    return
  }

  const user = await collectionParticipants.findOne({name})
  if (user) {
    res.sendStatus(409);
    return;
  }

  try {
    await collectionParticipants.insertOne({
      name,
      lastStatus: Date.now()      
    });
    await collectionMessages.insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format('HH:mm:ss')
    });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
  
});

app.get("/participants", async (req, res) => {
  
  try {
    const allParticipants = await collectionParticipants.find().toArray();
    
    res.status(201).send(allParticipants);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  const user = req.headers.user; 
  const validationMessage = messagesSchema.validate(req.body, {abortEarly:false});
  
  if (validationMessage.error) {
    const error = validationMessage.error.details.map((detail)=>detail.message);
    res.status(422).send(error);
    return
  }
  try {
   await collectionMessages.insertOne({
    from:user,
    to,
    text,
    type,
    time: dayjs().format('HH:mm:ss')
   })
   res.sendStatus(201);

  } catch (err) {
    console.log(err);
    res.sendStatus(400)
  }
  
});

app.get("/messages", async (req, res) => {
  const user = req.headers.user
  const limit = parseInt(req.query.limit);
  
  try {
    const allMessages = (await collectionMessages.find().toArray()).filter(
      (messageUser)=> {
        if(messageUser.type === "message" || 
        messageUser.type === "status" || 
        messageUser.from === user || 
        messageUser.to === user){
          return messageUser
        }
      });
    
    res.send(allMessages.slice(-limit))
  } 
  catch (err) {
    console.log(err);
  }
  
});

app.post("/status", async (req, res) => {
  const userHeader = req.headers.user;
  const user = await collectionParticipants.findOne({name:userHeader });
  console.log(user);
  
  if (!user) {
    res.sendStatus(404);
    return;
  }

  try {
    await collectionParticipants.updateOne(
      {
        name: userHeader,
      },
      { $set: { lastStatus: Date.now() } }
    );
    
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
  }
});

app.listen(5000, () => console.log("Running in port: 5000"));
