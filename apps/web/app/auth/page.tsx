"use client";

import { useState } from "react";
import { useFormik } from "formik";
import Input from "@/components/input";
import Image from "next/image";
import Link from "next/link";
import {
  loginValidationSchema,
  type LoginFormValues,
} from "@/utils/validations";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "@/components/forgot-password-modal";
import VerifyEmailModal from "@/components/verify-email-modal";
import CreateNewPasswordModal from "@/components/create-new-password-modal";
import PasswordResetSuccessModal from "@/components/password-reset-success-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { clearAllForgotModals, resetPasswordFailure } from "@/Redux/reducers/auth";

const LoginPage = () => {
  const router = useRouter();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isVerifyEmailOpen, setIsVerifyEmailOpen] = useState(false);
  const [isCreatePasswordOpen, setIsCreatePasswordOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const {
    isLoading,
    isVerifying,
    forgotPasswordSuccess,
    verifyOtpSuccess,
    resetPasswordSuccess,
  } = useAppSelector((state) => state.auth);
  
  // Track previous verification state to detect successful completion
  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: (values) => {
      dispatch(authActions.loginRequest(values));
    },
  });

  const onCloseAllModals = () => {
    dispatch(clearAllForgotModals());
  }

  useEffect(() => {
    if (forgotPasswordSuccess) {
      setIsVerifyEmailOpen(true);
      setIsForgotPasswordOpen(false);
    }
  }, [forgotPasswordSuccess]);

  useEffect(() => {
    if (verifyOtpSuccess) {
      setIsCreatePasswordOpen(true);
      setIsVerifyEmailOpen(false);
    }
  }, [verifyOtpSuccess]);

  useEffect(() => {
    if (resetPasswordSuccess) {
      setIsSuccessOpen(true);
      setIsCreatePasswordOpen(false);
      dispatch(resetPasswordFailure(null))
    }
  }, [resetPasswordSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-[672px] flex flex-col items-center gap-[50px] px-8 pt-11 pb-8 rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Logo */}
        <div className="w-[263px] h-[94px] relative">
          <Image
            src="/images/worklighter-logo.png"
            alt="Worklighter Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Form Container */}
        <form
          onSubmit={formik.handleSubmit}
          className="w-full flex flex-col gap-6"
        >
          {/* Title and Inputs Container */}
          <div className="w-full flex flex-col gap-11">
            {/* Title Container */}
            <div className="w-full flex flex-col gap-0.5">
              <h1 className="text-[27px] leading-[1.5em] font-semibold text-primary font-poppins">
                Log in to Worklighter
              </h1>
            </div>

            {/* Input Container */}
            <div className="w-full flex flex-col gap-8">
              {/* Email Input */}
              <Input
                label="Email"
                type="email"
                placeholder="example@email.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                name="email"
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : undefined
                }
              />

              <div className="w-full flex flex-col gap-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  name="password"
                  error={
                    formik.touched.password && formik.errors.password
                      ? formik.errors.password
                      : undefined
                  }
                />
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="self-stretch cursor-pointer text-right justify-start text-primary text-base font-semibold font-poppins hover:opacity-80 transition-opacity"
              >
                Forgot Password?
              </button>
              </div>
            </div>
            {/* Password Input */}
          </div>

          {/* Button Container */}
          <div className="w-full flex flex-col gap-1">
            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full flex items-center h-12 justify-center gap-2 py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors font-poppins text-[17px] leading-[1.5em] font-semibold text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                formik.values.email === "" || formik.values.password === ""
              }
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>

            {/* Sign Up Link */}
            <div className="w-full flex items-center justify-center gap-2 py-2 px-3">
              <span className="text-[17px] leading-[1.5em] font-semibold text-primary cursor-pointer hover:opacity-80 transition-opacity font-poppins">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-primary-link">
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => {
          setIsForgotPasswordOpen(false);
          dispatch(authActions.clearAuthError());
          onCloseAllModals();
        }}
        onSendCode={(email) => {
          setResetEmail(email);
          dispatch(authActions.forgotPasswordRequest({ email }));
        }}
        isLoading={isLoading && isForgotPasswordOpen}
      />

      {/* Verify Email Modal */}
      <VerifyEmailModal
        isOpen={isVerifyEmailOpen}
        onClose={() => {
          setIsVerifyEmailOpen(false);
          setIsForgotPasswordOpen(true);
          dispatch(authActions.clearAuthError());
          onCloseAllModals();
        }}
        onVerify={(code) => {
          if (resetEmail && code) {
            dispatch(
              authActions.verifyOtpRequest({
                email: resetEmail,
                code: code,
              })
            );
          }
        }}
        onResend={() => {
          if (resetEmail) {
            dispatch(authActions.forgotPasswordRequest({ email: resetEmail }));
          }
        }}
        email={resetEmail}
        isVerifying={isVerifying}
        isResending={isLoading && isVerifyEmailOpen}
      />

      {/* Create New Password Modal */}
      <CreateNewPasswordModal
        isOpen={isCreatePasswordOpen}
        onClose={() => {
          setIsCreatePasswordOpen(false);
          dispatch(authActions.clearAuthError());
          onCloseAllModals();
        }}
        onResetPassword={(newPassword, confirmPassword) => {
          const token = resetPasswordToken || localStorage.getItem("resetPasswordToken");
          if (token && newPassword) {
            dispatch(
              authActions.resetPasswordRequest({
                resetPasswordToken: token,
                newPassword: newPassword,
              })
            );
          }
        }}
        isLoading={isLoading && isCreatePasswordOpen}
      />

      {/* Password Reset Success Modal */}
      <PasswordResetSuccessModal
        isOpen={isSuccessOpen}
        onGoToSignIn={() => {
          setIsSuccessOpen(false);
          setResetEmail("");
          setResetPasswordToken(null);
          localStorage.removeItem("resetPasswordToken");
          dispatch(authActions.clearAuthError());
          router.push("/auth");
          onCloseAllModals();
        }}
      />
    </div>
  );
};

export default LoginPage;

