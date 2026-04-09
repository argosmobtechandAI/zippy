import db from '../db.js';
import { horseTable } from '../schema.js';

export const createHorse = async (req, res) => {
    const {data} = req.body;
    try {
        const newHorse = await db.horseTable.insert(data);
        if(!newHorse) {
            return res.status(400).json({success: false, message: 'Failed to create horse'});
        }
        res.status(201).json({success: true, horse: newHorse});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getHorses = async (req, res) => {
    try {
        const horses = await db.horseTable.select();
        if(!horses) {
            return res.status(404).json({success: false, message: 'No horses found'});
        }
        res.status(200).json({success: true, horses});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const getHorseById = async (req, res) => {
    const {id} = req.params;
    try {
        const horse = await db.horseTable.select().where({id}).first();
        if(!horse) {
            return res.status(404).json({success: false, message: 'Horse not found'});
        }
        res.status(200).json({success: true, horse});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const updateHorse = async (req, res) => {
    const {id} = req.params;
    const {data} = req.body;
    try {
        const updatedHorse = await db.horseTable.update(data).where({id}).returning();
        if(!updatedHorse) {
            return res.status(404).json({success: false, message: 'Horse not found'});
        }
        res.status(200).json({success: true, horse: updatedHorse});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};

export const deleteHorse = async (req, res) => {
    const {id} = req.params;
    try {
        const deletedHorse = await db.horseTable.delete().where({id}).returning();
        if(!deletedHorse) {
            return res.status(404).json({success: false, message: 'Horse not found'});
        }
        res.status(200).json({success: true, horse: deletedHorse});
    } catch (error) {
        res.status(500).json({success: false, message: `Error: ${error.message}`});
    }
};