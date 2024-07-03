import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${mongoUsername}:${mongoPassword}@budgettracker.nudeprd.mongodb.net/yourDatabaseName?retryWrites=true&w=majority`;

// Debugging: Log the MongoDB URI to verify it is constructed correctly
console.log("MongoDB URI:", uri);

mongoose
  .connect(uri)
  .then(() => console.log("Connected to the server"))
  .catch((err) => console.log("Failed to connect to the server", err));

const recordSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  paymentType: { type: String, required: true },
  userID: { type: String, required: true },
});

const Record = mongoose.model("Record", recordSchema);

app.post("/records", async (req, res) => {
  try {
    const newRecord = new Record(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/recordByUserID/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const records = await Record.find({ userID: userID });
    res.status(200).json(records);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.put("/records/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedRecord = await Record.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedRecord) return res.status(404).send();
    res.status(200).send(updatedRecord);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/records/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const record = await Record.findByIdAndDelete(id);

    if (!record) return res.status(404).send();
    res.status(200).send(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
