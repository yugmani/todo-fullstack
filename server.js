const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const PORT = 2121;
require("dotenv").config();

let db,
  dbConnectionStr =
    process.env.DB_STRING ||
    "mongodb+srv://demo:demo@cluster0.zk0ky.mongodb.net/todo?retryWrites=true&w=majority";
dbName = "todo";

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
  .then((client) => {
    console.log(`You have connection to ${dbName} database`);
    db = client.db(dbName);
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  const todoItems = await db.collection("todos").find().toArray();

  const itemsLeft = await db
    .collection("todos")
    .countDocuments({ completed: false });

  res.render("index.ejs", { listOfTodos: todoItems, left: itemsLeft });

  //   db.collection("todos")
  //     .find()
  //     .toArray()
  //     .then((data) => {
  //       db.collection("todos")
  //         .countDocuments({ completed: false })
  //         .then((itemsLeft) => {
  //           res.render("index.ejs", { listOfTodos: data, left: itemsLeft });
  //         });
  //     });
});

app.post("/createTodo", (req, res) => {
  // console.log(req.body.todoItem);
  db.collection("todos")
    .insertOne({
      todo: req.body.todoItem,
      completed: false,
    })
    .then((result) => {
      // console.log("Todo has been added!");
      res.redirect("/");
    });
});

app.delete("/deleteTodo", (req, res) => {
  // console.log(req.body.rainbowUnicorn);
  db.collection("todos")
    .deleteOne({ todo: req.body.rainbowUnicorn })
    .then((result) => {
      // console.log("Deleted Todo");
      res.json("Deleted It");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.put("/markComplete", (req, res) => {
  db.collection("todos")
    .updateOne(
      { todo: req.body.rainbowUnicorn },
      {
        $set: {
          completed: true,
        },
      }
    )
    .then((result) => {
      // console.log("completed Todo");
      res.json("Marked Complete");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.put("/undo", (req, res) => {
  db.collection("todos")
    .updateOne(
      { todo: req.body.rainbowUnicorn },
      {
        $set: {
          completed: false,
        },
      }
    )
    .then((result) => {
      // console.log("completed undo");
      res.json("Marked not completed");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(PORT, () => {
  console.log(`Server is running in the port ${PORT}`);
});
