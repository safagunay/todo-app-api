const express = require('express');
const app = express();

const models = require("./server");
const TaskModel = models.taskModel;
const UserModel = models.userModel;

app.get("/", (req, res) => {
    TaskModel.find().then(data => res.send(data));
})

app.use(express.json());
app.post("/", (req, res) => {
    console.log(req.body);
    res.send();
})

app.listen(3000);