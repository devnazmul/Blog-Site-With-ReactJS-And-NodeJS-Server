const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const moment = require("moment");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@cluster0.gu8bj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const PORT = process.env.PORT || 5000;

const run = async () => {

  try {

    await client.connect();
    console.log("mongoDB connected...");
    const db = client.db("Blog-Site-By-React");
    const postsCollection = db.collection("posts");
    const usersCollection = db.collection("users");
    const commentsCollection = db.collection("comments");


    // ############## TESTING LIVE SERVER ###############
    app.get("/", (req, res) => {
      res.send("Server Is Running  ... ...");
    });

    // ########### GET OPERATION FOR POSTS #############
    app.get("/posts/:email", async (req, res) => {
      const userEmail = req.params.email;
      const cursor = postsCollection.find({
        email: userEmail
      });
      const posts = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        posts,
      });
    });


    // ########### GET OPERATION FOR USERS ##############
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        users,
      });
    });

    // ########### GET OPERATION FOR POSTS FILTER ##############
    app.get("/posts/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = postsCollection.find({
        email: email
      });
      const posts = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        posts,
      });
    });
    // ########### GET OPERATION FOR POSTS ##############
    app.get("/posts", async (req, res) => {
      const cursor = postsCollection.find({
        // postId: ''
      });
      const posts = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        posts,
      });
    });

    // ######### GET OPERATION WITH FILTER FOR PLANTS #####
    app.get("/post/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const plant = await postsCollection.findOne(query);
      res.send(plant);
    });

    // ######### GET OPERATION WITH FILTER FOR USERS #####
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await usersCollection.findOne(query);
      res.send(users);
    });

    // ######### GET OPERATION WITH FILTER FOR CHECKING USERS ADMIN OR NOT #####
    app.get("/users/isAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await usersCollection.findOne(query);
      let isAdmin = false;
      if (users?.role === 'admin') {
        isAdmin = true
      }
      res.json({ admin: isAdmin });
    });

    // ############ GET OPERATION FOR COMMENTS ###########
    app.get("/comments", async (req, res) => {
      const cursor = commentsCollection.find({});
      const comments = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        comments,
      })
    });

    // ############## CREATE OPERATION FOR USERS #########
    app.post("/users", async (req, res) => {
      const data = req.body;
      const insertResult = await usersCollection.insertOne(data);
      res.send(insertResult);
    });


    // ############ CREATE OPERATION FOR POST ###########
    app.post("/post", async (req, res) => {
      const data = req.body;
      data.likes = parseInt(data.likes)
      const insertResult = await postsCollection.insertOne(data);
      res.send(insertResult);
    });

    // ############ CREATE OPERATION FOR COMMENT ###########
    app.post("/comment", async (req, res) => {
      const data = req.body;
      const id = ObjectId();
      data._id = id;
      data.parentId = ''
      data.postId = ObjectId(data.postId)
      data.timestamp = moment(new Date).format('DD/MM/YYYY, h:mm:ss a');
      const insertResult = await commentsCollection.insertOne(data);
      res.send(insertResult);
    });


    // ############## PUT OR UPDATE FOR USERS ############
    app.put("/users", async (req, res) => {
      const data = req.body;
      const filter = { email: data.email };
      const updateDoc = { $set: data };
      const options = { upsert: true };
      const insertResult = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(insertResult);
    });
    // ############## UPDATE ROLE FOR USERS ############
    app.put("/user/admin", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });



    // ############# UPDATE ORDER STATUS DONE #################
    app.put("/postLike/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body.postData;
      const data2 = req.body.userEmail;

      let increaseLike = data.likes + 1;
      let dicreaseLike = data.likes - 1;

      const query1 = { _id: ObjectId(id), likedUEmail: { $in: [data2] } };
      const query2 = { _id: ObjectId(id) };

      const ress = await postsCollection.findOne(query1)


      const options = { upsert: true };
      if (ress !== null) {

        let updatedLikedUEmail = ress.likedUEmail;
        updatedLikedUEmail = updatedLikedUEmail.filter(element => element !== data2);

        const updateDoc = {
          $set: {
            likedUEmail: updatedLikedUEmail,
            likes: dicreaseLike
          },
        };
        const posts = await postsCollection.updateOne(query2, updateDoc, options);
        res.send(posts);
      } else {

        if (data.likedUEmail === undefined) {
          data.likedUEmail = [];
          data.likedUEmail.push(data2);
          const updateDoc = {
            $set: {
              likedUEmail: data.likedUEmail,
              likes: increaseLike
            },
          };

          const posts = await postsCollection.updateOne(query2, updateDoc, options);
          res.send(posts);
        } else {
          data.likedUEmail.push(data2);
          const updateDoc = {
            $set: {
              likedUEmail: data.likedUEmail,
              likes: increaseLike
            },
          };

          const posts = await postsCollection.updateOne(query2, updateDoc, options);
          res.send(posts);
        }
      }
    });


    // ######## DELETE OPERATION FOR COMMENT ########
    app.delete("/comment/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const newComment = commentsCollection.deleteOne(query);
      res.send(newComment);
    });
    // ######## DELETE OPERATION FOR POST ########
    app.delete("/post/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const newPost = postsCollection.deleteOne(query);
      res.send(newPost);
    });


  } finally {
    // await client.close();
  }
};

run().catch((err) => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server start on: http://localhost:${PORT}`);
});
