const orderModel = require('../models/ordersModel');
const con = require('../config/db');

exports.getOrders = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { date } = req.query;
        const result = await orderModel.getAll(user_id, date);
        console.log("req.user:", req.user);
        res.status(200).json({ status: "success", data: result.rows, msg: "Orders retrieved successfully" });
    } 
    catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving orders", error: err.message });
        console.error(err);
    }
};

exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await orderModel.getById(id);
    if (result.rowCount > 0) {
      res.status(200).json({ 
        status: "success", 
        data: result.rows[0], 
        msg: "Order retrieved successfully" 
      });
    } else {
      res.status(404).json({ status: "error", msg: "Order not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", msg: "Error retrieving order", error: err.message });
  }
};


exports.getOrderByTableCompleted = async (req, res) => {
  try {
    const { table_id } = req.params
    if (!table_id) {
      return res.status(400).json({ status: "error", msg: "Missing table_id" })
    }

    const result = await orderModel.getByTableCompleted(table_id)
    if (result.rows.length === 0) {
      return res.status(404).json({ status: "error", msg: "No completed orders found for this table" })
    }

    res.status(200).json({ status: "success", data: result.rows, msg: "Completed orders retrieved successfully" })
  } catch (err) {
    res.status(500).json({ status: "error", msg: "Error retrieving completed orders", error: err.message })
    console.error(err)
  }
}

// exports.getOrderByOrderCode = async (req, res) => {
//     try {
//         const { order_code } = req.query;
//         if (!order_code) {
//             return res.status(400).json({ status: "error", msg: "Missing order code" });
//         }
//         const result = await orderModel.getByOrderCode(order_code);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ status: "error", msg: "Order not found" });
//         }
//         res.status(200).json({ status: "success", data: result.rows, msg: "Order retrieved successfully" });
//     } catch (err) {
//         res.status(500).json({ status: "error", msg: "Error retrieving order", error: err.message });
//         console.error(err);
//     }
// };

exports.createOrder = async (req, res) => {
    try {
        // Nếu có user từ token thì lấy, không thì để null
        const user_id = req.user ? req.user.user_id : null
        const username = req.body.created_by || (req.user ? req.user.username : null)

        const { table_id, promotion_id, order_type = 'dine-in' } = req.body;

        // Kiểm tra bàn có available không (nếu order_type là dine-in)
        const table_status = await con.query('SELECT status FROM tables WHERE id = $1', [table_id]);
        if (order_type === 'dine-in' && (!table_id || table_status.rows[0]?.status !== 'available')) {
            return res.status(400).json({ status: "error", msg: "Table not available for dine-in" });
        }

        // Gọi model tạo order
        const result = await orderModel.create(table_id, promotion_id, user_id, order_type, username);

        res.status(201).json({ status: "success", msg: "Order created successfully", data: result.rows[0] });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ status: "error", msg: "Error creating order", error: err.message });
    }
};

exports.addItemToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, quantity } = req.body;
    const qty = Number(quantity)

    if (!Number.isInteger(qty) || qty <= 0 || !product_id) {
    return res.status(400).json({
        status: "error",
        msg: "Missing or invalid product_id or quantity",
    })
    }
    const result = await orderModel.addItem(id, product_id, qty);

    // Update bàn thành occupied sau khi có item
    await con.query(
      `UPDATE tables SET status = $1 
       WHERE id = (SELECT table_id FROM orders WHERE id = $2)`,
      ['occupied', id]
    );

    res.status(201).json({ status: "success", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding item:", err.message);
    res.status(500).json({ status: "error", msg: "Error adding item", error: err.message });
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
    } 
    catch (err) {
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
    } 
    catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting item", error: err.message });
        console.error(err);
    }
};

exports.payOrder = async (req, res) => {
  const client = await con.connect();
  try {
    const { id } = req.params;
    const { payment_method, total_amount, promotion_id, created_by } = req.body;

    await client.query("BEGIN");

    // 1️⃣ Kiểm tra order tồn tại
    const orderRes = await client.query("SELECT * FROM orders WHERE id = $1", [id]);
    const order = orderRes.rows[0];
    if (!order || order.status !== "pending") {
      throw new Error("Order not pending or not found");
    }

    // 2️⃣ Thêm payment mới nhất
    const payRes = await client.query(
      `INSERT INTO payments (order_id, payment_method, total_amount, paid_at, created_by, promotion_id)
       VALUES ($1, $2, $3, NOW(), $4, $5)
       RETURNING id, payment_method, total_amount, paid_at, created_by`,
      [id, payment_method, total_amount, created_by || "Unknown", promotion_id || null]
    );
    const payment = payRes.rows[0];

    // 3️⃣ Cập nhật trạng thái order + bàn
    await client.query("UPDATE orders SET status = $1 WHERE id = $2", ["completed", id]);
    await client.query("UPDATE tables SET status = $1 WHERE id = $2", ["available", order.table_id]);

    // 4️⃣ Lấy invoice với LATERAL JOIN đảm bảo chỉ lấy payment mới nhất
    const invoiceQuery = `
      SELECT 
        o.id AS order_id, o.order_code, o.status, o.created_at,
        t.table_number,
        pay.payment_method, pay.total_amount, pay.paid_at, pay.created_by,
        json_agg(
          json_build_object(
            'product_id', m.id,
            'name', m.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.quantity * oi.price
          )
        ) AS items
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      LEFT JOIN LATERAL (
        SELECT p.payment_method, p.total_amount, p.paid_at, p.created_by
        FROM payments p
        WHERE p.order_id = o.id
        ORDER BY p.paid_at DESC
        LIMIT 1
      ) pay ON true
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu m ON oi.product_id = m.id
      WHERE o.id = $1
      GROUP BY o.id, t.table_number, pay.payment_method, pay.total_amount, pay.paid_at, pay.created_by;
    `;

    const invoiceRes = await client.query(invoiceQuery, [id]);
    await client.query("COMMIT");

    return res.status(200).json({
      status: "success",
      msg: "Payment successful",
      data: invoiceRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ payOrder error:", err);
    res.status(500).json({
      status: "error",
      msg: "Error processing payment",
      error: err.message,
    });
  } finally {
    client.release();
  }
};
