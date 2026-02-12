"use client";

import React from "react";
import { useFormik } from "formik";
import Input from "@/components/input";
import Image from "next/image";
import Link from "next/link";
import { signupValidationSchema, type SignupFormValues } from "@/utils/validations";
import { authActions } from "@/Redux/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { Loader2 } from "lucide-react";
const SignUpPage = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const formik = useFormik<SignupFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: signupValidationSchema,
    onSubmit: (values) => {
      // Handle signup logic here
      const {confirmPassword, ...rest} = values
      dispatch(authActions.signupRequest(rest));
    },
  });

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
        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-6">
          {/* Header and Form Container */}
          <div className="w-full flex flex-col gap-11">
            {/* Header Container */}
            <div className="w-full flex flex-col gap-0.5">
              <h1 className="text-h3 text-primary">Welcome to Worklighter</h1>
              <p className="text-body-copy text-primary">
                Let&apos;s get you set up in less than 10 minutes
              </p>
            </div>

            {/* Form */}
            <div className="w-full flex flex-col gap-6">
              {/* Name Fields */}
              <div className="w-full flex gap-[20px]">
                <div className="flex-1">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    name="firstName"
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    error={formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : undefined}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Last Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    name="lastName"
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    error={formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : undefined}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="w-full">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Work Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  name="email"
                  labelStyle="supporting"
                  inputStyle="body-copy"
                  error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                />
              </div>

              {/* Password Fields */}
              <div className="w-full flex gap-[20px]">
                <div className="flex-1">
                  <Input
                    label="Create Password"
                    type="password"
                    placeholder="Create Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    name="password"
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    name="confirmPassword"
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Container */}
          <div className="w-full flex flex-col gap-1">
            {/* Continue Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center h-12 gap-2 py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
            </button>

            {/* Sign In Link */}
            <div className="w-full flex items-center justify-center gap-2 py-2 px-3">
              <span className="text-button text-primary cursor-pointer hover:opacity-80 transition-opacity">
                Already have an account?{" "}
                <Link href="/auth" className="text-primary-link">
                  Sign In
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;

