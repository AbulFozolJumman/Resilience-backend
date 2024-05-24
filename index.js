const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ztfqf2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // DB collections
    const suppliesCollection = client.db("ResilienceDB").collection("supplies");

    // Supplies CRUD
    // Get all Supplies
    app.get("/supplies", async (req, res) => {
      const allSupplies = await suppliesCollection.find().toArray();
      res.send(allSupplies);
    });

    // Get supply by ID
    app.get("/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const supply = await suppliesCollection.findOne(query);
      res.send(supply);
    });

    // Add a supply
    app.post("/supplies", async (req, res) => {
      const addedSupply = req.body;
      const result = await suppliesCollection.insertOne(addedSupply);
      res.send(result);
    });

    // Update supply by Id
    app.put("/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const updatedSupply = req.body;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await suppliesCollection.updateOne(query, {
          $set: updatedSupply,
        });
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Supply not found" });
        }
        res.json(result);
      } catch (error) {
        console.error("Error updating supply:", error);
        res
          .status(500)
          .json({ error: "Internal server error", message: error.message });
      }
    });

    // Delete supply by Id
    app.delete("/supplies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await suppliesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Resilience backend is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
