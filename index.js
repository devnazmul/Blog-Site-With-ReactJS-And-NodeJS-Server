const express = require('express');
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayoaw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
app.use(cors());
app.use(express.json());
async function run() {
    try {
        // conntect to database
        await client.connect();
        console.log('connected to database successfully');
        const database = client.db('programming_stack');
        const userCollection = database.collection('user_collection');
        const postCollection = database.collection('post_collection');
        const commentCollection = database.collection('comment_collection');

        // load articles on UI with GET
        app.get('/posts', async (req, res) => {
            const cursor = postCollection.find({});
            const posts = await cursor.toArray();
            res.send(posts);
        });
        // load users on UI with GET
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        // post an article through POST API
        app.post('/posts', async (req, res) => {
            const post = req.body;
            const result = await postCollection.insertOne(post);
            res.json(result)
        });
        // post a comment through POST API
        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.json(result)
        });
        // Make an admin API
        app.put('/users/admin', async (req, res) => {
            const admin = req.body;
            console.log('put', admin);
            const filter = { email: admin.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Sending like to an article with UPDTAE API
        app.put('/posts/:id', async (req, res) => {
            const like = req.body;
            const updateDoc = { $set: { isLiked: 'liked' } };
            const result = await postCollection.updateOne(updateDoc);
            res.json(result);

        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Programming Stack!')
})

app.listen(port, () => {
    console.log(`listening the port :${port}`)
})