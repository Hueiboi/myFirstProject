const tablesModel = require('../models/tablesModel');

exports.getTables = async (req, res) => {
    try {
        const result = await tablesModel.getAll();
        res.status(200).json({ status: "success", data: result.rows, msg: "Tables retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving tables", error: err.message });
        console.error(err);
    }
};

exports.createTable = async (req, res) => {
    try {
        const { table_number } = req.body;
        if (!table_number) {
            return res.status(400).json({ status: "error", msg: "Missing table number" });
        }
        const result = await tablesModel.create(table_number);
        res.status(201).json({ status: "success", msg: "Table created successfully", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error creating table", error: err.message });
        console.error(err);
    }
};

exports.updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !['available', 'occupied'].includes(status)) {
            return res.status(400).json({ status: "error", msg: "Invalid status" });
        }
        const result = await tablesModel.update(id, status);
        if (result.rowCount === 0) {
            return res.status(404).json({ status: "error", msg: "Table not found" });
        }
        res.status(200).json({ status: "success", msg: "Table updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error updating table", error: err.message });
        console.error(err);
    }
};

exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await tablesModel.delete(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ status: "error", msg: "Table not found" });
        }
        res.status(200).json({ status: "success", msg: "Table deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting table", error: err.message });
        console.error(err);
    }
};