import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export type LoginFormValues = Yup.InferType<typeof loginValidationSchema>;

export const signupValidationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export type SignupFormValues = Yup.InferType<typeof signupValidationSchema>;

export const onboardingStep1ValidationSchema = Yup.object({
  companyName: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .required("Company name is required"),
  industry: Yup.string()
    .required("Industry is required"),
  companyAddress: Yup.string()
    .required("Company address is required"),
  city: Yup.string()
    .min(2, "City must be at least 2 characters")
    .required("City is required"),
  state: Yup.string()
    .required("State is required"),
  zipCode: Yup.string()
    .matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
    .required("ZIP code is required"),
  timezone: Yup.string()
    .required("Timezone is required"),
});

export type OnboardingStep1FormValues = Yup.InferType<typeof onboardingStep1ValidationSchema>;

