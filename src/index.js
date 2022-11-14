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

let ms = Date.now()

const app = express();
app.use(cors());
app.use(json());

const participants = {
  name: 'xxx', 
  lastStatus: Date.now()
};

const messages = {
  from: "João",
  to: "Todos",
  text: "oi galera",
  type: "message",
  time: "20:04:37",
};

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
      to: "todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs(ms),
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
    console.log(allParticipants)
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
    time: dayjs(ms)
   })
   res.sendStatus(201);

  } catch (err) {
    console.log(err);
    res.sendStatus(400)
  }
  
});

app.get("/messages", async (req, res) => {
  // const { id } = req.params;
  // const limit = parseInt(req.query.limit);
   // const messages = await db.messages.find().toArray();
  try {
    const allMessages = await collectionMessages.find().toArray()
    res.send(allMessages)
  } 
  catch (err) {
    console.log(err);
  }
  
});

app.post("/status", async (req, res) => {
  
  try {console.log("")
  } catch (err) {
    console.log(err);
  }
  res.sendStatus(200);
});

app.listen(5000, () => console.log("Running in port: 5000"));
