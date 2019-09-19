const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        // Wait for the db connection.
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            autoIndex: true
        });
        console.log("db connection is successful");
    } catch (err) {
        console.log(err);
        throw err;
    }
};

module.exports = connectDb;