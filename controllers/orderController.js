const orderModel = require('../models/orderModel');
const con = require('../config/db');

exports.getOrders = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { date } = req.query;
        const result = await orderModel.getAll(user_id, date);
        res.status(200).json({ status: "success", data: result.rows, msg: "Orders retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving orders", error: err.message });
        console.error(err);
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const user_id = req.user.user_id;
        const result = await orderModel.getById(id, user_id);
        if (result.rowCount > 0) {
            res.status(200).json({ status: "success", data: result.rows, msg: "Order retrieved successfully" });
        } else {
            res.status(404).json({ status: "error", msg: "Order not found" });
        }
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving order", error: err.message });
        console.error(err);
    }
};

exports.createOrder = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { table_id, promotion_id } = req.body;
        if (!table_id) return res.status(400).json({ status: "error", msg: "Missing table ID" });
        const table = await con.query('SELECT status FROM tables WHERE id = $1', [table_id]);
        if (table.rows.length === 0 || table.rows[0].status !== 'available') {
            return res.status(400).json({ status: "error", msg: "Table not available" });
        }
        const result = await orderModel.create(user_id, table_id, promotion_id);
        await con.query('UPDATE tables SET status = $1 WHERE id = $2', ['occupied', table_id]);
        res.status(201).json({ status: "success", msg: "Order created successfully", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error creating order", error: err.message });
        console.error(err);
    }
};

exports.addItemToOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { menu_id, quantity } = req.body;
        if (!menu_id || !quantity) return res.status(400).json({ status: "error", msg: "Missing menu ID or quantity" });
        const order = await con.query('SELECT status FROM orders WHERE id = $1', [id]);
        if (order.rows.length === 0 || order.rows[0].status !== 'pending') {
            return res.status(400).json({ status: "error", msg: "Order not pending" });
        }
        const result = await orderModel.addItem(id, menu_id, quantity);
        res.status(201).json({ status: "success", msg: "Item added to order", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error adding item", error: err.message });
        console.error(err);
    }
};

exports.updateItemInOrder = async (req, res) => {
    try {
        const { id, item_id } = req.params;
        const { quantity } = req.body;
        if (!quantity) return res.status(400).json({ status: "error", msg: "Missing quantity" });
        const order = await con.query('SELECT status FROM orders WHERE id = $1', [id]);
        if (order.rows.length === 0 || order.rows[0].status !== 'pending') {
            return res.status(400).json({ status: "error", msg: "Order not pending" });
        }
        const result = await orderModel.updateItem(item_id, quantity);
        if (result.rowCount === 0) return res.status(404).json({ status: "error", msg: "Item not found" });
        res.status(200).json({ status: "success", msg: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error updating item", error: err.message });
        console.error(err);
    }
};

exports.deleteItemFromOrder = async (req, res) => {
    try {
        const { id, item_id } = req.params;
        const order = await con.query('SELECT status FROM orders WHERE id = $1', [id]);
        if (order.rows.length === 0 || order.rows[0].status !== 'pending') {
            return res.status(400).json({ status: "error", msg: "Order not pending" });
        }
        const result = await orderModel.deleteItem(item_id);
        if (result.rowCount === 0) return res.status(404).json({ status: "error", msg: "Item not found" });
        res.status(200).json({ status: "success", msg: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting item", error: err.message });
        console.error(err);
    }
};

exports.payOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body;
        if (!method) return res.status(400).json({ status: "error", msg: "Missing payment method" });
        const order = await con.query('SELECT total_amount, table_id FROM orders WHERE id = $1', [id]);
        if (order.rows.length === 0 || order.rows[0].status !== 'pending') {
            return res.status(400).json({ status: "error", msg: "Order not pending" });
        }
        await orderModel.pay(id, method, order.rows[0].total_amount);
        await orderModel.updateStatus(id, 'completed');
        await con.query('UPDATE tables SET status = $1 WHERE id = $2', ['available', order.rows[0].table_id]);
        res.status(200).json({ status: "success", msg: "Payment successful" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error processing payment", error: err.message });
        console.error(err);
    }
};