const UserModel = require("../models/userModel");

const router = require('express').Router();

//authorize user
//admin manages users
router.use(async (req, res, next) => {
    if (!req.user.roles || !req.user.roles.includes("admin")) {
        return res.status(401).send();
    }
    next();
});

const getUsers = async (req, res) => {
    return res.send(await UserModel.findNotDeleted());
}

const addNewUser = async (req, res) => {
    var user = new UserModel();
    var inputModel = req.body;
    if (inputModel.roles) {
        user.roles = inputModel.roles;
    }
    user = await user.save();
    res.send(await UserModel.findById(user._id));
}

const updateUser = async (req, res) => {
    var inputModel = req.body;
    var user = await UserModel.findNotDeleted(inputModel._id);
    console.log(user);
    if (user) {
        user.roles = inputModel.roles;
        user = await user.save();
        res.send(await UserModel.findById(user._id));
    }
    else return res.status(404).send("User not found");
}

const deleteUser = async (req, res) => {
    var id = req.params.id;
    var user = await UserModel.findNotDeleted(id);
    if (user) {
        user.isDeleted = true;
        user = await user.save();
        res.send(await UserModel.findById(user._id));
    }
    else return res.status(404).send("User not found");
}

router.route("/")
    .get(getUsers)
    .post(addNewUser)
    .put(updateUser);

router.route("/:id")
    .delete(deleteUser);

module.exports = router;


