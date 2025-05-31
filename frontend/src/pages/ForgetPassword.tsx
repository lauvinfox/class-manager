import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { forgotPassword } from "../lib/api";

const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { mutate: forgotPasswordMutation, isPending } = useMutation({
    mutationFn: ({ email }: { email: string }) => forgotPassword(email),
    onSuccess: (data) => {
      console.log("Password reset link sent", data);
      setIsSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulasi pengiriman email untuk reset password
    forgotPasswordMutation({ email });
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
            className={`w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2 ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPending} // Menonaktifkan tombol ketika isPending true
          >
            {isPending ? (
              <div
                className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col space-y-1 items-center max-w-lg mx-auto">
          <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
            We've already sent the code for you
          </h2>
          <p className="text-sm text-font-primary text-center">
            We have already sent the code for you. Check the confirmation code
            in your email. If you need to request a new code, go back and select
            confirm again.
          </p>
        </div>
      )}
    </div>
  );
};

export default ForgetPasswordPage;
