import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { signOut, getMe } from "../lib/api";

const HomePage = () => {
  const navigate = useNavigate();
  const { mutate: signOutMutate, isPending } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      navigate("/signin", { replace: true });
    },
  });

  useEffect(() => {
    getMe().catch(() => {
      navigate("/signin", { replace: true });
    });
  }, [navigate]);

  return (
    <div>
      <h2>Home</h2>
      <button
        onClick={() => signOutMutate()}
        disabled={isPending}
        className="py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2"
      >
        {isPending ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
};

export default HomePage;
