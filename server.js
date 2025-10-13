const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const PORT = process.env.PORT;

//Trình duyệt chặn req do origin khác nhau nên cần CORS
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json());
app.use('/api', require('./routes'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT , () => console.log(`Server is running on port ${PORT}`))


//cấu trúc khởi tạo
// const express = require('express');
// const app = express();

// app.use(express.json());

// app.use('/api', require('./routes'));

// app.listen(3000, () => console.log('Server running on port 3000'));
