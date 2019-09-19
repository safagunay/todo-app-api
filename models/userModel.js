const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        roles: {
            type: [String],
            default: undefined
        }
    },
    { versionKey: false })

userSchema.statics.findNotDeleted = function (id) {
    if (id) return this.findOne({ _id: id, isDeleted: false });
    else return this.find({ isDeleted: false });
};
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;