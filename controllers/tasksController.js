const TaskModel = require("../models/taskModel");
const resPerPage = 20;

const addNewTask = async (req, res) => {
    //validate task model
    const task = new TaskModel();
    task.userId = req.user._id;
    const inputModel = req.body;

    task.title = inputModel.title;
    task.description = inputModel.description;
    task.tags = inputModel.tags;
    if (inputModel.completedAt === true) {
        task.completedAt = Date.now().toString();
    }
    var error = task.validateSync();
    if (error) {
        return res.status(400).send(error.errors);
    }
    try {
        doc = await task.save();
        doc = await TaskModel.findById(doc._id);
        return res.send(doc);
    } catch (err) {
        console.log("Error saving task document!", err);
        return res.status(500).send("Error saving task document!");
    }
};

const getTasks = async (req, res) => {
    var taskQuery = {};
    //build mongoose query 
    taskQuery.page = parseInt(req.query.page) || 1;
    const filters = {
        userId: req.user._id,
        isDeleted: false
    };
    var query = TaskModel.find(filters);
    if (req.query.fromdate) {
        var date = new Date(req.query.fromdate);
        if (date.toString() === "Invalid Date") {
            return res.status(400).send("Invalid query parameter: fromdate");
        }
        query.where("createdAt").gte(date);
    }
    if (req.query.todate) {
        var date = new Date(req.query.todate);
        if (date.toString() === "Invalid Date") {
            return res.status(400).send("Invalid query parameter: todate");
        }
        query.where("createdAt").lte(date);
    }
    if (req.query.completed !== undefined) {
        query.where("completedAt").exists(true);
    }
    if (req.query.incompleted !== undefined) {
        query.where("completedAt").exists(false);
    }
    if (req.query.tags) {
        var tags = req.query.tags.split(';');
        tags.forEach(element => {
            query.where("tags").in([element.toLowerCase()]);
        });
    }
    if (req.query.oldest !== undefined) {
        query.sort("createdAt");
    }
    else {
        query.sort("-createdAt");
    }
    taskQuery.query = query;

    if (req.query.search) {
        var docs = await query;
        var keys = req.query.search.split(';')
            .map(key => key.toLowerCase())
        const searchResult = [];
        docs.forEach(doc => {
            for (let key of keys) {
                if ((doc.tags && doc.tags.includes(key))
                    || (doc.title.toLowerCase().includes(key))
                    || (doc.description && doc.description.includes(key))) {
                    searchResult.push(doc);
                    return;
                }
            }
        });
        var start = (resPerPage * (taskQuery.page - 1));
        var end = start + resPerPage;
        taskQuery.queryResult = searchResult.slice(start, end);
    }
    else {
        try {
            taskQuery.queryResult = await taskQuery.query
                .skip((resPerPage * (taskQuery.page - 1)))
                .limit(resPerPage);
        } catch (err) {
            console.log("Error querying tasks!", err);
            return res.status(500).send("Error querying tasks!");
        }
    }
    return res.status(200).send({
        page: taskQuery.page,
        resPerPage: resPerPage,
        tasks: taskQuery.queryResult
    });
};

const getTaskById = async (req, res) => {
    const id = req.params.id;
    try {
        task = await TaskModel.findNotDeleted(id);
        if (!task) {
            return res.status(404).send();
        }
        return res.send(task);
    } catch (err) {
        console.log("Error getting task:", err);
        return res.status(500).send("Error getting task!");
    }
};

const updateTask = async (req, res) => {
    const inputModel = req.body;
    var task = null;
    try {
        task = await TaskModel.findNotDeleted(inputModel._id);
        if (!task) {
            return res.status(404).send();
        }
    } catch (err) {
        console.log("Error getting task:", err);
        return res.status(500).send("Error getting task!");
    }
    task.title = inputModel.title;
    task.description = inputModel.description;
    task.tags = inputModel.tags;
    if (inputModel.completedAt === true) {
        if (!task.completedAt)
            task.completedAt = Date.now().toString();
    }
    else task.completedAt = undefined;
    var error = task.validateSync();
    if (error) {
        return res.status(400).send(error.errors);
    }
    try {
        doc = await task.save();
        doc = await TaskModel.findById(doc._id);
        return res.send(doc);
    } catch (err) {
        console.log("Error saving task!", err);
        return res.status(500).send("Error saving task!");
    }
};

const deleteTask = async (req, res) => {
    const id = req.params.id;
    var task = null;
    try {
        task = await TaskModel.findNotDeleted(id);
        if (!task) {
            return res.status(404).send();
        }
    } catch (err) {
        console.log("Error getting task:", err);
        return res.status(500).send("Error getting task!");
    }
    task.isDeleted = true;
    try {
        task = await task.save();
        if (!task.isDeleted) {
            throw new Error("Can not update field : isDeleted");
        }
        task = await TaskModel.findById(task._id);
        return res.send(task);
    } catch (err) {
        console.log("Error deleting task!", err);
        return res.status(500).send("Error deleting task!");
    }
};

const router = require('express').Router();

router.route("/")
    .get(getTasks)
    .post(addNewTask)
    .put(updateTask);

router.route("/:id")
    .get(getTaskById)
    .delete(deleteTask);

module.exports = router;


