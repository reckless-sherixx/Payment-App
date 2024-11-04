const express = require('express')
const userRouter = require("./userRouter")
const accRouter = require("./account")
const Router = express.Router();

Router.use("/user" , userRouter)
Router.use("/account", accRouter)

module.exports= Router;