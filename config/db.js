const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
        });
        console.log("MongoDB connection SUCCESS");
    }catch(err){
        console.error("MongoDB connection FAIL");
        process.exit(1);
    }
};

module.exports = connectDB;