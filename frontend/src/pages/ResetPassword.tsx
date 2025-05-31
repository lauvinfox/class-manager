import React from "react";
import { useSearchParams } from "react-router-dom";

import ResetPasswordForm from "../components/ResetPasswordForm";

const ChangePasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const exp = Number(searchParams.get("exp"));
  const now = Date.now();
  const linkIsValid = code && exp && exp > now;

  return (
    <div>
      {linkIsValid ? (
        <ResetPasswordForm code={code} />
      ) : (
        <div className="flex min-h-screen bg-primary items-center justify-center">
          <div className="w-full sm:w-1/2 md:w-2/3 max-w-md p-6 sm:p-8 space-y-6 bg-white rounded shadow">
            <h2 className="text-2xl font-roboto font-bold text-center text-font-primary mb-2">
              Invalid Link
            </h2>
            <p className="text-center text-red-500 font-roboto mb-4">
              The link is either invalid or expired.
            </p>
            <a
              href="/password/forget"
              className="block w-full text-center py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
            >
              Request a new password reset link
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePasswordPage;
