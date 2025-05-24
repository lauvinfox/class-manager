import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [forgetPasswordCode, setForgetPasswordCode] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi pengiriman email untuk reset password
    setIsSubmitted(true);
  };

  const handleContinueSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/password/change");
  };

  return (
    <div className="flex min-h-screen bg-primary items-start justify-center pt-42">
      {!isSubmitted ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-y-2"
        >
          <div className="flex flex-col space-y-1 items-center">
            <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
              Forgot password
            </h2>
            <p className="text-sm text-font-primary">
              Enter the email associated with your account to change the
              password.
            </p>
          </div>
          <div className="w-full flex flex-col items-center gap-1">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 block w-full sm:w-2/3 px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
          >
            Send Reset Link
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-y-2"
        >
          <div className="flex flex-col space-y-1 items-center">
            <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
              We've already sent the code for you
            </h2>
            <p className="text-sm text-font-primary text-center">
              We have already sent the code for you. Check the confirmation code
              in your email. If you need to request a new code, go back and
              select confirm again.
            </p>
          </div>
          <div className="w-full flex flex-col items-center gap-1">
            <input
              type="text"
              id="forgetPasswordCode"
              value={forgetPasswordCode}
              onChange={(e) => setForgetPasswordCode(e.target.value)}
              placeholder="Enter your code"
              className="mt-1 block w-full sm:w-2/3 px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
            onClick={handleContinueSubmit}
          >
            Continue
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgetPasswordPage;
