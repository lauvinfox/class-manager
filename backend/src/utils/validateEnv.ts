import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
  MONGO_CONN_STRING: str(),
  PORT: port(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
});
