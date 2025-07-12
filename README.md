I/ Phần Products: Nơi quản lý các sản phẩm trong kho, chứa các thông tin cơ bản về sản phẩm của cửa hàng, quyền quản lý thuộc về manager hoặc staff
1. Mẫu chia folder theo từng module
store-management/
│
├── node_modules/              # Thư viện cài bằng npm (auto generate)
├── package.json               # Thông tin package, script, dependencies
├── .env                       # File chứa biến môi trường (port, DB credentials)
├── server.js (hoặc index.js)  # File main khởi động server Express
│
├── config/                    # Cấu hình, ví dụ: db.js để kết nối PostgreSQL
│   └── db.js
│
├── controllers/               # Xử lý logic cho các route
│   └── productController.js
│
├── models/                    # Truy vấn DB, define model hoặc viết SQL
│   └── productModel.js
│
├── routes/                    # Khai báo các endpoint
│   └── productRoutes.js
│
├── public/                    # File frontend (HTML, CSS, JS) FE thuần
│   ├── index.html
│   └── main.js
│
└── README.md                  # Mô tả dự án, cách chạy (cực kỳ nên có)

2. Cách phân chia folder theo vai trò
	2-1. Folder cấu hình "config": kết nối PostgreSQL
	2-2. Folder khởi tạo "server": Express app
	2-3. Folder controller logic: Xử lý yêu cầu POST, GET, PUT,..
	2-4. Folder model: Thao tác SQL 

3. Cấu trúc thư mục
```sh
store-management/
│
├── config/                     # Cấu hình Database
│   ├── db.js                    # Kết nối với PostgreSQL
│
├── controllers/                 # Xử lý logic ứng dụng
│   ├── productController.js      # Xử lý CRUD cho sản phẩm
│
├── models/                      # Kết nối & truy vấn DB
│   ├── productModel.js           # Truy vấn bảng "demoTable"
│
├── routes/                      # Khai báo API endpoint
│   ├── productRoutes.js          # Các route liên quan đến sản phẩm
│
├── middleware/                   # Middleware xử lý request
│   ├── authMiddleware.js         # Xác thực người dùng (nếu cần)
│
├── .env                          # File biến môi trường (PORT, DB credentials)
├── server.js                     # File chính khởi động server
├── package.json                   # Quản lý dependencies
└── README.md                     # Hướng dẫn chạy dự án
```

---

## 1️⃣ **`config/db.js` – Kết nối PostgreSQL**
📌 **Chứa cấu hình DB, giúp tách biệt với logic xử lý**  
📌 **Dùng `dotenv` để tránh lộ thông tin nhạy cảm**  

```js
require('dotenv').config();
const { Client } = require('pg');

const con = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

con.connect()
    .then(() => console.log("✅ Kết nối PostgreSQL thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối DB:", err));

module.exports = con; // 👈 Xuất kết nối để dùng ở các file khác
```

---

## 2️⃣ **`models/productModel.js` – Truy vấn Database**
📌 **Tách biệt code truy vấn khỏi controller để dễ bảo trì**  
📌 **Xử lý truy vấn PostgreSQL, trả về dữ liệu JSON**  

```js
const con = require('../config/db');

const getAllProducts = async () => {
    const result = await con.query('SELECT * FROM "demoTable"');
    return result.rows;
};

const addProduct = async (name, id) => {
    return con.query('INSERT INTO "demoTable" (name, id) VALUES ($1, $2)', [name, id]);
};

module.exports = { getAllProducts, addProduct };
```

---

## 3️⃣ **`controllers/productController.js` – Xử lý logic API**
📌 **Nhận request từ route, gọi model để xử lý dữ liệu, trả về response**  
📌 **Có `try...catch` để bắt lỗi khi truy vấn DB**  

```js
const { getAllProducts, addProduct } = require('../models/productModel');

const fetchProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "❌ Lỗi khi lấy sản phẩm!" });
    }
};

const createProduct = async (req, res) => {
    const { name, id } = req.body;
    try {
        await addProduct(name, id);
        res.send("✅ Thêm sản phẩm thành công!");
    } catch (error) {
        res.status(500).json({ error: "❌ Lỗi khi thêm sản phẩm!" });
    }
};

module.exports = { fetchProducts, createProduct };
```

---

## 4️⃣ **`routes/productRoutes.js` – Khai báo API**
📌 **Chứa route GET & POST cho sản phẩm**  
📌 **Gọi controller để xử lý request**  

```js
const express = require('express');
const router = express.Router();
const { fetchProducts, createProduct } = require('../controllers/productController');

router.get('/', fetchProducts);
router.post('/', createProduct);

module.exports = router;
```

---

## 5️⃣ **`server.js` – Khởi động Server**
📌 **Import các route, middleware**  
📌 **Không chứa xử lý API, chỉ dùng để khởi động**  

```js
require('dotenv').config();
const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');

app.use(express.json());
app.use('/api/products', productRoutes); // 👈 Sử dụng route từ `routes/`

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server chạy trên http://localhost:${PORT}`));
```
4. Những thắc mắc và lưu ý kĩ thuật
    0. Các cách test API
    Để test tính năng tìm kiếm sản phẩm qua filter, bạn có thể thử bằng Postman, curl, hoặc fetch (trong frontend). Dưới đây là hướng dẫn cho từng cách:

        1. Test bằng Postman/Thunder (dễ dùng nhất)
        Giả sử bạn đã có server chạy ở http://localhost:3000 và route như sau:
        router.get('/', checkSchema(getProductSchema), productController.getAllProducts);
        Cách test:
        Method: GET

        URL http://localhost:3000/products?filter=Apple
        Bấm Send, nếu bạn đã viết hàm filterByName trong controller thì kết quả sẽ là:

        [
        {
            "id": 1,
            "name": "Apple",
            "price": 100
        },
        ...
        ]

        2. Test bằng curl (terminal)
        curl "http://localhost:3000/products?filter=Apple"

        3. Test bằng fetch trong frontend
        Giả sử bạn đã có UI (hoặc thử trên Chrome DevTools → tab Console):
        fetch('http://localhost:3000/products?filter=Apple')
        .then(res => res.json())
        .then(data => console.log(data))
        .catch(err => console.error(err));

    1. Trình tự luồng xử lý từ server.js
    - server.js nhận request -> route tới chức năng
    - productRoutes.js xác định đường dẫn và gắn controller xử lý
    - productController.js nhận request từ route -> logic -> trả response
    - productModel.js thực hiện thao tác lên database
    - database phản hồi lại model rồi gửi lên controller để trả lại response
    - controller trả lại về cho client
    => server -> routes -> controller -> model -> db -> postgre

    2. Pool và Client 
    - Client cần connect() và end(), dành cho dự án nhỏ, đơn giản 
    - Pool tự động quản lý nhiều kết nối giúp xử lý nhiều request đồng thời mà ko cần connect dành cho dự án lớn thật sự

    3. Khác biệt giữa app.use(express.json()) và express.Router() là gì? Vì sao dùng Router() khi chia file?
    - app.use(express.json()): middleware giúp parse JSON body từ client. Thường dùng một lần duy nhất trong server.js hoặc main.js.
    - express.Router(): là mini app riêng biệt để quản lý các route. Dùng khi tách code ra từng file (ví dụ productRoutes.js), giúp tổ chức rõ ràng hơn.

    4. Tại sao trong file routes chỉ viết router.get('/') thay vì /getAllData như lúc viết trong main.js?
    - Trong server.js, Đã có base path:
    app.use('/api/products', productRoutes);
    - Thực tế 
    router.get('/') → /api/products

    router.post('/') → /api/products

    router.get('/:id') → /api/products/:id

    router.put('/:id') → /api/products/:id

    router.delete('/:id') → /api/products/:id

    5. Các mã lỗi khi tương tác với HTTP
    - 200: OK -> request thành công
    - 201: Created -> tạo mới thành công (POST)
    - 400: Bad request -> request sai hoặc thiếu
    - 404: Not found -> Không thấy tài nguyên
    - 500: Internal server error -> Lỗi từ SV hoặc DB

    6. Endpoint ?
    - Là URL để giao tiếp với server thông qua API
    - User endpoint một API URL để phục vụ thao tác dữ liệu user như tạo, đọc, sửa, xóa user

    7. Vì sao các function có (req, res) không cần truyền tham số
    - Express tự động cung cấp khi có request gửi lên server.
    - Cách hoạt động:
        1. API client gửi request (ví dụ từ Thunder Client hoặc trình duyệt).
        2. Express bắt request và gọi function tương ứng trong routes.
        3. Express tự động truyền req (thông tin request) và res (phản hồi) vào function.

    8. Express validator và middleware dùng chung cho việc validate
    - Tách file ra một file validate, nơi chứa các hàm xử lý lỗi từ request
    - checkSchema là middleware để validate body, query, params...
        + Query: dùng khi giá trị nằm sau dấu ?, thường để lọc, tìm kiếm, sắp xếp. /api/products?query=
        + Params: dùng khi giá trị là một phần của đường dẫn URL /api/products/id
        → Truy cập qua req.query.
    - Phải dùng validationResult() để kiểm tra lỗi sau checkSchema.
    - Có thể viết middleware handleValidationErrors dùng lại nhiều lần để tránh lặp code.
    - next() trong handleValidationErrors để chuyển tiếp sang thực thi controllers 
    - Các cách tối ưu:
        1️⃣ Dùng optional: false cho các field bắt buộc → Đảm bảo dữ liệu phải có.
        2️⃣ Dùng isIn([...]) thay vì options: [...] để kiểm tra giá trị hợp lệ.
        3️⃣ Kết hợp notEmpty và isLength để kiểm tra chuỗi → Tránh nhập giá trị trống hoặc quá ngắn/dài.
        4️⃣ Thêm trim: true để loại bỏ khoảng trắng dư thừa → Giúp dữ liệu sạch hơn.
        5️⃣ Dùng toInt() hoặc toFloat() để tự động chuyển đổi kiểu dữ liệu → Tránh lỗi khi nhập sai kiểu số.

    9. Vì sao bị "require not defined" khi dùng export ?
    - Export được sử dụng cho ESModule cùng với import
    - Nếu sử dụng commonJS thì phải sử dụng module.exports hoặc exports.function() và require 

    10. Lưu ý kết nối BE, FE 
    - Kết nối FE → BE
    Trong server.js, sử dụng middleware express.static() để phục vụ file HTML:
    const path = require('path');
    app.use(express.static(path.join(__dirname, 'public')));

    - Giao tiếp qua API
    Giao diện HTML sử dụng fetch() để gọi API từ server Express.
    Ví dụ tạo sản phẩm:
 
    fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Apple', id: 1, price: 12.5 })
    });

    - Giao diện sử dụng fetch() để gọi các endpoint từ Express backend
    Mỗi request sẽ đi qua các file route và được xử lý tại controller tương ứng
    Ví dụ: POST /api/products → createProduct() trong productController.js.

    - Vì sao trong stringify là {id, name, price}
    Trong stringify nhận 1 đối số duy nhất là obj để chuyển sang string nên phải đưa vào dạng {}

    - Đoạn {} trong fetch là gì ?
        1. Cấu hình request giúp thực hiện đúng yêu cầu Create/Delete/Post
        2. headers cho biết kiểu dữ liệu gửi đi (application/json)
        3. body cho biết dữ liệu muốn gửi lên server, thường ở dạng JSON nhận string

    11. Sorting sản phẩm theo query parameter (SQL động)
    - Giao diện gọi API  /api/products?sortBy=name&order=asc
    -> Sửa model để cập nhật câu lệnh SQL -> cập nhật API đúng  

    12. Cập nhật sản phẩm nếu chỉ nhập 1 trường thì không ảnh hưởng các fields khác
    - Giải pháp Dynamic update
      let fields = [];
      let values = [];
      let index = 1;
      if (name !== undefined) {
        fields.push(`name = $${index++}`);
        values.push(name);
      }
      if (price !== undefined) {
        fields.push(`price = $${index++}`);
        values.push(price);
      }
      if (stock_quantity !== undefined) {
        fields.push(`stock_quantity = $${index++}`);
        values.push(stock_quantity);
      }

      // Không có trường nào để update
      if (fields.length === 0) return res.status(400).send("No fields to update");

      values.push(id); // ID là tham số cuối cùng

      const query = `UPDATE "productTable" SET ${fields.join(', ')} WHERE id = $${index}`;
      const result = await con.query(query, values);

II/ Phần Cart: Nơi chứa sản phẩm sau khi khách hàng thêm vào, chứa thông tin cơ bản về sản phẩm
sẽ được sync tương ứng trong database, quyền truy cập thuộc về khách hàng
1. Cấu trúc thư mục chuẩn RESTful Backend
myProject/
├── controllers/
│   ├── productController.js
│   └── cartController.js
│
├── models/
│   ├── productModel.js
│   └── cartModel.js
│
├── routes/
│   ├── productRoutes.js
│   └── cartRoutes.js
│
├── utils/
│   └── validationSchema.js
│
├── middlewares/
│   └── handleValidationErrors.js
│
├── public/
│   ├── index.html
│   └── script.js
│
├── db/
│   └── connection.js
│
├── server.js
└── README.md
🧩 File mẫu cho giỏ hàng (Cart)
📄 models/cartModel.js

2. Tương tự Products ở những chức năng chính cơ bản (Mẫu)
const con = require('../db/connection');

const cartModel = {
  getAll: () => con.query(`SELECT cart_items.id, product_id, name, price, quantity 
                            FROM cart_items 
                            JOIN "productTable" ON cart_items.product_id = productTable.id`),

  add: (product_id, quantity) =>
    con.query(`INSERT INTO cart_items (product_id, quantity) 
               VALUES ($1, $2)
               ON CONFLICT (product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
               [product_id, quantity]),

  update: (product_id, quantity) =>
    con.query('UPDATE cart_items SET quantity = $1 WHERE product_id = $2', [quantity, product_id]),

  delete: (product_id) =>
    con.query('DELETE FROM cart_items WHERE product_id = $1', [product_id]),

  clear: () => con.query('DELETE FROM cart_items'),
};

module.exports = cartModel;
📄 controllers/cartController.js

const cartModel = require('../models/cartModel');

exports.getCart = async (req, res) => {
  const result = await cartModel.getAll();
  res.json(result.rows);
};

exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  await cartModel.add(product_id, quantity);
  res.status(201).json({ message: 'Added to cart' });
};

exports.updateCartItem = async (req, res) => {
  const { product_id } = req.params;
  const { quantity } = req.body;
  await cartModel.update(product_id, quantity);
  res.json({ message: 'Updated cart item' });
};

exports.removeCartItem = async (req, res) => {
  const { product_id } = req.params;
  await cartModel.delete(product_id);
  res.json({ message: 'Removed item from cart' });
};

exports.clearCart = async (req, res) => {
  await cartModel.clear();
  res.json({ message: 'Cart cleared' });
};
📄 routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:product_id', cartController.updateCartItem);
router.delete('/:product_id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
📄 server.js (Thêm route)

const express = require('express');
const app = express();
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes); // 👈 Thêm route mới

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

*Gợi ý thao tác CRUD từ client (HTML + JS)
Thêm sản phẩm vào giỏ (POST /api/cart)

Xem giỏ hàng (GET /api/cart)

Xóa từng sản phẩm khỏi giỏ

Cập nhật số lượng sản phẩm

Xóa toàn bộ giỏ hàng

Mỗi hành động sẽ gắn với một hàm JavaScript dùng fetch() tương tự như phần product bạn đã làm.

*Note*:  
1. Khi nào dùng hàm kiểu nào?
Tình huống	Gợi ý dùng
Hàm thường, cần hoisting =>	function declaration
Hàm gán biến, closure =>	function expression
Hàm callback, logic ngắn =>	arrow function
Chạy hàm ngay =>	IIFE
Định nghĩa method trong object/class =>	object method

2. Mẹo tránh rối khi mở rộng dự án
KỸ THUẬT                | 	GIẢI THÍCH
Tách rõ module	        |   Mỗi module như product, cart, user nên có controller/model riêng, đừng viết chồng chéo.
Giữ API consistent	    |   Ví dụ: mọi thao tác cần user_id thì thống nhất lấy từ req.query.user_id (sau này có auth thì chuyển sang req.user.id).
Viết comment rõ ràng	  |   Nhất là các truy vấn SQL phức tạp, viết rõ để sau còn hiểu.
Tạo middleware (sau này)|	  Nếu sau này có xác thực, user_id sẽ lấy từ middleware gán vào req.user.
Viết unit test (về sau)	|   Giúp test 1 phần riêng lẻ không bị ảnh hưởng toàn bộ app

3. Sync database giữa cart và product
a/ Add
- Lấy thông tin từ product, kiểm tra số lượng có hay không hoặc khi thêm vào cart có quá số lượng
- Sau đó cập nhật số lượng từ cả 2, nếu trong cart có sẵn thì cập nhật thêm, chưa thì sẽ insert
b/ Update
- Lấy số lượng từ giỏ đang có 
- Kiểm tra người dùng muốn tăng hay giảm và tính toán phần chênh lệch (không vượt quá stock)
- Cập nhật cart
c/ Delete
- Lấy số lượng cần xóa
- Trả lại kho và cập nhật