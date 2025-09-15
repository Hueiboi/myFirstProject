# Coffee Shop POS System  

## Giới thiệu  
Dự án cá nhân xây dựng hệ thống POS (Point of Sale) cho quán cà phê.  
Mục tiêu: quản lý **menu, bàn, đơn hàng, thanh toán** cho staff và admin.  

## Công nghệ sử dụng  
- Backend: **Node.js + Express**  
- Database: **PostgreSQL**  
- Frontend: **HTML, TailwindCSS** (demo UI)  
- Công cụ test API: **Postman / Thunder Client**  
- Quản lý source: **Git** (workflow: `main`, `dev-v2`, feature branches)  

## Database 
- users (admin, staff, customer)
- tables (bàn tại quán)
- menu (món ăn/đồ uống, stock, giá)
- orders (đơn hàng)
- order_items (chi tiết món trong đơn)
- payments (lịch sử thanh toán)
- promotions (khuyến mãi)

## Chức năng dự kiến
### Admin
- Quản lý menu (CRUD món)
- Quản lý nhân viên & phân quyền
- Quản lý khuyến mãi

### Staff
- Quản lý bàn (check-in/check-out)
- Tạo & cập nhật đơn hàng
- Quản lý chi tiết món trong đơn
- Xử lý thanh toán

### Customer (future)
- Xem menu
- Đặt hàng online
- Thanh toán online

## Tiến độ
 - Refactor backend 
 - Test API 

## Lỗi và vấn đề đang mắc
1. Lỗi "Client has already been connected"
2. Chức năng sửa promotion
3. Chức năng kiểm tra tài khoản staff của admin
4. Thiếu kiểm tra gmail khi tạo tài khoản