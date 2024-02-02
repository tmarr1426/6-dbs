// Importing and using dotenv
require("dotenv").config();

// Importing the express library
const express = require("express");

// Storing the function call of "express" in a variable
const app = express();

app.use(express.json());

// Importing mongo client from library
const { MongoClient, ObjectId } = require("mongodb");

const PORT = process.env.PORT;

let client = new MongoClient(process.env.MONGO_DB_URL);

async function dbConnect() {
  try {
    // connecting to the db server
    await client.connect();
    // creates variable to hold database tables
    let db = await client.db("mongoclient");
    // creates variable to hold specific collection within database
    let collection = await db.collection("users");
    return collection;
  } catch (err) {
    console.log(err);
  }
}

app.post("/create", async (req, res) => {
  try {
    let newUser = req.body;
    let userColl = await dbConnect();
    await userColl.insertOne(newUser);

    res.status(200).json({
      Created: newUser,
      Status: "Success",
    });
  } catch (err) {
    res.status(500).json({
      Error: err,
    });
  }
});

app.get("/userdata", async (req, res) => {
  try {
    let userColl = await dbConnect();
    let results = [];

    let userList = await userColl.find();

    // await userList.forEach((userObj) => {
    //   results.push(userObj);
    // });

    for await (let userObj of userList) {
      results.push(userObj);
    }

    res.status(200).json({
      Results: results,
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/userdata/:id", async (req, res) => {
  try {
    let userColl = await dbConnect();
    let results = [];

    let userList = userColl.find({ _id: new ObjectId(req.params.id) });

    for await (item of userList) {
      results.push(item);
    }

    res.status(200).json({
      Found: results,
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.delete("/userdata/delete/:id", async (req, res) => {
  try {
    let userColl = await dbConnect();

    userColl.deleteOne({ _id: new ObjectId(req.params.id) });

    res.status(200).json({
      Delete: "Success",
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.put("/userdata/update/:id", async (req, res) => {
  try {
    let userColl = await dbConnect();

    userColl.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          _id: new ObjectId(req.params.id),
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
      }
    );
    res.status(200).json({
        Update: "Success",
      });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is connected on port ${PORT}`);
});
