import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  APP_ORIGIN: str(),
  GEONAMES_USERNAME: str(),
  GEONAMES_API_URL: str({
    default: "http://api.geonames.org",
  }),
});
