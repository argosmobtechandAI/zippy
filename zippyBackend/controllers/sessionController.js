import db from '../db.js';
import { sessionTable } from '../schema.js';



export const createSession = async (req, res) => {
    const {data} = req.body;
    try {
        const newSession = await db.sessionTable.insert(data);
        if(!newSession) {
            return res.status(400).json({success: false, message: 'Failed to create session'});
        }
        res.status(201).json({success: true, session: newSession});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getSessions = async (req, res) => {
    try {
        const sessions = await db.sessionTable.select();
        if(!sessions) {
            return res.status(404).json({success: false, message: 'No sessions found'});
        }
        res.status(200).json({success: true, sessions});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }   
};

export const getSessionById = async (req, res) => {
    const {id} = req.params;
    try {
        const session = await db.sessionTable.select().where({id}).first();
        if(!session) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, session});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const updateSession = async (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    try {
        const updatedSession = await db.sessionTable.update({id}, data);
        if(!updatedSession) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, session: updatedSession});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const deleteSession = async (req, res) => {
    const {id} = req.params;
    try {
        const deletedSession = await db.sessionTable.delete({id});
        if(!deletedSession) {
            return res.status(404).json({success: false, message: 'Session not found'});
        }
        res.status(200).json({success: true, message: 'Session deleted successfully'});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

