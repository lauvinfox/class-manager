import app from "app";
import env from "@utils/env";

import mongoose from "mongoose";

mongoose
  .connect(env.MONGO_CONN_STRING)
  .then(() => {
    console.log("mongoose connected");
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  })
  .catch(console.error);
