import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  APP_ORIGIN: str(),
  VITE_API_URL: str(),
});
