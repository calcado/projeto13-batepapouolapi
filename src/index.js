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
  from:joi.string().required()
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
    aborteEarly: true,
  });
  console.log(collectionParticipants)
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
    await collectionParticipants?.insertOne({
      name,
      lastStatus: Date.now()      
    });
    await collectionMessages?.insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: "agora",
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

  res.sendStatus(201);
});

app.get("/participants", async (req, res) => {
  
  try {
    const allParticipants = await collectionParticipants?.find().toArray();
    console.log(allParticipants)
    res.status(200).send(allParticipants);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post("/messages", async (req, res) => {
  const { to, text, type } = req.body;
  // const { from } = req.headers.User;
  try {
   console.log("")
  } catch (err) {
    console.log(err);
  }
  res.sendStatus(201);
});

app.get("/messages", async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit);
  const user = req.query.User;
  const messages = await db.messages.find().toArray();
  try {console.log("")
  } catch (err) {
    console.log(err);
  }
  res.sendStatus(200);
});

app.post("/status", async (req, res) => {
  const user = req.headers;
  try {console.log("")
  } catch (err) {
    console.log(err);
  }
  res.sendStatus(200);
});

app.listen(5000, () => console.log("Running in port: 5000"));
