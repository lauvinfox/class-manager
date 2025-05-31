import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../lib/api";

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const hasCalled = useRef(false);
  const { isSuccess, isError } = useQuery({
    queryKey: ["verifyEmail", code],
    queryFn: async () => {
      if (!code) throw new Error("Verification code is required");
      if (hasCalled.current) return null; // return null agar tidak undefined
      hasCalled.current = true;
      await verifyEmail(code);
      return true; // return true agar tidak undefined
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <div className="flex min-h-screen bg-primary items-start justify-center pt-42">
      {code ? (
        isSuccess ? (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-roboto font-bold text-center text-green-600">
              Verified successfully
            </h2>
            <button
              className="py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-roboto font-bold text-center text-red-500">
              Invalid or expired code
            </h2>
            <p className="text-sm text-font-primary text-center">
              The link is either invalid or expired.
            </p>
            <button
              className="py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
              onClick={() => navigate("/")}
            >
              Get a new link
            </button>
            <button
              className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        ) : null
      ) : (
        <div className="space-y-4 flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-y-1">
          <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
            We've already sent the code for you
          </h2>
          <p className="text-sm text-font-primary text-center">
            We have already sent the code for you. Check the confirmation code
            in your email. If you need to request a new code, go back and select
            confirm again.
          </p>
          <button
            className="py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
            onClick={() => navigate("/password/forget")}
          >
            Request new verification link
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationPage;
