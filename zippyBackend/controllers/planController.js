

export  const createPlan = async (req, res) => {
    const {data} = req.body;
    try {
        const newPlan = await db.planTable.insert(data).returning();
        if(!newPlan) {
            return res.status(400).json({success: false, message: 'Failed to create plan'});
        }
        res.status(201).json({success: true, plan: newPlan});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getPlans = async (req, res) => {
    try {
        const plans = await db.planTable.select();
        if(!plans) {
            return res.status(404).json({success: false, message: 'No plans found'});
        }
        res.status(200).json({success: true, plans});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getPlanById = async (req, res) => {
    const {id} = req.params;
    try {
        const plan = await db.planTable.select().where({id}).first();
        if(!plan) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const updatePlan = async (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    try {
        const updatedPlan = await db.planTable.update(data).where({id}).returning();
        if(!updatedPlan) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan: updatedPlan});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const deletePlan = async (req, res) => {
    const {id} = req.params;
    try {
        const deletedPlan = await db.planTable.delete().where({id}).returning();
        if(!deletedPlan) {
            return res.status(404).json({success: false, message: 'Plan not found'});
        }
        res.status(200).json({success: true, plan: deletedPlan});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};