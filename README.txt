ENGZI — BẢN NÂNG CẤP AUTH + HƯỚNG DẪN CHẠY
================================================

GIỮ LẠI TỪ DỰ ÁN GỐC
- Onboarding: tên, ngôn ngữ, biết đến Engzi, mục tiêu, trình độ.
- Bài kiểm tra đầu vào 30 câu và cây học tập hiện có.
- Hệ thống bài học, ôn tập, thống kê, giao diện AI Gemini và các API hiện có.
- Java 17, Spring Boot 3.5.5, H2/JPA.

BỔ SUNG TRONG BẢN NÀY
- Đăng ký tài khoản bằng email + mật khẩu Engzi.
- Mật khẩu lưu dưới dạng BCrypt hash, không lưu mật khẩu dạng chữ thường.
- Đăng nhập email/mật khẩu tạo session phía máy chủ.
- Nút Tiếp tục với Google qua OAuth2/OIDC; tài khoản Google cần email đã được xác minh.
- Giao diện đăng nhập/đăng ký mới và các nút truy cập từ màn hình chào mừng.
- Sửa import CrossOrigin còn thiếu trong PlacementController.

CHẠY LOCAL
1. Cài Java 17 và Maven.
2. Mở PowerShell tại thư mục có pom.xml.
3. Chạy: mvn spring-boot:run
4. Mở: http://localhost:8080

ĐĂNG NHẬP EMAIL
- Đăng ký bằng email và mật khẩu Engzi tối thiểu 8 ký tự.
- Đăng nhập bằng cùng email/mật khẩu. Đây KHÔNG phải mật khẩu Google của bạn.
- H2 lưu dữ liệu theo cấu hình mặc định hiện tại của dự án. Nếu chưa bật file-based DB, dữ liệu có thể mất khi khởi động lại.

CẤU HÌNH GOOGLE OAUTH2 (BẮT BUỘC ĐỂ NÚT GOOGLE HOẠT ĐỘNG THẬT)
1. Mở Google Cloud Console và tạo/chọn project.
2. Thiết lập OAuth consent screen và tạo OAuth Client ID loại Web application.
3. Authorized JavaScript origin: http://localhost:8080
4. Authorized redirect URI: http://localhost:8080/login/oauth2/code/google
5. Đặt hai biến môi trường trước khi chạy ứng dụng. PowerShell:
   $env:GOOGLE_CLIENT_ID="CLIENT_ID_CUA_BAN"
   $env:GOOGLE_CLIENT_SECRET="CLIENT_SECRET_CUA_BAN"
   mvn spring-boot:run
6. Không đưa client secret lên GitHub và không gửi secret trong cuộc trò chuyện.

AI GEMINI
Để hội thoại AI hoạt động, đặt API key trong PowerShell trước khi chạy:
   $env:GEMINI_API_KEY="API_KEY_CUA_BAN"
Có thể đặt model bằng GEMINI_MODEL; mặc định gemini-2.5-flash. Không đặt API key trong HTML/JS.

LƯU Ý
- Nút Google sẽ không hoạt động cho đến khi bạn tự cấu hình client ID/secret hợp lệ.
- Bản nâng cấp này chưa biến toàn bộ dữ liệu tiến độ localStorage thành dữ liệu đồng bộ theo tài khoản; việc đồng bộ tiến độ giữa các thiết bị là giai đoạn kế tiếp.
- Trước khi triển khai công khai, cần bật CSRF protection phù hợp, HTTPS, chính sách quyền riêng tư và kiểm thử bảo mật đầy đủ.
