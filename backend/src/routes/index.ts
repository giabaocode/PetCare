import { Router } from "express";
import { authController } from "../controllers/authController";
import { userController } from "../controllers/userController";
import { packageController } from "../controllers/packageController";
import { invoiceController } from "../controllers/invoiceController";
import { petController } from "../controllers/petController";
import { serviceController } from "../controllers/serviceController";
import { dashboardController } from "../controllers/dashboardController";
import { productController } from "../controllers/productController";
// 👇 Import thêm verifyAdmin nếu chưa có
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware";
import { feedbackController } from "../controllers/feedbackController";

const router = Router();

// --- 1. AUTH ---
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);

// --- 2. USERS ---
router.post(
  "/users/staff",
  verifyToken,
  verifyAdmin,
  userController.createStaff
);
router.post("/users/points", verifyToken, userController.addPoints);
router.get("/users/my-pets", verifyToken, userController.getMyPets);
router.get("/users/profile", verifyToken, userController.getProfile);
router.get(
  "/users/doctors/:branchId",
  verifyToken,
  userController.getDoctorsByBranch
);
router.get("/users/:maKH/pets", verifyToken, userController.getMyPets);
router.get(
  "/users/:id/work-history",
  verifyToken,
  userController.getBranchHistory
);

// 👇 THÊM MỚI: Route cho Update & Delete Staff
// Đặt trước route /users/:id để tránh conflict (dù khác method nhưng đặt gần nhau cho dễ quản lý)
router.put("/users/:id", verifyToken, verifyAdmin, userController.updateStaff);
router.delete(
  "/users/:id",
  verifyToken,
  verifyAdmin,
  userController.deleteUser
);

router.get("/users/:id", verifyToken, userController.getOne);
router.get("/users", verifyToken, userController.getAll);

// --- 3. PACKAGES ---
router.get("/packages", packageController.getAll);
router.get("/packages/:id", packageController.getOne);
router.post("/packages/buy", verifyToken, packageController.buyPackage);
router.get(
  "/packages/check/:petId",
  verifyToken,
  packageController.checkActivePackage
);
router.post("/packages/use-benefit", verifyToken, packageController.useBenefit);

// --- 4. INVOICES ---
// 1. Lấy lịch sử
router.get(
  "/invoices/my-history",
  verifyToken,
  invoiceController.getMyInvoices
);

// 2. Lấy theo Booking
router.get(
  "/invoices/booking/:bookingId",
  verifyToken,
  invoiceController.getInvoiceByBooking
);

// 👇 THÊM MỚI: Route Thanh toán (Để fix lỗi cộng điểm)
// Cần khớp với hàm payInvoice đã thêm vào controller trước đó
router.post("/invoices/:id/pay", verifyToken, invoiceController.payInvoice);

// 3. Lấy chi tiết (Đặt cuối cùng)
router.get("/invoices/:id", verifyToken, invoiceController.getOne);

// --- 5. PETS ---
router.get("/pets", verifyToken, petController.getAll);
router.get("/pets/:id", verifyToken, petController.getOne);
router.post("/pets", verifyToken, petController.create);
router.put("/pets/:id", verifyToken, petController.update);
router.delete("/pets/:id", verifyToken, petController.delete);

// --- 6. SERVICES & BOOKING ---
router.get("/branches", serviceController.getBranches);
router.get(
  "/bookings/my-history",
  verifyToken,
  serviceController.getMyAppointments
);
router.post("/bookings", verifyToken, serviceController.createBooking);
router.get(
  "/bookings/branch",
  verifyToken,
  serviceController.getBranchAppointments
);
router.put("/bookings/:id/status", verifyToken, serviceController.updateStatus);

// --- 7. DASHBOARD ---
router.get(
  "/dashboard/stats",
  verifyToken,
  verifyAdmin,
  dashboardController.getStats
);

router.get("/dashboard/chart", verifyToken, dashboardController.getChartData);

// --- 8. PRODUCTS ---
router.get("/products", verifyToken, productController.getAll);
router.post("/products/import", verifyToken, productController.importStock);

// --- 9. FEEDBACK ---
router.post("/feedback", verifyToken, feedbackController.create);
router.get("/feedback", verifyToken, verifyAdmin, feedbackController.getAll);

export default router;
