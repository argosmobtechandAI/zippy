export const mapPlanToCamel = (plan) => {
    if (!plan) return plan;
    return { ...plan, sessionsCount: plan.sessions_count };
};
export const mapPlanToSnake = (plan) => {
    if (!plan) return plan;
    const { sessionsCount, ...rest } = plan;
    if (sessionsCount !== undefined) rest.sessions_count = sessionsCount;
    return rest;
};

export const mapInventoryToCamel = (item) => {
    if (!item) return item;
    return {
        ...item,
        currentStock: item.current_stock,
        minThreshold: item.min_threshold,
        lastUpdated: item.last_updated,
        stableId: item.stable_id
    };
};
export const mapInventoryToSnake = (item) => {
    if (!item) return item;
    const { currentStock, minThreshold, lastUpdated, stableId, ...rest } = item;
    if (currentStock !== undefined) rest.current_stock = currentStock;
    if (minThreshold !== undefined) rest.min_threshold = minThreshold;
    if (lastUpdated !== undefined) rest.last_updated = lastUpdated;
    if (stableId !== undefined) rest.stable_id = stableId;
    return rest;
};

export const mapHorseToCamel = (h) => {
    if (!h) return h;
    return {
        ...h,
        shoeStatus: h.shoe_status,
        imageUrl: h.image_url,
        trainerId: h.trainer_id,
        vatId: h.vat_id,
        lastVisit: h.last_visit,
        dewormingRecord: h.deworming_record,
        shoeingRemarks: h.shoeing_remarks,
        healthRemarks: h.health_remarks,
        vaccinationSummary: h.vaccination_summary,
        healthStatus: h.health_status,
        vaccinationRecords: h.vaccination_records,
        stableId: h.stable_id,
    };
};
export const mapHorseToSnake = (h) => {
    if (!h) return h;
    const db = { ...h };
    if (h.shoeStatus !== undefined) db.shoe_status = h.shoeStatus;
    if (h.imageUrl !== undefined) db.image_url = h.imageUrl;
    if (h.trainerId !== undefined) db.trainer_id = h.trainerId;
    if (h.vatId !== undefined) db.vat_id = h.vatId;
    if (h.lastVisit !== undefined) db.last_visit = h.lastVisit;
    if (h.dewormingRecord !== undefined) db.deworming_record = h.dewormingRecord;
    if (h.shoeingRemarks !== undefined) db.shoeing_remarks = h.shoeingRemarks;
    if (h.healthRemarks !== undefined) db.health_remarks = h.healthRemarks;
    if (h.vaccinationSummary !== undefined) db.vaccination_summary = h.vaccinationSummary;
    if (h.healthStatus !== undefined) db.health_status = h.healthStatus;
    if (h.vaccinationRecords !== undefined) db.vaccination_records = h.vaccinationRecords;
    if (h.stableId !== undefined) db.stable_id = h.stableId;
    
    delete db.shoeStatus; delete db.imageUrl; delete db.trainerId; delete db.vatId;
    delete db.lastVisit; delete db.dewormingRecord; delete db.shoeingRemarks;
    delete db.healthRemarks; delete db.vaccinationSummary; delete db.healthStatus;
    delete db.vaccinationRecords; delete db.stableId;
    return db;
};

export const mapHealthStatusToCamel = (hs) => {
    if (!hs) return hs;
    return { ...hs, horseId: hs.horse };
};
export const mapHealthStatusToSnake = (hs) => {
    if (!hs) return hs;
    const db = { ...hs };
    if (hs.horseId !== undefined) db.horse = hs.horseId;
    delete db.horseId;
    return db;
};

export const mapVaccinationToCamel = (v) => {
    if (!v) return v;
    return { ...v, horseId: v.horse, nextDate: v.next_date, batchNumber: v.batch_number };
};
export const mapVaccinationToSnake = (v) => {
    if (!v) return v;
    const db = { ...v };
    if (v.horseId !== undefined) db.horse = v.horseId;
    if (v.nextDate !== undefined) db.next_date = v.nextDate;
    if (v.batchNumber !== undefined) db.batch_number = v.batchNumber;
    delete db.horseId; delete db.nextDate; delete db.batchNumber;
    return db;
};

export const mapSessionToCamel = (s) => {
    if (!s) return s;
    return {
        ...s,
        joiningAmount: s.joining_amount,
        trainerId: s.trainers, // the DB column is "trainers" !
        horseId: s.horse,     // the DB column is "horse" !
        totalSeats: s.total_seats,
        batchsId: s.batchs_id
    };
};
export const mapSessionToSnake = (s) => {
    if (!s) return s;
    const db = { ...s };
    if (s.joiningAmount !== undefined) db.joining_amount = s.joiningAmount;
    if (s.trainerId !== undefined) db.trainers = s.trainerId;
    if (s.horseId !== undefined) db.horse = s.horseId;
    if (s.totalSeats !== undefined) db.total_seats = s.totalSeats;
    if (s.batchsId !== undefined) db.batchs_id = s.batchsId;
    delete db.joiningAmount; delete db.trainerId; delete db.horseId; delete db.totalSeats; delete db.batchsId;
    return db;
};

export const mapUserToCamel = (u) => {
    if (!u) return u;
    return {
        ...u,
        parentName: u.parent_name,
        emergencyContact: u.emergency_contact,
        createdAt: u.created_at,
        profilePicture: u.profile_picture
    };
};
export const mapUserToSnake = (u) => {
    if (!u) return u;
    const db = { ...u };
    if (u.parentName !== undefined) db.parent_name = u.parentName;
    if (u.emergencyContact !== undefined) db.emergency_contact = u.emergencyContact;
    if (u.createdAt !== undefined) db.created_at = u.createdAt;
    if (u.profilePicture !== undefined) db.profile_picture = u.profilePicture;
    delete db.parentName; delete db.emergencyContact; delete db.createdAt; delete db.profilePicture;
    return db;
};

export const mapTrainerToCamel = (t) => {
    if (!t) return t;
    return {
        ...t,
        stableId: t.stable_id,
        userId: t.user_id,
        // horseId, sessions, pendingSessions, leaveRequests are defined literally as those in schema!
    };
};
export const mapTrainerToSnake = (t) => {
    if (!t) return t;
    const db = { ...t };
    if (t.stableId !== undefined) db.stable_id = t.stableId;
    if (t.userId !== undefined) db.user_id = t.userId;
    delete db.stableId; delete db.userId;
    return db;
};

export const mapRiderToCamel = (r) => {
    if (!r) return r;
    return {
        ...r,
        sessionCount: r.session_count,
        joinedSessions: r.joined_sessions,
        safetyBriefing: r.safety_briefing,
        pendingSessions: r.pending_sessions,
        userId: r.user_id,
        planEndDate: r.plan_end_date
    };
};
export const mapRiderToSnake = (r) => {
    if (!r) return r;
    const db = { ...r };
    if (r.sessionCount !== undefined) db.session_count = r.sessionCount;
    if (r.joinedSessions !== undefined) db.joined_sessions = r.joinedSessions;
    if (r.safetyBriefing !== undefined) db.safety_briefing = r.safetyBriefing;
    if (r.pendingSessions !== undefined) db.pending_sessions = r.pendingSessions;
    if (r.userId !== undefined) db.user_id = r.userId;
    if (r.planEndDate !== undefined) db.plan_end_date = r.planEndDate;
    delete db.sessionCount; delete db.joinedSessions; delete db.safetyBriefing;
    delete db.pendingSessions; delete db.userId; delete db.planEndDate;
    return db;
};

export const mapVetToCamel = (v) => {
    if (!v) return v;
    return { ...v, userId: v.user_id };
};
export const mapVetToSnake = (v) => {
    if (!v) return v;
    const db = { ...v };
    if (v.userId !== undefined) db.user_id = v.userId;
    delete db.userId;
    return db;
};

export const mapStableToCamel = (s) => {
    if (!s) return s;
    return { ...s, totalRevenue: s.total_revenue, userId: s.user_id };
};
export const mapStableToSnake = (s) => {
    if (!s) return s;
    const db = { ...s };
    if (s.totalRevenue !== undefined) db.total_revenue = s.totalRevenue;
    if (s.userId !== undefined) db.user_id = s.userId;
    delete db.totalRevenue; delete db.userId;
    return db;
};

export const mapRevenueToCamel = (r) => {
    if (!r) return r;
    return { ...r, endDate: r.end_date };
    // purchaserId, purchaseType, planId, plan_key are exact strings in DB
};
export const mapRevenueToSnake = (r) => {
    if (!r) return r;
    const db = { ...r };
    if (r.endDate !== undefined) db.end_date = r.endDate;
    delete db.endDate;
    return db;
};
