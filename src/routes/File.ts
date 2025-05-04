import multer from "multer";
import { Router } from "express";
import * as FileController from "$controllers/rest/FileController"
import * as AuthMiddleware from "$middlewares/AuthMiddleware"

const FileRoutes = Router({mergeParams:true});
const uploadMiddleware = multer({ dest: "uploads/" });

FileRoutes.get("/get", AuthMiddleware.authMiddleware, FileController.get)
FileRoutes.post("/upload", AuthMiddleware.authMiddleware, uploadMiddleware.single("file"), FileController.upload)

export default FileRoutes