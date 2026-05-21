import {createServer} from "node:http"
import {Server} from "socket.io"
import mongoose from "mongoose"
import cors from "cors"
import express from "express"
import {connectToSocket} from "./src/controllers/socketmanager.js"
import router from "./src/routes/usersroutes.js"

const app = express();
const server = createServer(app)
const io = connectToSocket(server)
const port = process.env.PORT || 8080;

app.set("port", port);
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.urlencoded({limit:"40kb" ,extended:"true"}))
app.use(express.json({limit:"40kb"}))
app.use("/api/v1/user",router);
app.use("/api/v2/user",router)

const startServer = async () => {
    const mongoURI = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/videoCall";
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB is connected successfully to: " + mongoURI);
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        console.log("Running server in offline/local-only mode.");
    }

    server.listen(port, () => {
        console.log(`Port is listening on: http://localhost:${port}`);
    });
};

startServer();
