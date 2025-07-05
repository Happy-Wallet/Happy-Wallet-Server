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
npm install bcrypt bcryptjs body-parser cloudinary cors dotenv express jsonwebtoken multer mysql mysql2 nodemailer nodemon streamifier


⚙️ Tạo file .env
Tạo một file .env ở thư mục gốc và cấu hình như sau:

env
# Cấu hình MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=financialtrackingapp
JWT_SECRET=your_jwt_secret_key
# Cấu hình email (dùng để gửi mã khôi phục)
EMAIL_USER=hoanghaiyencbm@gmail.com
EMAIL_PASS=owlcyqucwcthczim

# JWT token secret
JWT_SECRET=your_jwt_secret_key

# Cổng server
PORT=3000

YOUR_CLOUD_NAME=dmutcpoey
YOUR_API_KEY=561217229222356
YOUR_API_SECRET=sBBJslheYSYDXSCBmwFbPJhMFbE

🛡️ Lưu ý: Không push file .env lên GitHub — hãy đảm bảo .gitignore có dòng *.env

🚀 Khởi động server
bash
node server.js
Server sẽ chạy tại địa chỉ: http://localhost:3000

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
