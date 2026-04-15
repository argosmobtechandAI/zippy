import express from 'express';
import { db } from "../db.js";
import { riderTable, trainerTable, userTable, vetTable, sessionTable } from '../schema.js';
import { eq, sql, or } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

let bcrypt;
try {
    bcrypt = await import('bcryptjs');
    if (bcrypt.default) bcrypt = bcrypt.default;
} catch (e) {
    console.error("BCRYPTJS NOT FOUND: Run 'npm install' in zippyBackend to enable login functionality.");
}

dotenv.config();

const generateToken = (user) => {
    const token = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await db.select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            mobile: userTable.mobile,
            type: userTable.type,
            dob: userTable.dob,
            age: userTable.age,
            weight: userTable.weight,
            parentName: userTable.parentName,
            emergencyContact: userTable.emergencyContact,
            createdAt: userTable.createdAt,
            status: userTable.status,
            trainerId: trainerTable.id,
            riderId: riderTable.id,
            vetId: vetTable.id
        })
        .from(userTable)
        .leftJoin(trainerTable, eq(userTable.id, trainerTable.userId))
        .leftJoin(riderTable, eq(userTable.id, riderTable.userId))
        .leftJoin(vetTable, eq(userTable.id, vetTable.userId));

        // Data Self-Healing Logic: Ensure all relevant users have role-specific records
        let healed = false;
        try {
            for (const user of users) {
                // Heal Trainer
                if (user.type === 'trainer' && !user.trainerId) {
                    try {
                        const res = await db.insert(trainerTable).values({ userId: user.id, title: "Trainer", experience: "N/A" }).returning();
                        if (res && res.length > 0) { user.trainerId = res[0].id; healed = true; }
                    } catch (e) { console.error(`Failed to heal trainer ${user.id}:`, e.message); }
                }
                // Heal Rider
                if (user.type === 'rider' && !user.riderId) {
                    try {
                        const res = await db.insert(riderTable).values({ userId: user.id, level: "BEGINNER" }).returning();
                        if (res && res.length > 0) { user.riderId = res[0].id; healed = true; }
                    } catch (e) { console.error(`Failed to heal rider ${user.id}:`, e.message); }
                }
                // Heal Vet
                if (user.type === 'vet' && !user.vetId) {
                    try {
                        const res = await db.insert(vetTable).values({ userId: user.id }).returning();
                        if (res && res.length > 0) { user.vetId = res[0].id; healed = true; }
                    } catch (e) { console.error(`Failed to heal vet ${user.id}:`, e.message); }
                }
            }
        } catch (globalHealError) {
            console.error("Critical heal loop failure:", globalHealError.message);
        }

        // Live Aggregation for Trainers
        try {
            const sessions = await db.select().from(sessionTable);
            const now = new Date();
            const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
            const startOfMonth = new Date(); startOfMonth.setDate(1);
            
            users.forEach(u => {
                if (u.type === 'trainer') {
                    const trainerSessions = sessions.filter(s => s.trainerId === u.trainerId);
                    u.sessionsMTD = trainerSessions.filter(s => new Date(s.date) >= startOfMonth).length;
                    u.weeklyLoad = trainerSessions.filter(s => new Date(s.date) >= oneWeekAgo).length;
                    u.rating = 5.0; // Placeholder until reviews table is established
                }
            });
        } catch (aggError) {
            console.error("Aggregation failure:", aggError.message);
        }

        if (!users) {
            return res.status(404).json({ message: 'No users found', success: false });
        }
        return res.status(200).json({ users, message: healed ? 'Users fetched and healed' : 'Users fetched successfully', success: true });
    } catch (error) {
        console.error("CRITICAL ERROR IN GET_ALL_USERS:", error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};


export const getUser = async (req, res) => {
    const userId = req.userId;
    try {
        const result = await db.select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            mobile: userTable.mobile,
            type: userTable.type,
            dob: userTable.dob,
            age: userTable.age,
            weight: userTable.weight,
            parentName: userTable.parentName,
            emergencyContact: userTable.emergencyContact,
            createdAt: userTable.createdAt,
            status: userTable.status,
            trainerId: trainerTable.id,
            riderId: riderTable.id,
            vetId: vetTable.id
        })
        .from(userTable)
        .leftJoin(trainerTable, eq(userTable.id, trainerTable.userId))
        .leftJoin(riderTable, eq(userTable.id, riderTable.userId))
        .leftJoin(vetTable, eq(userTable.id, vetTable.userId))
        .where(eq(userTable.id, userId));

        if (!result.length) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        let user = result[0];
        let healed = false;

        // Data Self-Healing Logic for single user fetch
        if (user.type === 'trainer' && !user.trainerId) {
            try {
                const res = await db.insert(trainerTable).values({ userId: user.id, title: "Trainer", experience: "N/A" }).returning();
                if (res && res.length > 0) { user.trainerId = res[0].id; healed = true; }
            } catch (e) { console.error(`Failed to heal trainer ${user.id}:`, e.message); }
        }
        
        // Anyone who is NOT a trainer should have a rider profile if they are accessing the system.
        // This ensures Vets, Admins, and multi-role users can still book/test rider sessions.
        if (user.type !== 'trainer' && !user.riderId) {
            try {
                const res = await db.insert(riderTable).values({ userId: user.id, level: "BEGINNER" }).returning();
                if (res && res.length > 0) { user.riderId = res[0].id; healed = true; }
            } catch (e) { console.error(`Failed to heal rider ${user.id}:`, e.message); }
        }
        
        if (user.type === 'vet' && !user.vetId) {
            try {
                const res = await db.insert(vetTable).values({ userId: user.id }).returning();
                if (res && res.length > 0) { user.vetId = res[0].id; healed = true; }
            } catch (e) { console.error(`Failed to heal vet ${user.id}:`, e.message); }
        }

        return res.status(200).json({ user, message: healed ? 'User fetched and healed' : 'User fetched successfully', success: true });
    } catch (error) {
        console.error("ERROR IN GET_USER:", error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const createUser = async (req, res) => {
    const { data } = req.body;

    try {
        const { name, mobile, email, dob, type, age, weight, password, parentName, title, experience, emergencyContact, allergies, medical, level, instructions, status } = data
        
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newUser = await db.insert(userTable).values({ 
            name, mobile, type, email, dob, age, weight, parentName, emergencyContact, status,
            password: hashedPassword
        }).returning();
        
        if (!newUser || newUser.length === 0) {
            return res.status(400).json({ message: 'Error creating user - no record returned', success: false });
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

        if (type === "vet") {
            const newVet = await db.insert(vetTable).values({ userId: newUser[0].id })
            if (!newVet) {
                return res.status(400).json({ message: 'Error creating vet', success: false });
            }
        }

        return res.status(201).json({ user: newUser[0], message: 'User created successfully', success: true });
    } catch (error) {
        console.error('CRITICAL ERROR IN CREATE_USER:', error);
        const errorMessage = error.detail || error.message || 'An unknown error occurred';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};

export const markNotificationsAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.select().from(users).where(eq(users.id, id));
        if (!user.length) return res.status(404).json({ success: false, message: 'User not found' });

        const notifications = user[0].notifications || [];
        const updatedNotifs = notifications.map(n => ({ ...n, unread: false }));

        await db.update(users).set({ notifications: updatedNotifs }).where(eq(users.id, id));
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    
    // Separate core user data from role-specific data
        const { title, experience, level, medical, instructions, allergies, addHorseId, ...coreData } = data;
        
        try {
            // 1. Update Core User Data
            const updatedUser = await db.update(userTable).set(coreData).where(eq(userTable.id, id)).returning();
            if (!updatedUser || updatedUser.length === 0) {
                return res.status(404).json({ message: 'User not found', success: false });
            }
    
            const user = updatedUser[0];
    
            // 2. Update Role-Specific Data
            if (user.type === "rider") {
                const riderUpdateData = {};
                if (level !== undefined) riderUpdateData.level = level;
                if (medical !== undefined) riderUpdateData.medical = medical;
                if (instructions !== undefined) riderUpdateData.instructions = instructions;
                if (allergies !== undefined) riderUpdateData.allergies = allergies;

                if (Object.keys(riderUpdateData).length > 0) {
                    await db.update(riderTable).set(riderUpdateData).where(eq(riderTable.userId, id));
                }
            } else if (user.type === "trainer") {
                const trainerUpdateData = {};
                if (title !== undefined) trainerUpdateData.title = title;
                if (experience !== undefined) trainerUpdateData.experience = experience;

                if (Object.keys(trainerUpdateData).length > 0) {
                    await db.update(trainerTable).set(trainerUpdateData).where(eq(trainerTable.userId, id));
                }

                if (data.newLeaveRequest) {
                    const leaveRequest = {
                        ...data.newLeaveRequest,
                        id: Date.now().toString(),
                        submittedAt: new Date().toISOString(),
                        status: 'PENDING'
                    };
                    await db.execute(sql`UPDATE trainers SET "leaveRequests" = COALESCE("leaveRequests", '[]'::jsonb) || ${JSON.stringify([leaveRequest])}::jsonb WHERE user_id = ${id}`);
                }

                if (addHorseId) {
                    // Update trainer's array (idempotent)
                    await db.execute(sql`UPDATE trainers SET "horseId" = array_append("horseId", ${addHorseId}::uuid) WHERE user_id = ${id} AND NOT (${addHorseId}::uuid = ANY("horseId"))`);
                    // Update horse's director trainerId link
                    await db.execute(sql`UPDATE horse SET "trainer_id" = ${id} WHERE id = ${addHorseId}`);

                    // AUTOMATED NOTIFICATION
                    const horseRes = await db.select().from(horseTable).where(eq(horseTable.id, addHorseId));
                    const horseName = horseRes[0]?.name || 'a new horse';
                    const newNotif = {
                        id: Date.now().toString(),
                        title: "New Horse Assigned",
                        desc: `${horseName} has been added to your fleet registry.`,
                        time: "Just Now",
                        type: "success",
                        horseName: horseName,
                        horseBreed: horseRes[0]?.title || 'STANDARD BREED',
                        unread: true
                    };
                    await db.execute(sql`UPDATE users SET notifications = array_append(COALESCE(notifications, '[]'::jsonb), ${JSON.stringify(newNotif)}::jsonb) WHERE id = ${id}`);
                }
            } else if (user.type === "vet") {
                // Ensure vet record exists or update it
                const existingVet = await db.select().from(vetTable).where(eq(vetTable.userId, id));
                if (existingVet.length === 0) {
                    await db.insert(vetTable).values({ userId: id });
                }
            }

        return res.status(200).json({ user: updatedUser[0], message: 'User updated successfully', success: true });
    } catch (error) {
        console.error('CRITICAL ERROR IN UPDATE_USER:', error);
        const errorMessage = error.detail || error.message || 'An unknown error occurred';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await db.delete(userTable).where(eq(userTable.id, id)).returning();
        if (!deletedUser || deletedUser.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        return res.status(200).json({ user: deletedUser[0], message: 'User deleted successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const getOTP = async (req, res) => {
    const { data } = req.body;
    const { mobile } = data;
    try {
        const user = await db.select().from(userTable).where(eq(userTable.mobile, mobile));
        if (!user || user.length === 0) {
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

        let roleData = {};
        if (user[0].type === "trainer") {
            const trainer = await db.select().from(trainerTable).where(eq(trainerTable.userId, user[0].id));
            if (trainer.length > 0) roleData.trainerId = trainer[0].id;
        } else if (user[0].type === "rider") {
            const rider = await db.select().from(riderTable).where(eq(riderTable.userId, user[0].id));
            if (rider.length > 0) roleData.riderId = rider[0].id;
        } else if (user[0].type === "vet") {
            const vet = await db.select().from(vetTable).where(eq(vetTable.userId, user[0].id));
            if (vet.length > 0) roleData.vetId = vet[0].id;
        }

        return res.status(200).json({ 
            message: 'OTP verified successfully', 
            success: true, 
            token, 
            user: { ...user[0], ...roleData } 
        });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ message: 'Missing request data', success: false });
        }

        const { email, mobile, password } = data;
        const identifier = email || mobile;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/Mobile and Password are required', success: false });
        }

        let user;
        if (identifier) {
            user = await db.select().from(userTable).where(
                or(
                    eq(userTable.email, identifier),
                    eq(userTable.mobile, identifier)
                )
            );
        }

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (!user[0].password) {
            return res.status(400).json({ message: 'Password not set for this account. Please use OTP.', success: false });
        }

        if (!bcrypt) {
            return res.status(500).json({ message: 'Authentication service unavailable (bcryptjs missing). Please run npm install on the server.', success: false });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', success: false });
        }

        const token = generateToken(user[0]);

        let roleData = {};
        if (user[0].type === "trainer") {
            const trainer = await db.select().from(trainerTable).where(eq(trainerTable.userId, user[0].id));
            if (trainer.length > 0) roleData.trainerId = trainer[0].id;
        } else if (user[0].type === "rider") {
            const rider = await db.select().from(riderTable).where(eq(riderTable.userId, user[0].id));
            if (rider.length > 0) roleData.riderId = rider[0].id;
        } else if (user[0].type === "vet") {
            const vet = await db.select().from(vetTable).where(eq(vetTable.userId, user[0].id));
            if (vet.length > 0) roleData.vetId = vet[0].id;
        }

        return res.status(200).json({ 
            message: 'Logged in successfully', 
            success: true, 
            token, 
            user: { ...user[0], ...roleData } 
        });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const notifyUser = async (req, res) => {
    const { id } = req.params;
    const { title, desc, type } = req.body.data;
    
    try {
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            desc,
            type: type || 'info', // 'booking', 'alert', 'success', 'reminder'
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            date: new Date().toISOString()
        };

        const result = await db.execute(sql`UPDATE users SET "notifications" = COALESCE("notifications", '[]'::jsonb) || ${JSON.stringify([notification])}::jsonb WHERE id = ${id}`);
        
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const notifyAllUsers = async (req, res) => {
    const { title, desc, type } = req.body.data;
    
    try {
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            desc,
            type: type || 'info',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            date: new Date().toISOString()
        };

        // Broadcast to all users using atomic jsonb append
        await db.execute(sql`UPDATE users SET "notifications" = COALESCE("notifications", '[]'::jsonb) || ${JSON.stringify([notification])}::jsonb`);
        
        res.status(200).json({ success: true, message: 'Global broadcast signal dispatched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const runTrainerMigrations = async () => {
    try {
        await db.execute(sql`ALTER TABLE trainers ADD COLUMN IF NOT EXISTS stable_id UUID REFERENCES stable(id)`);
        console.log("Trainer table migration complete.");
    } catch (error) {
        console.error("Trainer migration error:", error.message);
    }
};