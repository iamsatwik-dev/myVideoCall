import {createServer} from "node:http"
import {Server} from "socket.io"
import mongoose from "mongoose"
import cors from "cors"
import express from "express"
import {connectToSocket} from "./src/controllers/socketmanager.js"
import router from "./src/routes/usersroutes.js"
// import User from "./src/models/userModel.js"
const app = express();
const server = createServer(app)
const io= connectToSocket(server)
const port =8080;
app.set("port",(process.env.port || 8080))
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.urlencoded({limit:"40kb" ,extended:"true"}))
app.use(express.json({limit:"40kb"}))
app.use("/api/v1/user",router);
app.use("/api/v2/user",router)

server.listen(port,(req,res)=>{
    app.set("mongo-user")
    const mongodb = mongoose.connect("mongodb+srv://satwikgupta0210:MHIkMqz8e119jhOd@zoom.97xu8.mongodb.net/?retryWrites=true&w=majority&appName=zoom")
    console.log("Db is connected")
   console.log(`port is listening on the ${port}`)
})
