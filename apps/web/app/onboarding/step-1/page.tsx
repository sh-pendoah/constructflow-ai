'use client';

import FileUpload from '@/components/file-upload';
import Input from '@/components/input';
import ProgressBar from '@/components/progress-bar';
import Select from '@/components/select';
import authActions from '@/Redux/actions/auth';
import { useAppSelector } from '@/Redux/hooks';
import { setOnboardingApiSuccess } from '@/Redux/reducers/auth';
import { RootState } from '@/Redux/store';
import { Cities, States } from '@/utils/enums/locations';
import {
  onboardingStep1ValidationSchema,
  type OnboardingStep1FormValues,
} from '@/utils/validations';
import { useFormik } from 'formik';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const cookies = parseCookies();
const OnboardingStep1 = () => {
  const router = useRouter();
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const { onboardingApiSuccess, onboardingApiLoading } = useAppSelector(
    (state: RootState) => state.auth
  );

  const dispatch = useDispatch();
  const auth_token = cookies.auth_token;
  const formik = useFormik<OnboardingStep1FormValues>({
    initialValues: {
      companyName: '',
      industry: '',
      companyAddress: '',
      city: '',
      state: '',
      zipCode: '',
      timezone: '',
    },
    validationSchema: onboardingStep1ValidationSchema,
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('companyName', values.companyName || '');
      formData.append('industry', values.industry);
      formData.append('companyAddress', values.companyAddress || '');
      formData.append('city', values.city || '');
      formData.append('state', values.state || '');
      formData.append('companyLogo', companyLogo || '');
      formData.append('zipCode', values.zipCode || '');
      formData.append('timezone', values.timezone || '');
      formData.append('step', '1');
      dispatch(authActions.onboardingApiRequest(formData));
    },
  });

  useEffect(() => {
    if (onboardingApiSuccess) {
      router.push('/onboarding/step-2');
      dispatch(setOnboardingApiSuccess(false));
    }
  }, [onboardingApiSuccess]);

  const handleFileSelect = (file: File | null) => {
    setCompanyLogo(file);
    // Handle file upload
  };

  useEffect(() => {
    if (!auth_token) {
      router.push('/auth');
    }
  }, [auth_token]);

  // Sample options - replace with actual data
  const industryOptions = [
    { value: 'tech', label: 'Technology' },
    { value: 'retail', label: 'Retail' },
    { value: 'healthcare', label: 'Healthcare' },
  ];

  // Convert Cities enum to options array
  const cityOptions = Object.values(Cities).map((city) => ({
    value: city,
    label: city,
  }));

  // Convert States enum to options array
  const stateOptions = Object.values(States).map((state) => ({
    value: state.toLowerCase(),
    label: state,
  }));

  const timezoneOptions = [
    { value: 'pst', label: 'Pacific Standard Time (PST)' },
    { value: 'est', label: 'Eastern Standard Time (EST)' },
    { value: 'cst', label: 'Central Standard Time (CST)' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-2xl flex flex-col gap-8 sm:gap-[50px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 md:pt-11 pb-6 sm:pb-8 rounded-xl sm:rounded-2xl border border-custom bg-white-custom shadow-md-custom">
        {/* Container */}
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="w-full flex items-center gap-4 sm:gap-8">
            <h2 className="text-label text-primary">Company Setup</h2>
          </div>

          {/* Progress and Content Container */}
          <div className="w-full flex flex-col gap-6 sm:gap-8 md:gap-11">
            {/* Progress Bar */}
            <ProgressBar currentStep={1} totalSteps={7} />

            {/* Content Container */}
            <div className="w-full flex flex-col gap-6 sm:gap-8">
              {/* Title Section */}
              <div className="w-full flex flex-col gap-0.5">
                <h1 className="text-[22px] sm:text-[24px] md:text-h3 leading-[1.5em] font-semibold text-primary font-poppins">
                  Tell Us About Your Company
                </h1>
                <p className="text-body-copy text-primary">
                  Basic information to set up your account.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={formik.handleSubmit}
                className="w-full flex flex-col gap-4 sm:gap-6"
                noValidate
              >
                {/* Form Row - Company Name and Industry */}
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-5">
                  <div className="flex-1 w-full">
                    <Input
                      label="Company Name"
                      type="text"
                      placeholder="Company Name"
                      value={formik.values.companyName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="companyName"
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      error={
                        formik.touched.companyName && formik.errors.companyName
                          ? formik.errors.companyName
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <Select
                      label="Industry / Trade"
                      placeholder="Industry / Trade"
                      value={formik.values.industry}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="industry"
                      labelStyle="supporting"
                      options={industryOptions}
                      error={
                        formik.touched.industry && formik.errors.industry
                          ? formik.errors.industry
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Company Address */}
                <div className="w-full">
                  <Input
                    label="Company Address"
                    type="text"
                    placeholder="Company Address"
                    value={formik.values.companyAddress}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    name="companyAddress"
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    error={
                      formik.touched.companyAddress &&
                      formik.errors.companyAddress
                        ? formik.errors.companyAddress
                        : undefined
                    }
                  />
                </div>

                {/* Form Row - City and State */}
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-5">
                  <div className="flex-1 w-full">
                    <Select
                      label="City"
                      placeholder="City"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="city"
                      labelStyle="supporting"
                      options={cityOptions}
                      error={
                        formik.touched.city && formik.errors.city
                          ? formik.errors.city
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <Select
                      label="State"
                      placeholder="State"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="state"
                      labelStyle="supporting"
                      options={stateOptions}
                      error={
                        formik.touched.state && formik.errors.state
                          ? formik.errors.state
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Form Row - ZIP Code and Timezone */}
                <div className="w-full flex flex-col md:flex-row gap-4 md:gap-5">
                  <div className="flex-1 w-full">
                    <Input
                      label="ZIP Code"
                      type="text"
                      placeholder="ZIP Code"
                      value={formik.values.zipCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="zipCode"
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      error={
                        formik.touched.zipCode && formik.errors.zipCode
                          ? formik.errors.zipCode
                          : undefined
                      }
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <Select
                      label="Timezone"
                      placeholder="Timezone"
                      value={formik.values.timezone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      name="timezone"
                      labelStyle="supporting"
                      options={timezoneOptions}
                      error={
                        formik.touched.timezone && formik.errors.timezone
                          ? formik.errors.timezone
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Logo Upload Section */}
                <FileUpload
                  label="Company Logo (Optional)"
                  heading="Upload OR Drag & Drop"
                  bodyText="Recommended: 200x200px PNG"
                  accept="image/*"
                  onFileSelect={(file) => handleFileSelect(file as File)}
                />

                {/* Continue Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center h-12 gap-2 py-4 sm:py-5 px-3 rounded-lg bg-primary hover:bg-primary-hover transition-colors text-button text-primary-button cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={onboardingApiLoading}
                >
                  {onboardingApiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1;
