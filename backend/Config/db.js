const mongoose = require('mongoose');
require('dotenv').config();

const connectToServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_DATABASE_SITE_LINK);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 
    }
};

module.exports = connectToServer;
