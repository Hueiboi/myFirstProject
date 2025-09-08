# myProject - Dự án cá nhân về quản lý kho sản phẩm và giỏ hàng, được xây dựng khi vừa học vừa thực hành dựa trên nền tảng nodejs, expressjs và postgresql

## Products: Nơi quản lý các sản phẩm trong kho, chứa các thông tin cơ bản về sản phẩm của cửa hàng, quyền quản lý thuộc về manager hoặc staff
1. Mẫu chia folder theo từng module
```sh
store-management/
│
├── node_modules/              # Thư viện cài bằng npm (auto generate)
├── package.json               # Thông tin package, script, dependencies
├── .env                       # File chứa biến môi trường (port, DB credentials)
├── server.js (index.js)  # File main khởi động server Express
│
├── config/                    # Cấu hình kết nối
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
└── README.md                  # Mô tả dự án, cách chạy 
```

2. Cách phân chia folder theo vai trò
	- Folder cấu hình "config": kết nối PostgreSQL
	- Folder khởi tạo "server": Express app
	- Folder controller logic: Xử lý yêu cầu POST, GET, PUT,..
	- Folder model: Thao tác SQL 

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

### 1️⃣ **`config/db.js` – Kết nối PostgreSQL**
**Chứa cấu hình DB, giúp tách biệt với logic xử lý**  
**Dùng `dotenv` để tránh lộ thông tin nhạy cảm**  

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
**Tách biệt code truy vấn khỏi controller để dễ bảo trì**  
**Xử lý truy vấn PostgreSQL, trả về dữ liệu JSON**  

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
**Nhận request từ route, gọi model để xử lý dữ liệu, trả về response**  
**Có `try...catch` để bắt lỗi khi truy vấn DB**  

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
**Chứa route GET & POST cho sản phẩm**  
**Gọi controller để xử lý request**  

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
**Import các route, middleware**  
**Không chứa xử lý API, chỉ dùng để khởi động**  

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
### Những thắc mắc và lưu ý kĩ thuật
0. Các cách test API
Để test tính năng tìm kiếm sản phẩm qua filter, bạn có thể thử bằng Postman, curl, hoặc fetch (trong frontend). Dưới đây là hướng dẫn cho từng cách:

    - Test bằng Postman/Thunder (dễ dùng nhất)
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

    - Test bằng curl (terminal)
    curl "http://localhost:3000/products?filter=Apple"

    - Test bằng fetch trong frontend
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

## Cart: Nơi chứa sản phẩm sau khi khách hàng thêm vào, chứa thông tin cơ bản về sản phẩm
sẽ được sync tương ứng trong database, quyền truy cập thuộc về khách hàng
### Cấu trúc thư mục chuẩn RESTful Backend
```sh
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
```
*File mẫu cho giỏ hàng (Cart)*

### Những chức năng chính cơ bản (Mẫu) 
1. models/cartModel.js
```js
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
```
2. controllers/cartController.js
```js
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
```
3. routes/cartRoutes.js
```js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:product_id', cartController.updateCartItem);
router.delete('/:product_id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;
```
4. server.js (Thêm route)
```js
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
```

## Gợi ý thao tác CRUD từ client (HTML + JS)
- Thêm sản phẩm vào giỏ (POST /api/cart)
- Xem giỏ hàng (GET /api/cart)
- Xóa từng sản phẩm khỏi giỏ
- Cập nhật số lượng sản phẩm
- Xóa toàn bộ giỏ hàng
- Mỗi hành động sẽ gắn với một hàm JavaScript dùng fetch() tương tự như phần product bạn đã làm.

### Những thắc mắc và lưu ý kĩ thuật
1. UNIQUE constraint unique_id trên bảng cartTable
- Ý nghĩa: Ràng buộc UNIQUE (product_id) đảm bảo một sản phẩm chỉ xuất hiện một lần trong giỏ hàng (không tạo bản ghi mới cho cùng product_id và cùng user_id).
- Lỗi thường gặp: Khi INSERT sản phẩm đã tồn tại trong giỏ → PostgreSQL báo:
```SQL
duplicate key value violates unique constraint "unique_id"
```
- Cách xử lý:
* Cách 1: Ở backend, kiểm tra trước khi thêm:
```js
const existing = await con.query(
    'SELECT * FROM "cartTable" WHERE product_id = $1 AND user_id = $2',
    [product_id, user_id]
);
if (existing.rows.length > 0) {
    // Update số lượng thay vì insert
}
```
* Cách 2: Dùng ON CONFLICT trong PostgreSQL:
```sql
INSERT INTO "cartTable" (product_id, quantity, user_id)
VALUES ($1, $2, $3)
ON CONFLICT (product_id) DO UPDATE
SET quantity = "cartTable".quantity + EXCLUDED.quantity;
```

## JWT và bảo mật (mã hóa mật khẩu bcrypt)
### Mục đích
- Xác thực người dùng khi truy cập API
- Lưu trữ thông tin quan trọng để phân quyền mà không cần query DB liên tục 
- Bảo vệ các route nhạy cảm liên quan đến người dùng
### Cơ chế hoạt động trong dự án
- Register sau khi đăng ký tài khoản, mật khẩu được hash bằng bcrypt trước khi lưu, role mặc định là user
- Login sẽ kiểm tra username và mật khẩu bằng bcrypt.compare, nếu kết quả đúng sẽ trả về access token
- middleware verifyToken: Lấy token trong request và giải mã để lấy userid và role sau đó phân quyền => một số quyền chỉ admin mới truy cập được

## *Note*:  
### Khi nào dùng hàm kiểu nào?
- Tình huống	Gợi ý dùng
- Hàm thường, cần hoisting =>	function declaration
- Hàm gán biến, closure =>	function expression
- Hàm callback, logic ngắn =>	arrow function
- Chạy hàm ngay =>	IIFE
- Định nghĩa method trong object/class =>	object method

### Mẹo tránh rối khi mở rộng dự án
| KỸ THUẬT                | GIẢI THÍCH                                                                 |
|:-------------------------|:---------------------------------------------------------------------------|
| Tách rõ module          | Mỗi module như product, cart, user nên có controller/model riêng, đừng viết chồng chéo. |
| Giữ API consistent      | Ví dụ: mọi thao tác cần user_id thì thống nhất lấy từ req.query.user_id (sau này có auth thì chuyển sang req.user.id). |
| Viết comment rõ ràng     | Nhất là các truy vấn SQL phức tạp, viết rõ để sau còn hiểu.                |
| Tạo middleware (sau này)| Nếu sau này có xác thực, user_id sẽ lấy từ middleware gán vào req.user.    |
| Viết unit test (về sau) | Giúp test 1 phần riêng lẻ không bị ảnh hưởng toàn bộ app.                 |

### Sync database giữa cart và product
1. Add
- Lấy thông tin từ product, kiểm tra số lượng có hay không hoặc khi thêm vào cart có quá số lượng
- Sau đó cập nhật số lượng từ cả 2, nếu trong cart có sẵn thì cập nhật thêm, chưa thì sẽ insert
2. Update
- Lấy số lượng từ giỏ đang có 
- Kiểm tra người dùng muốn tăng hay giảm và tính toán phần chênh lệch (không vượt quá stock)
- Cập nhật cart
3. Delete
- Lấy số lượng cần xóa
- Trả lại kho và cập nhật

### Các loại HTTP status code phổ biến
1. 2xx - Thành công
- 200: OK => Yêu cầu thành công (GET, PUT, DELETE)
- 201: Created => Tạo thành công (POST)
- 204: No Content => Thành công nhưng ko trả về data (DELETE, PUT)

2. 3xx - Điều hướng
- 301: Moved Permanently => URL đã chuyển vĩnh viễn
- 302: Found => Chuyển trang (Login)
- 304 Not modified => Dùng cache

3. 4xx - Lỗi phía Client
- 400: Bad request => Sai cú pháp req
- 401: Unauthorized => Chưa đăng nhập
- 403: Forbidden => Không có quyền truy cập
- 404: Not Found => Không thấy (Sai URL)
- 409: Conflict => Xung đột dữ liệu

4. 5xx - Lỗi phía server
- 500: Internal Server Error => Lỗi không xác định từ server (bug, crash)
- 502: Bad Gateway => Gateway sai
- 503: Service Unavailable => Server quá tải hoặc bảo trì

### Shopping cart bug
1. Vấn đề gặp phải
- Trước đây, trong function addToCart() có sử dụng stock-- để giảm stock trực tiếp:
```js
// CODE CŨ - CÓ LỖI
function addToCart(id) {
  const product = products.find(p => p.id === id);
  product.stock--; // ❌ Lỗi ở đây - giảm stock trực tiếp
  // ... rest of code
}
```
- Vấn đề xảy ra stock bị trừ đến 2 lần
Lần 1: stock-- trong addToCart()
Lần 2: Tính toán lại trong getRemainingStock() khi renderProducts()

→ Kết quả: Khi stock còn 50%, sản phẩm đã báo "Out of Stock"
2. Giải pháp
- Loại bỏ stock-- khỏi addToCart => không can thiệp thẳng vào stock sản phẩm
- Sử dụng getRemainStock để tính toán chính xác


### Modal login/regis 
```html
<!-- Modal Overlay -->
    <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
            <div class="modal-header">
                <!-- Login Header -->
                <div class="modal-header__login" id="loginHeader">
                    <h2 class="modal-title"><span style="color: var(--signature-color)">Log</span>in</h2>
                    <p class="modal-subtitle">Welcome back to our store!</p>
                </div>
                
                <!-- Register Header -->
                <div class="modal-header__regis hidden" id="regisHeader">
                    <h2 class="modal-title">Register</h2>
                    <p class="modal-subtitle">Create an account to <span style="color: var(--signature-color)">get more offers</span> from our store!</p>
                </div>
                
                <button class="close-btn" id="closeBtn">&times;</button>
            </div>
           
            <form class="modal-body" id="authForm">
                <!-- Name field (only for register) -->
                <div class="form-group hidden" id="nameGroup">
                    <label for="name">Your name</label>
                    <input type="text" id="name" placeholder="Nhập họ và tên của bạn">
                </div>
               
                <!-- Email field -->
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" placeholder="Nhập email của bạn" required>
                </div>
               
                <!-- Password field -->
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" placeholder="Nhập mật khẩu" required>
                </div>
               
                <!-- Confirm password field (only for register) -->
                <div class="form-group hidden" id="confirmPasswordGroup">
                    <label for="confirmPassword">Confirm password</label>
                    <input type="password" id="confirmPassword" placeholder="Nhập lại mật khẩu">
                </div>
               
                <!-- Submit buttons -->
                <button type="submit" class="submit-btn submit-login__btn" id="submitLoginBtn">Sign in</button>
                <button type="submit" class="submit-btn submit-regis__btn hidden" id="submitRegisBtn">Sign up</button>
            </form>
           
            <div class="modal-footer">
                <!-- Login footer -->
                <div class="modal-footer__login" id="loginFooter">
                    <span>Don't have an account?</span>
                    <a href="#" class="toggle-link" id="showRegisterLink">Sign up now</a>
                </div>
                
                <!-- Register footer -->
                <div class="modal-footer__regis hidden" id="regisFooter">
                    <span>Already have an account?</span>
                    <a href="#" class="toggle-link" id="showLoginLink">Sign in now</a>
                </div>
            </div>
        </div>
    </div>
```

### Lỗi hay gặp với eventListner (Mắc 2 lần trong 1 dự án 😭)
- Lỗi thường gặp: Gắn nhiều eventListener lên cùng một phần tử
Mô tả lỗi
Khi sử dụng cùng một phần tử DOM (ví dụ: nút xác nhận trong modal) cho nhiều chức năng khác nhau như tạo mới, chỉnh sửa, đăng nhập, hoặc đăng ký, nếu không quản lý đúng cách, sẽ dẫn đến việc gắn nhiều eventListener chồng lên nhau mỗi lần mở modal.
- Hậu quả
1. Hàm xử lý bị gọi nhiều lần cho một sự kiện click.
2. Dữ liệu bị xử lý sai, ví dụ: NaN, undefined, hoặc bị ghi đè không mong muốn.
3. Giao diện hoặc dữ liệu không cập nhật đúng.
4. Khó debug vì không rõ listener nào đang chạy.
Ví dụ lỗi
```js
modal.confirm.addEventListener("click", () => {
  // xử lý logic
});
```
➡️ Nếu đoạn này được gọi mỗi lần mở modal mà không gỡ listener cũ, sẽ gây lỗi.
- Cách khắc phục
+ Thẻ div
    1. Gỡ listener cũ trước khi gắn mới bằng removeEventListener, hoặc dùng cloneNode() để reset phần tử.
    2. Tách logic xử lý ra một hàm duy nhất, dùng biến trạng thái (mode) để phân biệt hành động.
    3. Gắn listener một lần duy nhất khi khởi tạo, không gắn lại mỗi lần mở modal.
+ Thẻ form
    Dùng onsubmit cho từng nút

Gợi ý code khắc phục
```js
function openModal(mode, product = null) {
  modal.mode = mode;
  modal.overlay.classList.remove("hidden");
  modal.overlay.classList.add("flex");

  if (mode === "edit" && product) {
    // gán giá trị vào form
  } else {
    modal.form.reset();
  }
}
```

// Gắn listener một lần duy nhất
```js
modal.confirm.addEventListener("click", (e) => {
  e.preventDefault();
  if (modal.mode === "create") {
    // xử lý tạo mới
  } else if (modal.mode === "edit") {
    // xử lý chỉnh sửa
  }
});
```

### Xử lý tách biệt UI và Logic
```js
//2 Hàm show và edit dùng chung modal nên sẽ thực hiện chỉ để mở UI
function showCreateForm() {//Mở form trống
    modal.overlay.classList.remove("hidden");
    modal.overlay.classList.add("flex");
    modal.mode = "create";
    modal.form.reset();
  }

  function editProduct(id) {//Mở form chứa id gốc và thông tin sẵn để sửa
    const product = products.find(p => p.id === id);
    if (!product) return alert("Product not found!");

    modal.overlay.classList.remove("hidden");
    modal.overlay.classList.add("flex");
    modal.mode = "edit";
    modal.productId = id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStock").value = product.stock;
  }

  function deleteProduct(id) {//Nút này riêng biệt nên có thể viết luôn logic
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
      renderTable();
    } else {
      alert("Product not found!");
    }
  }

//Nơi logic được thực hiện khi có sự kiện tác động vào nút
  modal.confirm.addEventListener("click", (e) => {
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value, 10);

    if (!name || isNaN(price) || isNaN(stock)) {
      alert("Vui lòng nhập đầy đủ và đúng định dạng.");
      return;
    }

    if (modal.mode === "create") {
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      products.push({ id: newId, name, price, stock });
    } else if (modal.mode === "edit") {
      const product = products.find(p => p.id === modal.productId);
      if (!product) return alert("Product not found!");

      product.name = name;
      product.price = price;
      product.stock = stock;
    }

    renderTable();
    closeModal();
  });
```

### Chuyển fake data => SQL
```js
async function createProduct() {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value, 10);

  if (!name || isNaN(price) || isNaN(stock)) {
    alert("Vui lòng nhập đầy đủ và đúng định dạng.");
    return;
  }

  await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, stock })
  });

  await fetchAndRenderProducts();
  closeModal();
}

async function editProduct(id) {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const stock = parseInt(document.getElementById("productStock").value, 10);

  if (!name || isNaN(price) || isNaN(stock)) {
    alert("Vui lòng nhập đầy đủ và đúng định dạng.");
    return;
  }

  await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, stock })
  });

  await fetchAndRenderProducts();
  closeModal();
}

```

