import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../supabaseClient.js';

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
        const { data: dbUsers, error } = await supabase
            .from('users')
            .select('*, trainers(*), rider(*), vet(*)');

        if (error) throw error;

        const extractErrorMessage = (error, defaultMessage) => {
            if (error && error.message) {
                if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
                    if (error.message.includes('email')) return 'Email address is already in use.';
                    if (error.message.includes('mobile')) return 'Mobile number is already in use.';
                    return 'A user with this information already exists.';
                }
                return error.message;
            }
            return defaultMessage;
        };

        let users = dbUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            type: user.type,
            dob: user.dob,
            age: user.age,
            weight: user.weight,
            parentName: user.parent_name,
            emergencyContact: user.emergency_contact,
            createdAt: user.created_at,
            status: user.status,
            trainerId: user.trainers && user.trainers.length > 0 ? user.trainers[0].id : null,
            riderId: user.rider && user.rider.length > 0 ? user.rider[0].id : null,
            vetId: user.vet && user.vet.length > 0 ? user.vet[0].id : null,
            profilePicture: user.profile_picture,
            leaves: user.leaves,
            riderType: user.rider && user.rider.length > 0 ? user.rider[0].rider_type : null,
            riderWallet: user.rider && user.rider.length > 0 ? (user.rider[0].wallet || 0) : 0
        }));

        let healed = false;
        try {
            for (const user of users) {
                if (user.type === 'trainer' && !user.trainerId) {
                    const { data: resData } = await supabase.from('trainers').insert({ user_id: user.id, title: "Trainer", experience: "N/A" }).select();
                    if (resData && resData.length > 0) { user.trainerId = resData[0].id; healed = true; }
                }
                if (user.type === 'rider' && !user.riderId) {
                    const { data: resData } = await supabase.from('rider').insert({ user_id: user.id, level: "BEGINNER" }).select();
                    if (resData && resData.length > 0) { user.riderId = resData[0].id; healed = true; }
                }
                if (user.type === 'vet' && !user.vetId) {
                    const { data: resData } = await supabase.from('vet').insert({ user_id: user.id }).select();
                    if (resData && resData.length > 0) { user.vetId = resData[0].id; healed = true; }
                }
            }
        } catch (globalHealError) {
            console.error("Critical heal loop failure:", globalHealError.message);
        }

        try {
            const { data: sessions } = await supabase.from('sessions').select('*');
            if (sessions) {
                const now = new Date();
                const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
                const startOfMonth = new Date(); startOfMonth.setDate(1);

                users.forEach(u => {
                    if (u.type === 'trainer') {
                        const trainerSessions = sessions.filter(s => s.trainerId === u.trainerId || s.trainers === u.trainerId);
                        u.sessionsMTD = trainerSessions.filter(s => new Date(s.date) >= startOfMonth).length;
                        u.weeklyLoad = trainerSessions.filter(s => new Date(s.date) >= oneWeekAgo).length;
                        u.rating = 5.0; 
                    }
                });
            }
        } catch (aggError) {
            console.error("Aggregation failure:", aggError.message);
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found', success: false });
        }
        return res.status(200).json({ users, message: healed ? 'Users fetched and healed' : 'Users fetched successfully', success: true });
    } catch (error) {
        console.error("CRITICAL ERROR IN GET_ALL_USERS:", error);
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const getUser = async (req, res) => {
    const userId = req.userId || req.query?.id;
    try {
        const { data: dbUser, error } = await supabase
            .from('users')
            .select('*, trainers(*), rider(*), vet(*)')
            .eq('id', userId)
            .limit(1);

        if (error) throw error;
        if (!dbUser || !dbUser.length) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const rawUser = dbUser[0];
        let user = {
            id: rawUser.id,
            name: rawUser.name,
            email: rawUser.email,
            mobile: rawUser.mobile,
            type: rawUser.type,
            dob: rawUser.dob,
            age: rawUser.age,
            weight: rawUser.weight,
            parentName: rawUser.parent_name,
            emergencyContact: rawUser.emergency_contact,
            createdAt: rawUser.created_at,
            status: rawUser.status,
            trainerId: rawUser.trainers && rawUser.trainers.length > 0 ? rawUser.trainers[0].id : null,
            riderId: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].id : null,
            vetId: rawUser.vet && rawUser.vet.length > 0 ? rawUser.vet[0].id : null,
            profilePicture: rawUser.profile_picture,
            leaves: rawUser.leaves,
            riderType: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].rider_type : null,
            riderWallet: rawUser.rider && rawUser.rider.length > 0 ? (rawUser.rider[0].wallet || 0) : 0
        };

        let healed = false;

        if (user.type === 'trainer' && !user.trainerId) {
            const { data: resData } = await supabase.from('trainers').insert({ user_id: user.id, title: "Trainer", experience: "N/A" }).select();
            if (resData && resData.length > 0) { user.trainerId = resData[0].id; healed = true; }
        }
        if (user.type === 'vet' && !user.vetId) {
            const { data: resData } = await supabase.from('vet').insert({ user_id: user.id }).select();
            if (resData && resData.length > 0) { user.vetId = resData[0].id; healed = true; }
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
        const { name, mobile, email, dob, type, age, code, weight, password, parentName, title, riderType, experience, emergencyContact, allergies, medical, level, instructions, status } = data;

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const { data: newUser, error: userError } = await supabase.from('users').insert({
            name, mobile, type, email, dob, age, weight, 
            parent_name: parentName, emergency_contact: emergencyContact, status,
            password: hashedPassword
        }).select();

        if (userError || !newUser || newUser.length === 0) {
            let errorMsg = 'Error creating user';
            if (userError && userError.message) {
                if (userError.message.includes('unique constraint') || userError.message.includes('duplicate key')) {
                    if (userError.message.includes('email')) errorMsg = 'Email address is already in use.';
                    else if (userError.message.includes('mobile')) errorMsg = 'Mobile number is already in use.';
                    else errorMsg = 'A user with this information already exists.';
                } else {
                    errorMsg = userError.message;
                }
            }
            return res.status(400).json({ message: errorMsg, success: false, detail: userError });
        }

        if (type === "rider") {
            const { data: riders } = await supabase.from('rider').select('id');
            const newCode = `${code}-${((riders ? riders.length : 0) + 1001).toString()}`;
            const { data: newRider, error: riderError } = await supabase.from('rider').insert({ 
                user_id: newUser[0].id, allergies, medical, level, instructions, rider_type: riderType, code: newCode 
            }).select();
            if (riderError || !newRider) {
                return res.status(400).json({ message: 'Error creating rider', success: false, detail: riderError });
            }
        }

        if (type === "trainer") {
            const { data: newTrainer, error: trainerError } = await supabase.from('trainers').insert({ 
                user_id: newUser[0].id, title, experience 
            }).select();
            if (trainerError || !newTrainer) {
                return res.status(400).json({ message: 'Error creating trainer', success: false, detail: trainerError });
            }
        }

        if (type === "vet") {
            const { data: newVet, error: vetError } = await supabase.from('vet').insert({ 
                user_id: newUser[0].id 
            }).select();
            if (vetError || !newVet) {
                return res.status(400).json({ message: 'Error creating vet', success: false, detail: vetError });
            }
        }

        return res.status(201).json({ user: newUser[0], message: 'User created successfully', success: true });
    } catch (error) {
        console.error('CRITICAL ERROR IN CREATE_USER:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markNotificationsAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: user, error: userError } = await supabase.from('users').select('notifications').eq('id', id).limit(1);
        if (userError || !user || !user.length) return res.status(404).json({ success: false, message: 'User not found' });

        const notifications = user[0].notifications || [];
        const updatedNotifs = notifications.map(n => ({ ...n, unread: false }));

        await supabase.from('users').update({ notifications: updatedNotifs }).eq('id', id);
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

// Columns that actually exist in the `users` table
const USERS_TABLE_COLUMNS = new Set([
    'name', 'email', 'mobile', 'type', 'status', 'image', 'age',
    'dob', 'weight', 'address', 'city', 'state', 'country', 'pincode', 'bio',
    'emergency_contact', 'parent_name', 'notifications', 'stable_id', 'password'
]);

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    // Destructure all non-users-table fields out first
    const {
        title, experience, level, medical, instructions, allergies,
        riderType, addHorseId, newTrophy, code, password,
        parentName, emergencyContact, riderWallet, wallet,
        ...rest
    } = data;

    try {
        // Build coreData with ONLY columns that exist in the users table
        const coreData = {};
        for (const [key, value] of Object.entries(rest)) {
            if (USERS_TABLE_COLUMNS.has(key)) {
                coreData[key] = value;
            }
        }

        // Map camelCase to snake_case
        if (parentName !== undefined) coreData.parent_name = parentName;
        if (emergencyContact !== undefined) coreData.emergency_contact = emergencyContact;

        // Securely hash password if provided
        if (password && password.trim() !== '') {
            if (bcrypt) {
                coreData.password = await bcrypt.hash(password, 10);
                console.log(`Password updated for user ${id}`);
            } else {
                console.error("BCRYPTJS NOT FOUND. Password not updated.");
            }
        } else {
            // Ensure password field is never cleared if not provided
            delete coreData.password;
        }

        const { data: updatedUser, error: updateError } = await supabase.from('users').update(coreData).eq('id', id).select();
        
        if (updateError || !updatedUser || updatedUser.length === 0) {
            let errorMsg = 'User not found or error updating user';
            if (updateError && updateError.message) {
                if (updateError.message.includes('unique constraint') || updateError.message.includes('duplicate key')) {
                    if (updateError.message.includes('email')) errorMsg = 'Email address is already in use.';
                    else if (updateError.message.includes('mobile')) errorMsg = 'Mobile number is already in use.';
                    else errorMsg = 'A user with this information already exists.';
                } else {
                    errorMsg = updateError.message;
                }
            }
            return res.status(400).json({ message: errorMsg, success: false, detail: updateError });
        }

        const user = updatedUser[0];

        if (user.type === "rider") {
            const riderUpdateData = {};
            if (level !== undefined) riderUpdateData.level = level;
            if (medical !== undefined) riderUpdateData.medical = medical;
            if (instructions !== undefined) riderUpdateData.instructions = instructions;
            if (allergies !== undefined) riderUpdateData.allergies = allergies;
            if (riderType !== undefined) riderUpdateData.rider_type = riderType;
            if (code !== undefined) riderUpdateData.code = code;
            if (wallet !== undefined) riderUpdateData.wallet = Number(wallet);
            if (riderWallet !== undefined) riderUpdateData.wallet = Number(riderWallet);

            if (Object.keys(riderUpdateData).length > 0) {
                await supabase.from('rider').update(riderUpdateData).eq('user_id', id);
            }
            
            if (newTrophy) {
                const trophyItem = {
                    id: Date.now().toString(),
                    title: newTrophy.title,
                    subtitle: newTrophy.subtitle || 'Admin Award',
                    icon: newTrophy.icon || 'Trophy',
                    color: newTrophy.color || '#85431E',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                };
                
                const { data: riderData } = await supabase.from('rider').select('trophies').eq('user_id', id).limit(1);
                const currentTrophies = riderData && riderData.length > 0 ? (riderData[0].trophies || []) : [];
                await supabase.from('rider').update({ trophies: [...currentTrophies, trophyItem] }).eq('user_id', id);
            }
        } else if (user.type === "trainer") {
            const trainerUpdateData = {};
            if (title !== undefined) trainerUpdateData.title = title;
            if (experience !== undefined) trainerUpdateData.experience = experience;

            if (Object.keys(trainerUpdateData).length > 0) {
                await supabase.from('trainers').update(trainerUpdateData).eq('user_id', id);
            }

            if (data.newLeaveRequest) {
                const leaveRequest = {
                    ...data.newLeaveRequest,
                    id: Date.now().toString(),
                    submittedAt: new Date().toISOString(),
                    status: 'PENDING'
                };
                const { data: trainerData } = await supabase.from('trainers').select('leaveRequests').eq('user_id', id).limit(1);
                const currentLeaves = trainerData && trainerData.length > 0 ? (trainerData[0].leaveRequests || []) : [];
                await supabase.from('trainers').update({ leaveRequests: [...currentLeaves, leaveRequest] }).eq('user_id', id);
            }

            if (addHorseId) {
                const { data: trainerData } = await supabase.from('trainers').select('horseId, id').eq('user_id', id).limit(1);
                if (trainerData && trainerData.length > 0) {
                    const horseIds = trainerData[0].horseId || [];
                    if (!horseIds.includes(addHorseId)) {
                        await supabase.from('trainers').update({ horseId: [...horseIds, addHorseId] }).eq('user_id', id);
                    }
                    await supabase.from('horse').update({ trainer_id: trainerData[0].id }).eq('id', addHorseId);
                }

                // Automate notification
                const { data: horseRes } = await supabase.from('horse').select('*').eq('id', addHorseId).limit(1);
                const horseName = horseRes && horseRes.length > 0 ? horseRes[0].name : 'a new horse';
                const newNotif = {
                    id: Date.now().toString(),
                    title: "New Horse Assigned",
                    desc: `${horseName} has been added to your fleet registry.`,
                    time: "Just Now",
                    type: "success",
                    horseName: horseName,
                    horseBreed: horseRes && horseRes.length > 0 ? horseRes[0].title : 'STANDARD BREED',
                    unread: true
                };
                
                const { data: usr } = await supabase.from('users').select('notifications').eq('id', id).limit(1);
                if(usr && usr.length > 0) {
                     const notifs = usr[0].notifications || [];
                     await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', id);
                }
            }
        } else if (user.type === "vet") {
            const { data: existingVet } = await supabase.from('vet').select('*').eq('user_id', id).limit(1);
            if (!existingVet || existingVet.length === 0) {
                await supabase.from('vet').insert({ user_id: id });
            }
        }

        return res.status(200).json({ user: updatedUser[0], message: 'User updated successfully', success: true });
    } catch (error) {
        console.error('CRITICAL ERROR IN UPDATE_USER:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateLeave = async (req, res) => {
    const { id } = req.params;
    const { leaves } = req.body.data;

    try {
        const { data: user } = await supabase.from('users').select('*').eq('id', id).limit(1);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const userLeaves = user[0].leaves || [];
        const updatedLeaves = [...userLeaves, leaves];
        const { data: updatedUser } = await supabase.from('users').update({ leaves: updatedLeaves }).eq('id', id).select();
        
        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (leaves.sessionId) {
            const { data: session } = await supabase.from('sessions').select('*').eq('id', leaves.sessionId).limit(1);
            if (!session || session.length === 0) {
                return res.status(404).json({ message: 'Session not found', success: false });
            }

            const trainerId = session[0].trainerId || session[0].trainers;
            const { data: trainer } = await supabase.from('trainers').select('*').eq('id', trainerId).limit(1);
            
            if (!trainer || trainer.length === 0) {
                return res.status(404).json({ message: 'Trainer not found', success: false });
            }
            const trainerLeaves = trainer[0].leaveRequests || [];

            const updatedTrainerLeaves = [...trainerLeaves, { ...leaves, name: user[0].name, riderId: user[0].id }];
            const { data: updatedTrainer } = await supabase.from('trainers').update({ leaveRequests: updatedTrainerLeaves }).eq('id', trainer[0].id).select();

            if (!updatedTrainer || updatedTrainer.length === 0) {
                return res.status(404).json({ message: 'Trainer not found', success: false });
            }
        }
        return res.status(200).json({ user: updatedUser[0], message: 'User updated successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const { data: deletedUser, error } = await supabase.from('users').delete().eq('id', id).select();
        if (error || !deletedUser || deletedUser.length === 0) {
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
        const { data: user } = await supabase.from('users').select('*').eq('mobile', mobile).limit(1);
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await supabase.from('users').update({ otp }).eq('mobile', mobile);
        return res.status(200).json({ otp, message: 'OTP generated successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};

export const verifyOTP = async (req, res) => {
    const { data } = req.body;
    const { mobile, otp } = data;

    try {
        const { data: user } = await supabase.from('users').select('*').eq('mobile', mobile).limit(1);

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (otp !== user[0].otp) {
            return res.status(400).json({ message: 'Invalid OTP', success: false });
        }

        const token = generateToken(user[0]);

        let roleData = {};
        if (user[0].type === "trainer") {
            const { data: trainer } = await supabase.from('trainers').select('*').eq('user_id', user[0].id).limit(1);
            if (trainer && trainer.length > 0) roleData.trainerId = trainer[0].id;
        } else if (user[0].type === "rider") {
            const { data: rider } = await supabase.from('rider').select('*').eq('user_id', user[0].id).limit(1);
            if (rider && rider.length > 0) roleData.riderId = rider[0].id;
        } else if (user[0].type === "vet") {
            const { data: vet } = await supabase.from('vet').select('*').eq('user_id', user[0].id).limit(1);
            if (vet && vet.length > 0) roleData.vetId = vet[0].id;
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
        if (!data) return res.status(400).json({ message: 'Missing request data', success: false });

        const { email, mobile, password } = data;
        const identifier = email || mobile;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/Mobile and Password are required', success: false });
        }

        let query = supabase.from('users').select('*').eq('type', data.type);
        if (email) {
            query = query.eq('email', email);
        } else {
            query = query.eq('mobile', mobile);
        }
        
        const { data: user, error: dbError } = await query.limit(1);

        if (dbError) throw dbError;
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if (!user[0].password) {
            return res.status(400).json({ message: 'Password not set for this account. Please use OTP.', success: false });
        }
        if (!bcrypt) {
            return res.status(500).json({ message: 'Authentication service unavailable.', success: false });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials', success: false });
        }

        const token = generateToken(user[0]);

        let roleData = {};
        if (user[0].type === "trainer") {
            const { data: trainer } = await supabase.from('trainers').select('*').eq('user_id', user[0].id).limit(1);
            if (trainer && trainer.length > 0) roleData.trainerId = trainer[0].id;
        } else if (user[0].type === "rider") {
            const { data: rider } = await supabase.from('rider').select('*').eq('user_id', user[0].id).limit(1);
            if (rider && rider.length > 0) roleData.riderId = rider[0].id;
        } else if (user[0].type === "vet") {
            const { data: vet } = await supabase.from('vet').select('*').eq('user_id', user[0].id).limit(1);
            if (vet && vet.length > 0) roleData.vetId = vet[0].id;
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
            type: type || 'info',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            date: new Date().toISOString()
        };

        const { data: user } = await supabase.from('users').select('notifications').eq('id', id).limit(1);
        if (user && user.length > 0) {
            const notifs = user[0].notifications || [];
            await supabase.from('users').update({ notifications: [...notifs, notification] }).eq('id', id);
        }

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

        const { data: users } = await supabase.from('users').select('id, notifications');
        if (users) {
            for (const user of users) {
                const notifs = user.notifications || [];
                await supabase.from('users').update({ notifications: [...notifs, notification] }).eq('id', user.id);
            }
        }

        res.status(200).json({ success: true, message: 'Global broadcast signal dispatched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const runTrainerMigrations = async () => {
    // Left empty or removed since Supabase handles schema migrations differently
    return;
};

export const updateLeaveRequest = async (req, res) => {
    const { riderId, trainerId } = req.params;
    const { status } = req.body.data;

    try {
        const { data: trainer } = await supabase.from('trainers').select('*').eq('id', trainerId).limit(1);
        if (!trainer || trainer.length === 0) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        const pendingRequests = trainer[0].pendingRequests || [];
        const updatedPendingRequests = pendingRequests.map(request => {
            if (request.riderId === riderId) {
                return { ...request, status, submittedAt: new Date().toISOString() };
            }
            return request;
        });

        await supabase.from('trainers').update({ pendingRequests: updatedPendingRequests }).eq('id', trainerId);

        res.status(200).json({ success: true, message: 'Leave request updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const updateTrainerLeaveRequest = async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate, status } = req.body.data;

    try {
        const { data: user } = await supabase.from('users').select('*').eq('id', userId).limit(1);
        if (!user || user.length === 0) {
            return res.status(404).json({ success: false, message: 'Trainer not found' });
        }

        const pendingRequests = user[0].leaves || [];
        const updatedPendingRequests = pendingRequests.map(request => {
            if (request.startDate === startDate && request.endDate === endDate) {
                return { ...request, status };
            }
            return request;
        });

        await supabase.from('users').update({ leaves: updatedPendingRequests }).eq('id', userId);

        res.status(200).json({ success: true, message: 'Leave request updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getAllTrainers = async (req, res) => {
    try {
        const { data: trainers, error } = await supabase.from('trainers').select('*');
        if (error) throw error;
        
        return res.status(200).json({ trainers: trainers || [], message: 'Trainers fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};