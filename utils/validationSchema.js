const { body } = require('express-validator');

const createMenuSchema = {
  'products.*.name': {
    isString: true,
    isLength: { options: { min: 5, max: 32 } },
    trim: true,
    errorMessage: 'Name must be a string between 5 and 32 characters'
  },
  'products.*.id': {
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: 'ID must be a positive integer'
  },
  'products.*.price': {
    isFloat: { options: { min: 0 } },
    toFloat: true,
    errorMessage: 'Price must be a positive number'
  },
  'products.*.stock_quantity': {
    isInt: { options: { min: 0 } },
    toInt: true,
    errorMessage: 'Stock quantity must be a non-negative integer'
  },
  'products.*.category': {
    isString: true,
    optional: true,
    errorMessage: 'Category must be a string'
  }
};

const createOrderSchema = {
    table_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Table ID must be a positive integer'
    },
    promotion_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        optional: ({nullable: true}),
        errorMessage: 'Promotion ID must be a positive integer'
    }
};

const addItemToOrderSchema = {
    product_id: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Product ID must be a positive integer'
    },
    quantity: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Quantity must be a positive integer'
    }
};

const updateItemInOrderSchema = {
    quantity: {
        isInt: { options: { min: 1 } },
        toInt: true,
        errorMessage: 'Quantity must be a positive integer'
    }
};

const payOrderSchema = {
    payment_method: {
        isString: true,
        isIn: { options: [['cash', 'card', 'e-wallet']] },
        errorMessage: 'Method must be one of: cash, card, e-wallet'
    }
};

const createTableSchema = {
    table_number: {
        isString: true,
        isLength: { options: { min: 1, max: 50 } },
        trim: true,
        errorMessage: 'Table number must be a string between 1 and 50 characters'
    }
};

const updateTableSchema = {
  table_number: {
    optional: true,
    isString: true,
    isLength: { options: { min: 1, max: 50 } },
    trim: true,
    errorMessage: 'Table number must be between 1 and 50 characters',
  },
  status: {
    optional: true,
    isString: true,
    isIn: { options: [['available', 'occupied', 'reserved']] },
    errorMessage: 'Status must be either available, occupied, or reserved',
  },
}

const createPromotionSchema = {
    name: {
        isString: true,
        isLength: { options: { min: 1, max: 255 } },
        trim: true,
        errorMessage: 'Name must be a string between 1 and 255 characters'
    },
    discount_percentage: {
        isFloat: { options: { min: 0, max: 100 } },
        toFloat: true,
        errorMessage: 'Discount percentage must be between 0 and 100'
    },
    start_date: {
        isISO8601: true,
        errorMessage: 'Start date must be a valid ISO 8601 date'
    },
    end_date: {
        isISO8601: true,
        errorMessage: 'End date must be a valid ISO 8601 date'
    }
};

const registerSchema = {
        username: {
        isString: true,
        isLength: { options: { min: 3, max: 50 } },
        trim: true,
        errorMessage: 'Username must be a string between 3 and 50 characters',
    },
    password: {
        isString: true,
        isLength: { options: { min: 6 } },
        errorMessage: 'Password must be at least 6 characters',
    },
    email: {
        isEmail: true,
        errorMessage: 'Email must be a valid email address',
    },
    address: {
        isString: true,
        optional: true,
        errorMessage: 'Address must be a string',
    },
};

const updateStaffSchema = {
  username: {
    optional: true,
    isString: true,
    isLength: { options: { min: 3, max: 50 } },
    trim: true,
    errorMessage: 'Username must be between 3 and 50 characters',
  },
  password: {
    optional: true,
    isString: true,
    isLength: { options: { min: 6 } },
    errorMessage: 'Password must be at least 6 characters if provided',
  },
  email: {
    optional: true,
    isEmail: true,
    errorMessage: 'Email must be a valid email address',
  },
  address: {
    optional: true,
    isString: true,
    errorMessage: 'Address must be a string',
  },
  role: {
    optional: true,
    isIn: { options: [['admin', 'staff']] },
    errorMessage: 'Role must be either admin or staff',
  },
}

const getOrderByTableCompletedSchema = {
  table_id: {
    in: ['params'],
    isInt: { options: { min: 1 } },
    toInt: true,
    errorMessage: 'Table ID must be a positive integer'
  }
}

const getOrderByOrderCodeSchema = {
    order_code: {
        isString: true,
        isLength: { options: { min: 1, max: 50 } },
        trim: true,
        errorMessage: 'Order code must be a string between 1 and 50 characters'
    }
};

module.exports = {
  createMenuSchema,
  createOrderSchema,
  addItemToOrderSchema,
  updateItemInOrderSchema,
  payOrderSchema,
  createTableSchema,
  updateTableSchema,
  createPromotionSchema,
  registerSchema,
  updateStaffSchema,
  getOrderByTableCompletedSchema,
  getOrderByOrderCodeSchema,
}