import { db } from '../db.js';
import { planTable } from '../schema.js';
import { eq } from 'drizzle-orm';

export const createPlan = async (req, res) => {
    const {data} = req.body;
    try {
        const newPlan = await db.insert(planTable).values(data).returning();
        if(!newPlan.length) {
            return res.status(400).json({success: false, message: 'Failed to create plan'});
        }
        res.status(201).json({success: true, plan: newPlan[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getPlans = async (req, res) => {
    try {
        const plans = await db.select().from(planTable);
        res.status(200).json({success: true, plans});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const bootstrapPlans = async (req, res) => {
    try {
        const existingPlans = await db.select().from(planTable);
        if (existingPlans.length === 0) {
            await db.insert(planTable).values([
                {
                    name: 'Beginner Pack',
                    sessionsCount: 8,
                    validity: 'month',
                    amount: 100,
                    level: 'Beginner',
                    rules: ["8 professional sessions", "Basic stable access", "Equine care intro"]
                },
                {
                    name: 'Intermediate Pack',
                    sessionsCount: 12,
                    validity: 'month',
                    amount: 150,
                    level: 'Intermediate',
                    rules: ["12 advanced sessions", "Full stable access", "Competition prep"]
                },
                {
                    name: 'Elite Pack',
                    sessionsCount: 24,
                    validity: 'month',
                    amount: 300,
                    level: 'Advanced',
                    rules: ["24 elite sessions", "Unlimited stable access", "Tournament entry"]
                }
            ]);
            return res.status(200).json({ success: true, message: 'Plans bootstrapped successfully' });
        }
        res.status(200).json({ success: true, message: 'Plans already exist' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Bootstrap failed: ${error.message}` });
    }
};

export const getPlanById = async (req, res) => {
    const {id} = req.params;
    try {
        const plan = await db.select().from(planTable).where(eq(planTable.id, id));
        if(!plan.length) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan: plan[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const updatePlan = async (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    try {
        const updatedPlan = await db.update(planTable).set(data).where(eq(planTable.id, id)).returning();
        if(!updatedPlan.length) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan: updatedPlan[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const deletePlan = async (req, res) => {
    const {id} = req.params;
    try {
        const deletedPlan = await db.delete(planTable).where(eq(planTable.id, id)).returning();
        if(!deletedPlan.length) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan: deletedPlan[0]});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};