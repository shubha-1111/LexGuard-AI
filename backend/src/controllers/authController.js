const User = require("../models/User");
const { logAction } = require("../utils/logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../utils/validationSchemas");

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
    );
};

// ================= REGISTER =================
exports.register = async (req, res, next) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 12);

        const user = await User.create({
            ...validatedData,
            password: hashedPassword
        });

        await logAction({
            user,
            action: "REGISTER_SUCCESS",
            resourceType: "USER",
            resourceId: user._id,
            req,
            status: "SUCCESS"
        });

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        next(error);
    }
};

// ================= LOGIN =================
exports.login = async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await User.findOne({ email: validatedData.email });

        // If user not found
        if (!user) {
            await logAction({
                action: "LOGIN_ATTEMPT",
                resourceType: "USER",
                req,
                status: "FAILURE",
                details: "Invalid email"
            });

            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Account lock check
        if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
            await logAction({
                user,
                action: "LOGIN_BLOCKED",
                resourceType: "USER",
                resourceId: user._id,
                req,
                status: "FAILURE",
                details: "Account locked"
            });

            return res.status(403).json({
                message: "Account temporarily locked"
            });
        }

        const isMatch = await bcrypt.compare(validatedData.password, user.password);

        if (!isMatch) {
            user.failedLoginAttempts += 1;

            if (user.failedLoginAttempts >= 5) {
                user.accountLockedUntil = Date.now() + 15 * 60 * 1000;
                user.failedLoginAttempts = 0;
            }

            await user.save();

            await logAction({
                user,
                action: "LOGIN_ATTEMPT",
                resourceType: "USER",
                resourceId: user._id,
                req,
                status: "FAILURE",
                details: "Incorrect password"
            });

            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Reset counters
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;
        await user.save();

        const token = generateToken(user);

        await logAction({
            user,
            action: "LOGIN_SUCCESS",
            resourceType: "USER",
            resourceId: user._id,
            req,
            status: "SUCCESS"
        });

        res.status(200).json({ token });

    } catch (error) {
        next(error);
    }
};