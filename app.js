//require modules
const express = require('express');
const UserModel = require("./models/userModel");
const session = require("express-session");
const tasksController = require("./controllers/tasksController");
const usersController = require("./controllers/usersController");
const cors = require("cors");

// create app
const app = express();
app.use(express.json());
//allow cors
app.use(cors());
//use sessions to authenticate faster
app.use(session({
    secret: 'safagunay96',
    cookie: { maxAge: 60000 },
    resave: false, saveUninitialized: false
}));

//authenticate user and populate req.user
app.use(async (req, res, next) => {
    if (req.session.user) {
        console.log("User loaded from session.");
        req.user = req.session.user;
        next();
    }
    else {
        const userId = req.header('userId');
        if (!userId) {
            return res.status(400).send("Header userId must be included!");
        }
        var user = null;
        try {
            user = await UserModel.findOne({ _id: userId, isDeleted: false });
        } catch (err) {
            console.log("Error querying users!");
            console.log(err);
            return res.status(500).send();
        }
        if (!user) {
            return res.status(401).send();
        }
        req.session.user = user;
        req.user = user;
        next();
    }

});

//register routes
app.use("/tasks", tasksController);
app.use("/users", usersController);

//catch errors
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err.message);
})

module.exports = app;

