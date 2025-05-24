import React, { useState } from "react";

const ChangePasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    // Simulate the password change process (this would be an API call in a real app)
    setIsSubmitted(true);
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-primary items-start justify-center pt-42">
      <div className="w-full sm:w-1/2 md:w-2/3 max-w-md p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
          Change password
        </h2>
        {isSubmitted ? (
          <div className="text-center text-green-500 font-roboto">
            <p>Your password has been successfully changed!</p>
          </div>
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

            {error && (
              <div className="text-red-500 text-sm font-roboto">{error}</div>
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

export default ChangePasswordPage;
