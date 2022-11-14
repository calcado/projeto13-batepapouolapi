import express, { json } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import dotenv from "dotenv"
import dayjs from "dayjs";


const mongoClient = new MongoClient("mongodb://localhost:27017");
try{
await mongoClient.connect();
}catch(err){
console.log(err)
}

const db = mongoClient.db("test");

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

const participants = {
  name: "",
  lastStatus: "",
};

const messages = {
  from: "",
  to: "",
  text: "",
  type: "",
  time: "",
};

const participantsSchema = joi.object({
  name: joi.string().required(),
});
const validationParticipant = participantsSchema.validate( participants, {
  aborteEarly: true,
});

app.post("/participants", async (req, res) => {
  const { name } = req.body.name;
  if (validationParticipant.error) {
    res.status(422).send("name deve ser strings não vazio");
  }
  if (db.collection("participants").findOne({ name })) {
    res.sendStatus(409);
    return
  }
  try {
    
    await db.participants.insertOne({
      name: `${name}`,
      lastStatus: "",
    });
    await db.messages.insertOne({
      from: `${name}`,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:mm:ss"),
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

  res.sendStatus(201);
});

app.get("/participants", async (req, res) => {
  const {id} = req.params
  try {
    const allParticipants = await db.participants.find().toArray();
    res.status(200).send(allParticipants);
  } catch (err) {
    console.log(err)
    res.sendStatus(400);
  }
});

app.post("/messages", async (req, res) => {
  const {to,text, type} = req.body
  const {from}= req.headers.User 
  
  try {

  } catch (err) {
    console.log(err)}
  res.sendStatus(201)  
});

app.get("/messages", async (req, res) => {
  const {id} = req.params;
  const limit = parseInt(req.query.limit);
  const user = req.query.User
  const messages = await db.messages.find().toArray()
  try {

  } catch (err) {
    console.log(err)
  }
  res.sendStatus(200)
});

app.post("/status", async (req, res) => {
  const user = req.headers;
  try {

  } catch (err) {
    console.log(err)
  }
  res.sendStatus(200);
});


app.listen(5000, () => console.log("Running in port: 5000"));
