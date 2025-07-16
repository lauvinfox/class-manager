import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
  MONGO_CONN_STRING: str(),
  PORT: port(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  NODE_ENV: str(),
  RESEND_API_KEY: str(),
  APP_ORIGIN: str(),
  EMAIL_SENDER: str(),
  OPENAI_API_KEY: str(),
});
