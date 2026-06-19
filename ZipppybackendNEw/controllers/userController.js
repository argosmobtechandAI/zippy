import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';
import { sendPushNotification } from '../firebaseAdmin.js';

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
            notifications: user.notifications || [],
            riderType: user.rider && user.rider.length > 0 ? user.rider[0].rider_type : null,
            riderWallet: user.rider && user.rider.length > 0 ? (user.rider[0].wallet || 0) : 0,
            sessionCount: user.rider && user.rider.length > 0 ? (user.rider[0].session_count || 0) : 0,
            code: user.rider && user.rider.length > 0 ? user.rider[0].code : "",
            level: user.rider && user.rider.length > 0 ? user.rider[0].level : "",
            allergies: user.rider && user.rider.length > 0 ? user.rider[0].allergies : "",
            medical: user.rider && user.rider.length > 0 ? user.rider[0].medical : "",
            instructions: user.rider && user.rider.length > 0 ? user.rider[0].instructions : "",
            plan: user.rider && user.rider.length > 0 ? (user.rider[0].plan || null) : null,
            planEndDate: user.rider && user.rider.length > 0 ? (user.rider[0].plan_end_date || null) : null,
            stableId: (user.rider && user.rider.length > 0 && user.rider[0].stable_id) ? user.rider[0].stable_id : (user.trainers && user.trainers.length > 0 ? user.trainers[0].stable_id : null),
            title: user.trainers && user.trainers.length > 0 ? user.trainers[0].title : "",
            experience: user.trainers && user.trainers.length > 0 ? user.trainers[0].experience : ""
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
            notifications: rawUser.notifications || [],
            riderType: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].rider_type : null,
            riderWallet: rawUser.rider && rawUser.rider.length > 0 ? (rawUser.rider[0].wallet || 0) : 0,
            sessionCount: rawUser.rider && rawUser.rider.length > 0 ? (rawUser.rider[0].session_count || 0) : 0,
            code: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].code : "",
            level: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].level : "",
            allergies: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].allergies : "",
            medical: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].medical : "",
            instructions: rawUser.rider && rawUser.rider.length > 0 ? rawUser.rider[0].instructions : "",
            stableId: (rawUser.rider && rawUser.rider.length > 0 && rawUser.rider[0].stable_id) ? rawUser.rider[0].stable_id : (rawUser.trainers && rawUser.trainers.length > 0 ? rawUser.trainers[0].stable_id : null),
            title: rawUser.trainers && rawUser.trainers.length > 0 ? rawUser.trainers[0].title : "",
            experience: rawUser.trainers && rawUser.trainers.length > 0 ? rawUser.trainers[0].experience : ""
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
    console.log("CREATE USER PAYLOAD RECEIVED:", JSON.stringify(req.body));
    const { data } = req.body;

    try {
        const { name, mobile, email, dob, type, age, code, weight, password, parentName, title, riderType, experience, emergencyContact, allergies, medical, level, instructions, status, stableId } = data;
        console.log("DESTRUCTURED REGISTRATION DATA:", { name, mobile, email, type, code, parentName, emergencyContact, riderType, stableId });

        const finalParentName = parentName !== undefined ? parentName : data.parent_name;
        const finalEmergencyContact = emergencyContact !== undefined ? emergencyContact : data.emergency_contact;

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const { data: newUser, error: userError } = await supabase.from('users').insert({
            name, mobile, type, email, dob, age, weight, 
            parent_name: finalParentName, emergency_contact: finalEmergencyContact, status,
            password: hashedPassword,
            created_at: new Date().toISOString()
        }).select();

        if (userError || !newUser || newUser.length === 0) {
            console.error("SUPABASE USER INSERT FAILURE:", userError);
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

        // Send admin notification
        try {
            await supabase.from('admin_notifications').insert({
                title: "👤 New Member",
                desc: `A new rider "${name}" has registered on the platform.`,
                type: "system"
            });
        } catch (adminNotifErr) {
            console.error("Admin notification failed on user registration:", adminNotifErr);
        }

        if (type === "rider") {
            const { data: riders } = await supabase.from('rider').select('id');
            const newCode = `${code}-${((riders ? riders.length : 0) + 1001).toString()}`;
            const { data: newRider, error: riderError } = await supabase.from('rider').insert({ 
                user_id: newUser[0].id, allergies, medical, level, instructions, rider_type: riderType, code: newCode, stable_id: stableId || null 
            }).select();
            if (riderError || !newRider) {
                return res.status(400).json({ message: 'Error creating rider', success: false, detail: riderError });
            }
        }

        if (type === "trainer") {
            const { data: newTrainer, error: trainerError } = await supabase.from('trainers').insert({ 
                user_id: newUser[0].id, title, experience, stable_id: stableId || null
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

export const clearNotifications = async (req, res) => {
    const id = (req.params.id || '').trim().replace(/\/$/, '');
    if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    try {
        // Try clearing with empty array first
        const { error } = await supabase.from('users').update({ notifications: [] }).eq('id', id);
        if (error) {
            console.error('clearNotifications error:', error);
            // Fallback: set to null
            const { error: err2 } = await supabase.from('users').update({ notifications: null }).eq('id', id);
            if (err2) throw err2;
        }
        res.status(200).json({ success: true, message: 'Notifications cleared successfully' });
    } catch (error) {
        console.error('clearNotifications caught error:', error);
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};


// Columns that actually exist in the `users` table
const USERS_TABLE_COLUMNS = new Set([
    'name', 'email', 'mobile', 'type', 'status', 'image', 'profile_picture', 'age',
    'dob', 'weight', 'address', 'city', 'state', 'country', 'pincode', 'bio',
    'emergency_contact', 'parent_name', 'notifications', 'stable_id', 'password'
]);

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
    
    // DEBUG DUMP
    import('fs').then(fs => {
        const logData = `[${new Date().toISOString()}] PUT /updateUser/${id} - Body: ${JSON.stringify(req.body)}\n`;
        fs.appendFileSync('/tmp/updateUser.log', logData);
    });

    // Destructure all non-users-table fields out first
    const {
        title, experience, level, medical, instructions, allergies,
        riderType, addHorseId, newTrophy, code, password,
        parentName, emergencyContact, riderWallet, wallet, sessionCount, profilePicture,
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
        if (profilePicture !== undefined) coreData.profile_picture = profilePicture;

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

        let user;
        if (Object.keys(coreData).length > 0) {
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
            user = updatedUser[0];
        } else {
            const { data: fetchedUser, error: fetchError } = await supabase.from('users').select('*').eq('id', id);
            if (fetchError || !fetchedUser || fetchedUser.length === 0) {
                return res.status(400).json({ message: fetchError ? fetchError.message : 'User not found', success: false, detail: fetchError });
            }
            user = fetchedUser[0];
        }

        if (user.type?.toLowerCase() === "rider") {
            const riderUpdateData = {};
            if (level !== undefined) {
                riderUpdateData.level = level;
                try {
                    const { data: levelData } = await supabase.from('levels').select('id, monthly_price, weekdays_price').eq('name', level).limit(1);
                    if (levelData && levelData.length > 0) {
                        const amount = levelData[0].monthly_price || levelData[0].weekdays_price || 0;
                        await supabase.from('payments').insert({
                            order_id: `admin_level_${Date.now()}`,
                            amount: amount,
                            status: 'captured',
                            date: new Date().toISOString(),
                            user_id: id,
                            plan_id: levelData[0].id,
                            payment_method: 'admin',
                            coupon_code: null,
                            wallet_amount_used: 0
                        });
                        
                        // Add sessions
                        const sessionsToAdd = Number(levelData[0].sessions) || 0;
                        if (sessionsToAdd > 0) {
                            const { data: currentRider } = await supabase.from('rider').select('session_count').eq('user_id', id).limit(1);
                            const currentSessions = currentRider && currentRider.length > 0 ? (currentRider[0].session_count || 0) : 0;
                            riderUpdateData.session_count = currentSessions + sessionsToAdd;
                        }
                    }
                } catch (err) {
                    console.error("Error logging admin level payment:", err);
                }
            }
            if (medical !== undefined) riderUpdateData.medical = medical;
            if (instructions !== undefined) riderUpdateData.instructions = instructions;
            if (allergies !== undefined) riderUpdateData.allergies = allergies;
            if (riderType !== undefined) riderUpdateData.rider_type = riderType;
            if (code !== undefined) riderUpdateData.code = code;
            if (wallet !== undefined) riderUpdateData.wallet = Number(wallet);
            if (riderWallet !== undefined) riderUpdateData.wallet = Number(riderWallet);
            if (sessionCount !== undefined) riderUpdateData.session_count = Number(sessionCount);

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
        } else if (user.type?.toLowerCase() === "trainer") {
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
                        await sendPushToUser(id, newNotif.title, newNotif.desc, { type: newNotif.type });
                }
            }
        } else if (user.type?.toLowerCase() === "vet") {
            const { data: existingVet } = await supabase.from('vet').select('id').eq('user_id', id).limit(1);
            let vetId;
            if (!existingVet || existingVet.length === 0) {
                const { data: newVet } = await supabase.from('vet').insert({ user_id: id }).select();
                vetId = newVet && newVet.length > 0 ? newVet[0].id : null;
            } else {
                vetId = existingVet[0].id;
            }

            const horseIdsToAssign = data.addHorseIds || (addHorseId ? [addHorseId] : []);
            const removeHorseId = data.removeHorseId;

            let dbgLogs = { vetId, existingVet, newVetInsertTried: !existingVet || existingVet.length === 0, assignErrs: [] };

            if (removeHorseId) {
                const { error: removeErr } = await supabase.from('horse').update({ vat_id: null }).eq('id', removeHorseId);
                if (removeErr) console.error("Remove Horse Error:", removeErr);
            }

            if (horseIdsToAssign.length > 0 && vetId) {
                for (const hId of horseIdsToAssign) {
                    const { error: assignErr } = await supabase.from('horse').update({ vat_id: vetId }).eq('id', hId);
                    if (assignErr) dbgLogs.assignErrs.push({hId, error: assignErr});
                    
                    // Automate notification
                    const { data: horseRes } = await supabase.from('horse').select('*').eq('id', hId).limit(1);
                    const horseName = horseRes && horseRes.length > 0 ? horseRes[0].name : 'a new horse';
                    const newNotif = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        title: "New Horse Assigned",
                        desc: `${horseName} has been assigned to your veterinary care.`,
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
                         if (typeof sendPushToUser === 'function') {
                             await sendPushToUser(id, newNotif.title, newNotif.desc, { type: newNotif.type });
                         }
                    }
                }
            }

            import('fs').then(fs => fs.writeFileSync('/tmp/debug-vet.log', JSON.stringify(dbgLogs, null, 2)));
        }

        return res.status(200).json({ user: user, message: 'User updated successfully', success: true });
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

        const leaveRequest = {
            id: leaves.id || Math.random().toString(36).substr(2, 9),
            reason: leaves.reason || '',
            startDate: leaves.startDate || '',
            endDate: leaves.endDate || '',
            status: leaves.status || 'pending',
            submittedAt: leaves.submittedAt || new Date().toISOString()
        };

        const userLeaves = user[0].leaves || [];
        const updatedLeaves = [...userLeaves, leaveRequest];
        const { data: updatedUser } = await supabase.from('users').update({ leaves: updatedLeaves }).eq('id', id).select();
        
        if (!updatedUser || updatedUser.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Notify admin about leave request
        try {
            const { error: notifErr } = await supabase.from('admin_notifications').insert({
                title: "📅 Leave Request",
                desc: `${user[0].name} submitted a leave request from ${leaveRequest.startDate || 'N/A'} to ${leaveRequest.endDate || 'N/A'}.`,
                type: "system"
            });
            if (notifErr) throw notifErr;
        } catch (notifErr) {
            console.error("Admin notification failed for leave request:", notifErr);
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
        // First check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', id)
            .limit(1);

        if (fetchError) throw fetchError;

        if (!existingUser || existingUser.length === 0) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Delete related role records to prevent foreign key violations
        await supabase.from('rider').delete().eq('user_id', id);
        await supabase.from('trainers').delete().eq('user_id', id);
        await supabase.from('vet').delete().eq('user_id', id);

        // Delete the user
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        return res.status(200).json({ message: 'User deleted successfully', success: true });
    } catch (error) {
        console.error('DELETE USER ERROR:', error);
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
                        await sendPushToUser(id, notification.title, notification.desc, { type: notification.type });
        }

        res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const notifyAllUsers = async (req, res) => {
    const { title, desc, type, image, targetType } = req.body.data;

    try {
        // 1. Insert into broadcast_notifications table to track it globally
        const { data: broadcastRecord, error: broadcastError } = await supabase.from('broadcast_notifications').insert({
            title,
            desc,
            target_type: targetType || null,
            image: image || null
        }).select();

        if (broadcastError) {
            console.error("Failed to insert broadcast_notifications:", broadcastError);
            throw broadcastError;
        }

        const broadcastId = broadcastRecord[0].id;

        // 2. Fetch FCM tokens for the target audience to send Push Notifications
        let query = supabase.from('users').select('fcm_token, type');
        const { data: users } = await query;
        
        if (users) {
            const tokens = [];
            for (const user of users) {
                // If targetType is specified, only notify users of that type
                if (targetType && user.type !== targetType) continue;
                if (user.fcm_token) {
                    tokens.push(user.fcm_token);
                }
            }

            if (tokens.length > 0) {
                await sendPushNotification(tokens, title, desc, { type: type || 'marketing', broadcastId }, image);
            }
        }

        res.status(200).json({ success: true, message: 'Global broadcast signal dispatched successfully', broadcast: broadcastRecord[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getBroadcastNotifications = async (req, res) => {
    try {
        const { data: broadcasts, error } = await supabase
            .from('broadcast_notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, broadcasts });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const deleteBroadcastNotification = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Delete from broadcast_notifications table
        const { error: deleteError } = await supabase.from('broadcast_notifications').delete().eq('id', id);
        if (deleteError) throw deleteError;

        // 2. Remove the notification from every user's notifications array
        const { data: users } = await supabase.from('users').select('id, notifications');
        if (users) {
            for (const user of users) {
                if (user.notifications && user.notifications.length > 0) {
                    const filteredNotifs = user.notifications.filter(n => n.id !== id);
                    // Only update if something was actually removed
                    if (filteredNotifs.length !== user.notifications.length) {
                        await supabase.from('users').update({ notifications: filteredNotifs }).eq('id', user.id);
                    }
                }
            }
        }

        res.status(200).json({ success: true, message: 'Broadcast notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const uploadNotificationImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: "No file provided" });
        }

        let fileBuffer;
        if (file.buffer) {
            // Memory storage
            fileBuffer = file.buffer;
        } else if (file.path) {
            // Disk storage fallback
            const fs = await import('fs');
            fileBuffer = fs.readFileSync(file.path);
        } else {
            return res.status(400).json({ success: false, message: "File processing error" });
        }

        const fileName = `notifications/${Date.now()}_${file.originalname}`;

        const { data, error } = await supabase.storage.from('zippy').upload(fileName, fileBuffer, {
            contentType: file.mimetype
        });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage.from('zippy').getPublicUrl(fileName);
        const url = publicUrlData.publicUrl;

        // Cleanup if disk storage was used
        if (file.path) {
            const fs = await import('fs');
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        return res.status(200).json({ success: true, message: "Image uploaded successfully", url });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to upload image: " + error.message });
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

        // Notify rider
        try {
            const { data: rider } = await supabase.from('rider').select('user_id').eq('id', riderId).limit(1);
            if (rider && rider.length > 0) {
                const rUserId = rider[0].user_id;
                const { data: userData } = await supabase.from('users').select('notifications').eq('id', rUserId).limit(1);
                const notifs = userData && userData.length > 0 ? (userData[0].notifications || []) : [];
                const newNotif = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: "📅 Leave Request Update",
                    desc: `Your leave request status has been updated to ${status}.`,
                    type: 'system',
                    time: "Just Now",
                    unread: true,
                    date: new Date().toISOString()
                };
                await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', rUserId);
                        await sendPushToUser(rUserId, newNotif.title, newNotif.desc, { type: newNotif.type });
            }
        } catch (notifErr) {
            console.error("Rider notification failed for leave request update:", notifErr);
        }

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

        // Notify user about leave request update
        try {
            const { data: userData, error: fetchErr } = await supabase.from('users').select('notifications').eq('id', userId).limit(1);
            if (fetchErr) throw fetchErr;
            const notifs = userData && userData.length > 0 ? (userData[0].notifications || []) : [];
            const newNotif = {
                id: Math.random().toString(36).substr(2, 9),
                title: "📅 Leave Request Update",
                desc: `Your leave request from ${startDate} to ${endDate} has been ${status}.`,
                type: 'system',
                time: "Just Now",
                unread: true,
                date: new Date().toISOString()
            };
            const { error: notifErr } = await supabase.from('users').update({ notifications: [...notifs, newNotif] }).eq('id', userId);
                        await sendPushToUser(userId, newNotif.title, newNotif.desc, { type: newNotif.type });
            if (notifErr) throw notifErr;
        } catch (notifErr) {
            console.error("User notification failed for leave request update:", notifErr);
        }

        res.status(200).json({ success: true, message: 'Leave request updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};

export const getAllTrainers = async (req, res) => {
    try {
        const { data: trainers, error } = await supabase.from('trainers').select('*');
        if (error) throw error;
        
        const mappedTrainers = trainers.map(t => ({
            ...t,
            userId: t.user_id,
            stableId: t.stable_id
        }));
        
        return res.status(200).json({ trainers: mappedTrainers || [], message: 'Trainers fetched successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, success: false });
    }
};