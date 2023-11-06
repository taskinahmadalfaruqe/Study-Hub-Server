// ALL REQUIR PART
const express = require('express')
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cooke = require('cookie-parser');
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//CORS CONFIG FILE
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};


// MIDILEWARE 
app.use(express.json());
app.use(cors(corsConfig));
app.use(cooke());


// CURD OPERATION PART & CONNECT WITH MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.g4huqbt.mongodb.net/?retryWrites=true&w=majority`;

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
        // DATA BASE COLLECTION
        const allAssignmentCollection = client.db("studyHub").collection("assignment")

        // POST ALL DATA IN DATABASE 
        // POST A NEW ASSIGNMENT LINK : http://localhost:5000/newAssignment 
        app.post('/newAssignment', async (req, res) => {
            try {
                const newAssignment = req.body;
                const result = await allAssignmentCollection.insertOne(newAssignment)
                res.send(result)
            } catch (error) {
                res.send(error.message);
            }
        });
        // GET ALL ASSIGNMENT IN DATABASE
        // FIND ALL ASSIGNMENT LINK: http://localhost:5000/newAssignment 
        // GET ALL ASSIGNMENT BY DIFFICULTY LEVEL  IN DATABASE
        // FIND ALL ASSIGNMENT LINK: http://localhost:5000/newAssignment?diffeculty= easy/medium/hard
        app.get('/newAssignment', async (req, res) => {
            const quaryOBJ = {}
            const queryPeremeter = req.query.difficulty;
            if (queryPeremeter) {
                quaryOBJ.difficulty = queryPeremeter
            }
            const findAllAssignment = allAssignmentCollection.find(quaryOBJ);
            const allAssignmentArray = await findAllAssignment.toArray();
            res.send(allAssignmentArray)
        })
        // GET A ASSIGNMENT IN DATABASE
        // FIND ALL ASSIGNMENT LINK: http://localhost:5000/newAssignment/:id
        app.get('/newAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allAssignmentCollection.findOne(query);
            res.send(result)
        })
        // DELETE A ASSIGNMENT ONLY CREATOR CAN DELETE IT 
        // UPDATE DATA LINK: http://localhost:5000/newAssignment/:id
        app.delete("/newAssignment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allAssignmentCollection.deleteOne(query);
            res.send(result)
        })
        // UPDATE A ASSIGNMENT ONLY CREATOR CAN UPDATE IT 
        // UPDATE DATA LINK: http://localhost:5000/newAssignment/:id
        app.patch('/newAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const newProduct = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {
                    assignmentTitle:newProduct.assignmentTitle,
                    description:newProduct.description,
                    imageURL:newProduct.imageURL,
                    marks:newProduct.marks,
                    difficulty:newProduct.difficulty,
                    lastDateOfSubmition:newProduct.lastDateOfSubmition,
                },
            };
            const result = await allAssignmentCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("You Are Connected From StudyHub Server By");
    } finally {
    }
}
run().catch(console.dir);


// SERVER OPPENIG MESSAGE 
app.get('/', (req, res) => {
    res.send('Study Hub For Better Career')
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})