import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import EmailVerificationPage from "./pages/EmailVerification";
import ForgetPasswordPage from "./pages/ForgetPassword";
import ChangePasswordPage from "./pages/ResetPassword";

export const Home = () => {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
};

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
    </Routes>
  );
}

export default App;
