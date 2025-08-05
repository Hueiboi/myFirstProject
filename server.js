const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));
//Routing đường dẫn đến các giao diện tĩnh mặc định
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/home.html')) //route đến trang HOME
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/products.html')) //route đến PRODUCT
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/cart.html')) //route đến CART
});

// Tóm tắt lý do bạn cần 2 dòng app.get(...):
// Vì bạn đã tách các file HTML vào thư mục con (public/html), 
// nên bạn cần viết rõ đường dẫn file cụ thể khi gửi về client.
// Nếu bạn không viết app.get(...),
// thì khi truy cập / hay /cart, trình duyệt không nhận được file HTML tương ứng.

app.listen(PORT , () => console.log(`Server is running on port ${PORT}`))