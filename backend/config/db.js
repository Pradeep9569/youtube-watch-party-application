import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    // Log the reason (never the connection string) and stop so Render restarts/flags the deploy.
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
