const promotionsModel = require('../models/promotionsModel');

exports.getPromotions = async (req, res) => {
    try {
        const result = await promotionsModel.getAll();
        res.status(200).json({ status: "success", data: result.rows, msg: "Promotions retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving promotions", error: err.message });
        console.error(err);
    }
};

// exports.createPromotion = async (req, res) => {
//     try {
//         const { name, discount_percentage, start_date, end_date } = req.body;
//         if (!name || !discount_percentage || !start_date || !end_date) {
//             return res.status(400).json({ status: "error", msg: "Missing required fields" });
//         }
//         const result = await promotionsModel.create(name, discount_percentage, start_date, end_date);
//         res.status(201).json({ status: "success", msg: "Promotion created successfully", data: result.rows[0] });
//     } catch (err) {
//         res.status(500).json({ status: "error", msg: "Error creating promotion", error: err.message });
//         console.error(err);
//     }
// };

exports.createPromotion = async (req, res) => {
  try {
    const { name, discount_percentage, start_date, end_date } = req.body

    if (!name || discount_percentage == null || !start_date || !end_date) {
      return res.status(400).json({ status: "error", msg: "Missing required fields" })
    }

    if (
      isNaN(discount_percentage) ||
      discount_percentage < 0 ||
      discount_percentage > 100
    ) {
      return res.status(400).json({
        status: "error",
        msg: "Discount percentage must be between 0 and 100",
      })
    }

    const result = await promotionsModel.create(
      name,
      discount_percentage,
      start_date,
      end_date
    )

    res.status(201).json({
      status: "success",
      msg: "Promotion created successfully",
      data: result.rows[0],
    })
  } catch (err) {
    res.status(500).json({
      status: "error",
      msg: "Error creating promotion",
      error: err.message,
    })
    console.error(err)
  }
}


exports.deletePromotion = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await promotionsModel.delete(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ status: "error", msg: "Promotion not found" });
        }
        res.status(200).json({ status: "success", msg: "Promotion deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting promotion", error: err.message });
        console.error(err);
    }
};