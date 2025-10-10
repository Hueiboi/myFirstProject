const con = require('../config/db');

const promotionsModel = {
  getAll: () =>
    con.query(
      'SELECT * FROM "promotions" WHERE end_date >= CURRENT_DATE ORDER BY start_date ASC'
    ),

  getById: (id) =>
    con.query('SELECT * FROM "promotions" WHERE id = $1', [id]),

  create: (name, discount_percentage, start_date, end_date) =>
    con.query(
      'INSERT INTO "promotions" (name, discount_percentage, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, discount_percentage, start_date, end_date]
    ),

  delete: (id) =>
    con.query('DELETE FROM "promotions" WHERE id = $1', [id]),
}


module.exports = promotionsModel;