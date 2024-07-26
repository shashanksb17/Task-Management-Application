const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require('dotenv').config();
const UserModel = require("../Model/userModel");

const imageRoute = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "user_images",
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});

const upload = multer({ storage: storage });

imageRoute.post("/avatar", upload.single("image"), async (req, res) => {
    try {
        const userId = req.body.userId;
        const imageUrl = req.file.path;

        const user = await UserModel.findByIdAndUpdate(userId, { avatar: imageUrl }, { new: true });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Image uploaded successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = imageRoute;
