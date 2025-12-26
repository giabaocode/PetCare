// /routes/index.ts
import { Router } from "express";
import { authController } from "../controllers/authController";
import { userController } from "../controllers/userController";
import { packageController } from "../controllers/packageController";
import { invoiceController } from "../controllers/invoiceController";
import { petController } from "../controllers/petController";
import { serviceController } from "../controllers/serviceController";
import { dashboardController } from "../controllers/dashboardController";

const router = Router();

// --- 1. AUTH ---
router.post("/auth/login", authController.login);

// --- 2. USERS ---
router.post("/users/points", userController.addPoints);
router.get("/users/:maKH/pets", userController.getMyPets);
router.get("/users/:id", userController.getOne); // Lấy thông tin người dùng theo id
router.get("/users", userController.getAll); // Lấy tất cả người dùng

// --- 3. PACKAGES ---
router.get("/packages", packageController.getAll);
router.get("/packages/:id", packageController.getOne);
router.post("/packages/buy", packageController.buyPackage);
router.get("/packages/check/:petId", packageController.checkActivePackage);
router.post("/packages/use-benefit", packageController.useBenefit);

// --- 4. INVOICES ---
router.get("/invoices", invoiceController.getAll);
router.get("/invoices/:id", invoiceController.getOne);
router.post("/invoices", invoiceController.create);

// --- 5. PETS ---
router.get("/pets", petController.getAll);
router.get("/pets/:id", petController.getOne);
router.post("/pets", petController.create);
router.put("/pets/:id", petController.update);
router.delete("/pets/:id", petController.delete);

// --- 6. SERVICES & BOOKING ---
router.get("/branches", serviceController.getBranches);
router.post("/bookings", serviceController.createBooking);

// --- 7. DASHBOARD ---
router.get("/dashboard/stats", dashboardController.getStats);

export default router;
