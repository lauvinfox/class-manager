import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSquare, FaCheckSquare } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../lib/api";

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [dateOfBirth, setDateOfBirth] = useState<string>("");

  const [isChecked, setIsChecked] = useState(false);

  const { mutate: signUp, isPending } = useMutation({
    mutationFn: ({
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      dateOfBirth,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      password: string;
      confirmPassword: string;
      dateOfBirth: string;
    }) =>
      registerUser(
        firstName,
        lastName,
        email,
        username,
        password,
        confirmPassword,
        dateOfBirth
      ),
    onSuccess: (data) => {
      console.log("Register successful", data);
      navigate("/email/verify", { replace: true });
    },
  });

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp({
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword,
      dateOfBirth,
    });
  };

  // Validasi semua field harus terisi dan isChecked true
  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    username.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    dateOfBirth.trim() &&
    isChecked;

  return (
    <div className="flex min-h-screen bg-primary items-center justify-center">
      <form
        onSubmit={handleSignUpSubmit}
        className="space-y-4 flex flex-col items-center justify-center w-full max-w-lg mx-auto"
      >
        <div className="flex flex-col space-y-1 items-center">
          <h2 className="text-2xl font-roboto font-bold text-center text-font-primary">
            Sign up
          </h2>
          <p className="text-sm text-font-primary">
            Please fill the form to create your account!
          </p>
        </div>
        <div className="w-full flex flex-row items-center justify-center gap-x-4">
          <input
            type="firstName"
            id="firstName"
            className="mt-1 block w-full sm:w-3/4 lg:w-[48%] px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
            value={firstName}
            placeholder="First name"
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="lastName"
            id="lastName"
            className="mt-1 block w-full sm:w-3/4 lg:w-[48%] px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
            value={lastName}
            placeholder="Last name"
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full sm:w-3/4 lg:w-full px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
          value={email}
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="username"
          id="username"
          className="mt-1 block w-full sm:w-3/4 lg:w-full px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
          value={username}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <div className="w-full flex flex-row items-center justify-center gap-x-4">
          <div className="relative w-full sm:w-2/3">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="mt-1 block w-full px-4 py-2 pr-10 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-form-font hover:text-form-font-focus"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative w-full sm:w-2/3">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="mt-1 block w-full px-4 py-2 pr-10 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
              value={confirmPassword}
              placeholder="Confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-form-font hover:text-form-font-focus"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <input
          type="date"
          id="dateOfBirth"
          className="mt-1 block w-full sm:w-3/4 lg:w-full px-4 py-2 border border-none bg-form-bg text-form-font rounded-md focus:outline-none focus:ring-2 focus:ring-form-border-focus focus:text-form-font-focus"
          value={dateOfBirth}
          placeholder="dateOfBirth"
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCheckboxChange}
            className="bg-form-font-focus text-form-bg hover:text-form-bg-focus focus:outline-none focus:ring-2"
            id="checkbox"
          >
            {isChecked ? <FaCheckSquare size={20} /> : <FaSquare size={20} />}
          </button>
          <label htmlFor="checkbox" className="text-sm">
            By signing up, you consent to your data being recorded and stored
          </label>
        </div>
        <button
          type="submit"
          className={`w-full sm:w-2/3 py-2 px-4 bg-button-primary text-white font-semibold rounded-md hover:bg-button-primary-hover focus:outline-none focus:ring-2  ${
            isChecked && isFormValid && !isPending
              ? ""
              : "opacity-50 cursor-not-allowed"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={!isFormValid || isPending}
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
            "Sign up"
          )}
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;
