require('dotenv').config();
const app = require("./app");
const connectDb = require("./db");
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // connect db.
        await connectDb()
        //Start the server.
        server.listen(port, () => console.log(`The app is running on port : ${port}`));
    } catch (err) {
        console.log(err);
    }
};
startServer();