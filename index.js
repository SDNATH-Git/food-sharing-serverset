require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y7n1te0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// JWT Middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).send({ message: "Unauthorized access. Token missing." });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).send({ message: "Forbidden. Invalid or expired token." });
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    // await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("foodSharingDB");
    const foodCollection = db.collection("foods");
    const requestCollection = db.collection("requests");

    // Root Route
    app.get("/", (req, res) => {
      res.send("🍽️ Food Sharing API with JWT Running...");
    });

    // JWT Token Generator
    app.post("/jwt", (req, res) => {
      const user = req.body; // Expected: { email: userEmail }
      if (!user.email) {
        return res.status(400).send({ message: "Email is required to generate token." });
      }
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.send({ token });
    });

    // Add Food
    app.post("/foods", verifyJWT, async (req, res) => {
      const food = req.body;
      if (!food.donorEmail) {
        return res.status(400).send({ message: "Donor email is required." });
      }
      const result = await foodCollection.insertOne(food);
      res.send(result);
    });

    // Get All Foods (optional filtering)
    app.get("/foods", async (req, res) => {
      const { status, email } = req.query;
      let query = {};

      if (status) query.status = status;
      if (email) query.donorEmail = email;

      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    // Get Single Food by ID
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ message: "Invalid food ID." });

      const result = await foodCollection.findOne({ _id: new ObjectId(id) });
      if (!result) return res.status(404).send({ message: "Food not found." });
      res.send(result);
    });

    // Update Food
    app.patch("/foods/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ message: "Invalid food ID." });

      const updated = req.body;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    // Delete Food
    app.delete("/foods/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ message: "Invalid food ID." });

      const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Make a Food Request
    app.post("/requests", verifyJWT, async (req, res) => {
      const request = req.body;
      if (!request.userEmail) {
        return res.status(400).send({ message: "User email is required." });
      }
      const result = await requestCollection.insertOne(request);
      res.send(result);
    });

    // Get My Requested Foods (Private)
    app.get("/requests", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (!email || email !== decodedEmail) {
        return res.status(403).send({ message: "Forbidden: Email mismatch." });
      }

      const requests = await requestCollection.find({ userEmail: email }).toArray();
      res.send(requests);
    });

    // (Optional) Admin: Get all requests
    app.get("/all-requests", verifyJWT, async (req, res) => {
      // TODO: Add admin role verification here
      const all = await requestCollection.find().toArray();
      res.send(all);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Server with JWT running at http://localhost:${port}`);
});
