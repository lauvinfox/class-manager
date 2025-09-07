import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import EmailVerificationPage from "./pages/EmailVerification";
import ForgetPasswordPage from "./pages/ForgetPassword";
import ChangePasswordPage from "./pages/ResetPassword";
import Settings from "./pages/Settings";

import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import ProfilePage from "./pages/Profile";
import ClassPage from "./pages/Class";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/email/verify/" element={<EmailVerificationPage />} />
      <Route path="/email/verify/:code" element={<EmailVerificationPage />} />
      <Route path="/password/forget" element={<ForgetPasswordPage />} />
      <Route path="/password/reset" element={<ChangePasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/class/:classId" element={<ClassPage />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  );
}

export default App;
