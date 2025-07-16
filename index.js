require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y7n1te0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Run the server
async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("foodSharingDB");
    const foodCollection = db.collection("foods");

    // -----------------------------------
    // ✅ ROUTES
    // -----------------------------------

    // Base route
    app.get("/", (req, res) => {
      res.send("🍽️ Food Sharing API Running...");
    });

    // ✅ Add Food
    app.post("/foods", async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // ✅ Get All Foods (optional filter: ?status=available)
    app.get("/foods", async (req, res) => {
      const { status } = req.query;
      let query = {};
      if (status) {
        query.status = status;
      }
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    // ✅ Get Food by ID
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ✅ (Optional) Update Food Status
    app.patch("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      res.send(result);
    });

    // ✅ (Optional) Delete Food
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // -----------------------------------
  } catch (error) {
    console.error("❌ Error connecting to MongoDB", error);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Food Sharing App server listening on port ${port}`);
});
