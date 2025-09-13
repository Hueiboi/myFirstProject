const con = require('../config/db.js');
const menu = require('../models/menuModel.js');

exports.getAllItems = async (req, res) => {
    try {
        const { sortBy, order, category } = req.query;
        let result;
        if (category) {
            result = await menu.getAll(category);
        } else {
            result = await menu.getAllSorted(sortBy, order);
        }
        res.status(200).json({ status: "success", data: result.rows, msg: "Retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving items", error: err.message });
        console.error(err);
    }
};

exports.getAllByName = async (req, res) => {
    try {
        const { filter } = req.query;
        const result = await menu.getByName(filter);
        res.status(200).json({ status: "success", data: result.rows, msg: "Retrieved by name successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving items", error: err.message });
        console.error(err);
    }
};

exports.getItemById = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await menu.getById(id);
        if (result.rowCount > 0) {
            res.status(200).json({ status: "success", data: result.rows[0], msg: "Retrieved successfully" });
        } else {
            res.status(404).json({ status: "error", msg: "Item not found" });
            console.error("Item not found with ID:", id);
        }
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving item", error: err.message });
        console.error(err);
    }
};

exports.createItem = async (req, res) => {
    try {
        const { name, id, price, stock_quantity, category } = req.body;
        if (!name || !id || !price || !stock_quantity) {
            return res.status(400).json({ status: "error", msg: "Missing required fields" });
        }
        await menu.create(name, id, price, stock_quantity, category);
        res.status(201).json({ status: "success", msg: "Item created successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error creating item", error: err.message });
        console.error(err);
    }
};

exports.createManyItems = async (req, res) => {
    try {
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ status: "error", msg: "Invalid input: expected an array of items" });
        }
        const results = await Promise.all(
            items.map(async item => {
                const { name, id, price, stock_quantity, category } = item;
                if (!name || !id || price == null || stock_quantity == null) {
                    return { ...item, status: "invalid item data" };
                }
                try {
                    await menu.create(name, id, price, stock_quantity, category);
                    return { ...item, status: "created successfully" };
                } catch (err) {
                    console.error(err);
                    return { ...item, status: "failed to create" };
                }
            })
        );
        res.status(201).json({ status: "success", data: results, msg: "Items processed" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error creating items", error: err.message });
        console.error(err);
    }
};

exports.updateItem = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, stock_quantity, category } = req.body;
        if (!id) return res.status(400).json({ status: "error", msg: "Missing item ID" });

        const fieldsToUpdate = ['name', 'price', 'stock_quantity', 'category'];
        const values = [];
        const fields = [];
        let index = 1;

        for (const field of fieldsToUpdate) {
            if (req.body[field] !== undefined) {
                fields.push(`${field} = $${index++}`);
                values.push(req.body[field]);
            }
        }

        if (fields.length === 0) return res.status(400).json({ status: "error", msg: "No fields to update" });

        values.push(id);
        const result = await con.query(`UPDATE menu SET ${fields.join(',')} WHERE id = $${index}`, values);

        if (result.rowCount === 0) return res.status(404).json({ status: "error", msg: "Item not found" });

        res.status(200).json({ status: "success", msg: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error updating item", error: err.message });
        console.error(err);
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ status: "error", msg: "Missing item ID" });

        const result = await menu.delete(id);
        if (result.rowCount > 0) {
            res.status(200).json({ status: "success", msg: "Item deleted successfully" });
        } else {
            res.status(404).json({ status: "error", msg: "Item not found" });
            console.error("Item not found with ID:", id);
        }
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting item", error: err.message });
        console.error(err);
    }
};