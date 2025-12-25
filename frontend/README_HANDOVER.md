# Frontend Handover Guide

## 1. Dành cho Backend Developer

- **Quan trọng nhất:** Hãy xem file `src/types/schema.ts`. Đây là cấu trúc JSON mà Frontend mong muốn nhận được từ API.
- **Auth:** Tôi đang hardcode token trong `src/context/AuthContext.tsx`. Khi có API Login, sẽ thay thế đoạn này.
- **API Endpoints:** Xem trong thư mục `src/api/` để biết danh sách các API dự kiến gọi.

## 2. Cách chạy thử

1. `npm install`
2. `npm run dev`
3. Đăng nhập: Bấm nút "Portal Bác sĩ" hoặc vào thẳng Dashboard (đã auto login).
