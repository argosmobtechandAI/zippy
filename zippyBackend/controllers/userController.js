import express from 'express';
import { db } from "../db.js";
import { riderTable, trainerTable, userTable } from '../schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

export const getAllUsers = (req, res) => {
    try {
        const users = db.select().from(userTable);
        if (!users) {
            return res.status(404).json({ message: 'No users found', success: false });
        }
        return res.status(200).json({ users, message: 'Users fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};


export const getUser = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await db.select().from(userTable).where(eq(userTable.id, userId))
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ user: user[0], message: 'User fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const createUser = async (req, res) => {
    const { data } = req.body;

    const { name, mobile, email, dob, type, age, weight, parent_name, title, experience, emergency_contact, allergies, medical, level, instructions } = data
    try {
        const newUser = await db.insert(userTable).values({ name, mobile, type, email, dob, age, weight, parent_name, emergency_contact }).returning();
        if (!newUser) {
            return res.status(400).json({ message: 'Error creating user', success: false });
        }

        console.log(newUser[0].id)

        if (type === "rider") {
            const newRider = await db.insert(riderTable).values({ userId: newUser[0].id, allergies, medical, level, instructions })
            if (!newRider) {
                return res.status(400).json({ message: 'Error creating rider', success: false });
            }
        }

        if (type === "trainer") {
            const newTrainer = await db.insert(trainerTable).values({ userId: newUser[0].id, title, experience })
            if (!newTrainer) {
                return res.status(400).json({ message: 'Error creating trainer', success: false });
            }
        }

        return res.status(201).json({ user: newUser, message: 'User created successfully', success: true });
    } catch (error) {
        console.log(error, "error")
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const updateUser = (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    try {
        const updatedUser = db.update(userTable).set(data).where(eq(userTable.id, id)).returning();
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ user: updatedUser, message: 'User updated successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const deleteUser = (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = db.delete(userTable).where(eq(userTable.id, id)).returning();
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ user: deletedUser, message: 'User deleted successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const getOTP = async (req, res) => {
    const { data } = req.body;
    const { mobile } = data;
    try {
        const user = await db.select().from(userTable).where(eq(userTable.mobile, mobile));
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await db.update(userTable).set({ otp }).where(eq(userTable.mobile, mobile));
        return res.status(200).json({ otp, message: 'OTP generated successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const verifyOTP = async (req, res) => {
    const { data } = req.body;
    const { mobile, otp } = data;

    try {
        const user = await db.select().from(userTable).where(eq(userTable.mobile, mobile));

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (otp !== user[0].otp) {
            return res.status(400).json({ message: 'Invalid OTP', success: false });
        }

        const token = generateToken(user[0])

        console.log(token)

        return res.status(200).json({ message: 'OTP verified successfully', success: true, token });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};