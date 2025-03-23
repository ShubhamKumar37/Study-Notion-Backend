import { app } from "./app.js";
import dbConnect from "./config/database.js";

dbConnect()
    .then(() => app.listen(process.env.PORT || 4000, () => console.log(`Server is running at http://localhost:${process.env.PORT || 4000}`)))
    .catch((error) => {
        console.log("There is a error in database connection :: ", error);
        process.exit(1);
    });

app.on("error", (error) => console.log("There is while initializing server :: ", error));