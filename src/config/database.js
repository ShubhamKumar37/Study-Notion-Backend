import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`DB connect successfully`);
    }
    catch (Error) {
        console.log("Error :: ", Error);
        process.exit(1); // Process refer to the current reference where our application is running
    }
}

export default dbConnect;