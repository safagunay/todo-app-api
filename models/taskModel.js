const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tagsValidator = {
    validator: v => {
        if (!(v instanceof Array)) {
            throw new Error("tags field must be an array");
        }
        if (v.length > 50) {
            throw new Error("single task can not have more than 50 tags");
        }
        for (item of v) {
            if (item.length > 50) {
                throw new Error("single tag must not be longer than 50 characters");
            }
        }
    }
}
const dateValidator = {
    validator: v => v.toString() !== "Invalid Date",
    message: "Invalid date format"
}
const taskSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "title field is required"],
            minlength: [1, "title must not be empty"],
            maxlength: [50, "title must not be longer than 50 characters"]
        },
        description: {
            type: String,
            trim: true,
            default: undefined,
            maxlength: [200, "description must not be longer than 200 characters"]
        },
        createdAt: {
            type: Date,
            default: Date.now,
            validate: dateValidator
        },
        completedAt: {
            type: Date,
            default: undefined,
            validate: dateValidator
        },
        tags: {
            type: [String],
            default: undefined,
            validate: tagsValidator
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: [true],
            select: false,
            // create index for userId
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    { versionKey: false }
);

taskSchema.pre("save", function (next) {
    if (this.tags !== undefined) {
        this.tags.forEach((el, i, arr) => {
            arr[i] = el.trim().toLowerCase();
        });
        this.tags = Array.from(new Set(this.tags));
    }
    next();
});

taskSchema.statics.findNotDeleted = function (id) {
    if (id) return this.findOne({ _id: id, isDeleted: false });
    else return this.find({ isDeleted: false });
};

const TaskModel = mongoose.model("task", taskSchema);

module.exports = TaskModel;
