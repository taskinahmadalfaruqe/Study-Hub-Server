// ALL REQUIR PART
const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//CORS CONFIG FILE
const corsConfig = {
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};


// MIDILEWARE 
app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));


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
        const submitedAssignmentCollection = client.db("studyHub").collection("submitedAssignment")

        const getman = (req, res, next) => {
            const accessToken = req.cookies;
            if (!accessToken) {
                return res.send({ message: "You Are Unauthorize no token Given" })
            }
            jwt.verify(accessToken, process.env.DB_ACCESS_SECRET, function (err, decoded) {
                if (err) {
                    return res.send({ message: "You Are Unauthorize From err" })
                }
                console.log(decoded)
                next();
            });
        };

        app.post('/access-token', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.DB_ACCESS_SECRET, { expiresIn: '1h' });
            res.cookie('accessToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
            }).send({ success: true });
        });

        // ALL ASSIGNMENT COLLECTION START 

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
        // FIND ALL ASSIGNMENT LINK: http://localhost:5000/newAssignment?page=1&limit=6
        app.get('/newAssignment', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const difficulty = req.query.difficulty;

            const skip = (page - 1) * limit;

            const query = difficulty ? allAssignmentCollection.find({ difficulty }) : allAssignmentCollection.find({});

            const total = await query.count();
            const assignments = await query.skip(skip).limit(limit).toArray();
            res.send({
                assignments,
                total,
            });
        });


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
                    assignmentTitle: newProduct.assignmentTitle,
                    description: newProduct.description,
                    imageURL: newProduct.imageURL,
                    marks: newProduct.marks,
                    difficulty: newProduct.difficulty,
                    lastDateOfSubmition: newProduct.lastDateOfSubmition,
                },
            };
            const result = await allAssignmentCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })


        // SUBMITED ASSIGNMENT COLLECTION START 

        // POST A NEW SUBMIT ASSIGNMENT 
        // POST DATA LINK: http://localhost:5000/submitedAssignment
        // POST DATA LINK: https://study-hub-bice.vercel.app/submitedAssignment
        app.post("/submitedAssignment", async (req, res) => {
            try {
                const newSubmit = req.body;
                const result = await submitedAssignmentCollection.insertOne(newSubmit)
                res.send(result)
            } catch (error) {
                res.send(error.message);
            }
        })
        // GET SUBMIT ASSIGNMENT COLLECTION 
        // UPDATE DATA LINK: http://localhost:5000/submitedAssignment?user=singleuser
        // UPDATE DATA LINK: https://study-hub-bice.vercel.app/submitedAssignment?status=pending
        app.get('/submitedAssignment', async (req, res) => {
            const quaryOBJ = {};
            const userQuery = req.query.user;
            console.log("hellooasdfdhj", req.cookies.accessToken)

            if (userQuery) {
                const obj = quaryOBJ.submitBy = userQuery
            }
            const find = submitedAssignmentCollection.find(quaryOBJ);
            const result = await find.toArray();
            res.send(result)
        })

        // GET A LINK BY STATUS: http://localhost:5000/submitedAssignment/status?status=pending
        // UPDATE DATA LINK: https://study-hub-bice.vercel.app/submitedAssignment?status=pending
        app.get('/submitedAssignment/status', async (req, res) => {
            const quaryOBJ = {};
            const statusQuery = req.query.status;
            if (statusQuery) {
                quaryOBJ.status = statusQuery
            }
            const find = submitedAssignmentCollection.find(quaryOBJ);
            const result = await find.toArray();
            res.send(result)
        })

        // GET A SINGLE SUBMITION IN DATABASE
        // GET A SINGEL DATA LINK: https://study-hub-bice.vercel.app/submitedAssignment/:id
        app.get('/submitedAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await submitedAssignmentCollection.findOne(query);
            res.send(result)
        })

        // UPDATE SUBMITION DATA 
        // GET A SINGEL DATA LINK: https://study-hub-bice.vercel.app/submitedAssignment/:id
        app.patch('/submitedAssignment/:id', getman, async (req, res) => {
            const id = req.params.id;
            const newdata = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {
                    examinerName: newdata.examinerName,
                    giveMark: newdata.giveMark,
                    feedback: newdata.feedback,
                    assignmentTitle: newdata.assignmentTitle,
                    marks: newdata.marks,
                    note: newdata.note,
                    projectFile: newdata.projectFile,
                    submitBy: newdata.submitBy,
                    submitDate: newdata.submitDate,
                    status: 'conform',
                },
            };
            const result = await submitedAssignmentCollection.updateOne(filter, updateDoc, options);
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