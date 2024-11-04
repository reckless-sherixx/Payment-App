const express = require('express');
const mongoose = require("mongoose")
const Router = express.Router();
const {Account} = require("../db")
const {authMiddleware} = require("../middleware")

const app = express();

Router.get("/balance" , authMiddleware , async(req,res)=>{
    const account = await Account.findOne({
        userId:req.userId
    });
    res.status(200).json({
        balance:account.balance
    })
})
Router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { amount, to } = req.body;

    if (amount <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Transfer amount must be greater than zero"
        });
    }

    const account = await Account.findOne({
        userId: req.userId
    }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid Account"
        });
    }

    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successful"
    });
});


module.exports= Router;