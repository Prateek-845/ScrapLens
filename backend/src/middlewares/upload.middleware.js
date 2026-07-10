import multer from "multer";
import { AppError } from "../utils/errorHandler.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only images are allowed", 400), false);
  }
};

const upload = multer({ storage, fileFilter });

export const uploadSingleImage = upload.single("image");
