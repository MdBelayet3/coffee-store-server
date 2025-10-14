const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// mongodb code
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i1okxyw.mongodb.net/<dbname>?retryWrites=true&w=majority
`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // database collection
        const coffeeCollection = client.db("coffeeDB").collection("coffee")
        const usersCollection = client.db("coffeeDB").collection("users")

        // coffee apis
        // get api for read data
        app.get("/coffee", async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // get api for update a specific data
        app.get("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        // post api for send data client to server to database
        app.post("/coffee", async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        // put api for update data from client to server and database
        app.put("/coffee/:id", async(req, res) => {
            const id = req.params.id;
            const updateCoffee = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const coffee = {
                $set: {
                    name: updateCoffee.name,
                    price: updateCoffee.price,
                    supplier: updateCoffee.supplier,
                    taste: updateCoffee.taste,
                    category: updateCoffee.category,
                    details: updateCoffee.details,
                    photo: updateCoffee.photo,
                },
            }
            const result = await coffeeCollection.updateOne(filter,coffee,options)
            res.send(result);
        })

        // delete api for delete data from database
        app.delete("/coffee/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })


        // user apis
        // get api 
        app.get("/users", async(req, res) =>{
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // post api for creating new user
        app.post("/users", async(req, res) =>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// get API
app.get("/", (req, res) => {
    res.send("Coffee making server is running")
})

// app listen
app.listen(port, () => {
    console.log("Server is running on Port:", port)
})
