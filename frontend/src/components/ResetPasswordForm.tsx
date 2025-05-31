import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../lib/api";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ResetPasswordFormProps {
  code: string | null;
}

const ResetPasswordForm = ({ code }: ResetPasswordFormProps) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    mutate: resetUserPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: ({
      newPassword,
      code,
    }: {
      newPassword: string;
      code: string;
    }) => resetPassword(newPassword, code),
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  React.useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match");
    } else {
      setErrorMessage("");
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match");
      return;
    }
    if (code) {
      resetUserPassword({ newPassword, code });
    }
  };

  return (
    <div className="flex min-h-screen bg-primary items-start justify-center pt-42">
      <div className="w-full sm:w-1/2 md:w-2/3 max-w-md p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
          Change password
        </h2>
        {isSuccess ? (
          <>
            <div className="text-center text-green-500 font-roboto">
              <p>Your password has been successfully changed!</p>
            </div>
            <div className="w-full flex flex-col items-center gap-1">
              <button
                type="submit"
                onClick={() => navigate("/signin")} // Navigasi ke halaman sign in setelah sukses
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
                  "Sign in"
                )}
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 gap-2">
            <div>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="mt-1 block w-full px-4 py-2 pr-10 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
                required
              />
            </div>

            <div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="mt-1 block w-full px-4 py-2 pr-10 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
                required
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm font-roboto">
                {errorMessage}
              </div>
            )}

            {isError && (
              <div className="text-red-500 text-sm font-roboto">
                {error ? error.message : "An error occurred"}
              </div>
            )}

            <button
              type="submit"
              className="w-full lg:w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
            >
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
