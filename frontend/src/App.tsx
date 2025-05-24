import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import EmailVerificationPage from "./pages/EmailVerification";
import ForgetPasswordPage from "./pages/ForgetPassword";
import ChangePasswordPage from "./pages/ChangePassword";

export const Home = () => {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
      <Route path="/email/verification" element={<EmailVerificationPage />} />
      <Route path="/password/forget" element={<ForgetPasswordPage />} />
      <Route path="/password/change" element={<ChangePasswordPage />} />
    </Routes>
  );
}

export default App;
