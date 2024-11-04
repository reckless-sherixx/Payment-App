const express = require('express');
const bcrypt = require("bcrypt");
const router = express.Router();
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { User, Account } = require("../db");
const { authMiddleware } = require("../middleware");

const signupBody = z.object({
    username: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
});

const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
});

router.post("/signup", async (req, res) => {
    const { success, error } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already taken"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 5);
        const user = await User.create({
            username: req.body.username,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });

        const userId = user._id;
        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });

        const token = jwt.sign({ userId }, JWT_SECRET);
        res.json({
            message: "User created successfully",
            token: token
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/signin", async (req, res) => {
    const { success, error } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    try {
        const user = await User.findOne({ username: req.body.username });
        if (user) {
            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({ userId: user._id }, JWT_SECRET);
                return res.json({ token: token });
            }
        }
        res.status(401).json({
            message: "Invalid username or password"
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
    const { success, error } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Invalid input data"
        });
    }

    try {
        await User.updateOne({ _id: req.userId }, req.body);
        res.json({
            message: "Updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;