# 💰 Happy Wallet Server

---

## 📦 Cài đặt package

1. **Clone repository**:

```bash
git clone https://github.com/Happy-Wallet/Happy-Wallet-Server.git
cd Happy-Wallet-Server
Cài đặt dependencies:

bash
npm install
npm install express body-parser cors dotenv mysql2 jsonwebtoken bcryptjs nodemailer


⚙️ Tạo file .env
Tạo một file .env ở thư mục gốc và cấu hình như sau:

env
# Cấu hình MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=financialtrackingapp

# Cấu hình email (dùng để gửi mã khôi phục)
EMAIL_USER=giathien899@gmail.com
EMAIL_PASS=****************

# JWT token secret
JWT_SECRET=your_jwt_secret_key

# Cổng server
PORT=3000

🛡️ Lưu ý: Không push file .env lên GitHub — hãy đảm bảo .gitignore có dòng *.env

🚀 Khởi động server
bash
Sao chép
Chỉnh sửa
node server.js
Server sẽ chạy tại địa chỉ: http://localhost:3000

🔌 Danh sách API
Phương thức	Endpoint	Mô tả
POST	/register	Đăng ký người dùng mới
POST	/login	Đăng nhập
POST	/forgot-password	Gửi email để đặt lại mật khẩu
POST	/reset-password	Đặt lại mật khẩu với token

📁 Cấu trúc thư mục (gợi ý)
pgsql

Happy-Wallet-Server/
├── controllers/
│   └── authController.js
├── routes/
│   └── auth.js
├── config/
│   └── db.js
├── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
🧰 Dependencies chính
express – Framework xây dựng web API

body-parser – Phân tích nội dung request

cors – Cho phép cross-origin requests

dotenv – Quản lý biến môi trường

mysql2 – Kết nối và truy vấn MySQL

jsonwebtoken – Tạo và xác thực JWT

bcryptjs – Mã hoá mật khẩu

nodemailer – Gửi email
```
