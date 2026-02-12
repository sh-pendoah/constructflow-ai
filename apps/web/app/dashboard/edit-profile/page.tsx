"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Trash2, Lock, Check, Loader2, ArrowLeft } from "lucide-react";
import Input from "@/components/input";
import VerifyEmailModal from "@/components/verify-email-modal";
import ConfirmEmailModal from "@/components/confirm-email-modal";
import VerificationCodeModal from "@/components/verification-code-modal";
import VerificationSuccessModal from "@/components/verification-success-modal";
import SaveChangesModal from "@/components/save-changes-modal";
import UpdatePasswordModal from "@/components/update-password-modal";
import { useAppDispatch, useAppSelector } from "@/Redux/hooks";
import { authActions } from "@/Redux/actions/auth";
import { changePasswordFailure, sendVerificationEmailFailure, verifyEmailOtpFailure } from "@/Redux/reducers/auth";
import Link from "next/link";

const EditProfilePage = () => {
  const dispatch = useAppDispatch();
  const { 
    isLoading, 
    userData, 
    changePasswordSuccess, 
    updateProfileError,
    uploadProfilePictureSuccess,
    deleteProfilePictureSuccess,
    uploadProfilePictureError,
    deleteProfilePictureError,
    sendVerificationEmailSuccess,
    sendVerificationEmailError,
    verifyEmailOtpSuccess,
    verifyEmailOtpError
  } = useAppSelector((state) => state.auth);
  
  // Track specific loading states
  const isSendingVerificationEmail = isLoading && sendVerificationEmailSuccess === false && !sendVerificationEmailError;
  const isVerifyingOtp = isLoading && verifyEmailOtpSuccess === false && !verifyEmailOtpError;
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isDeletingPicture, setIsDeletingPicture] = useState(false);
  const [isConfirmEmailModalOpen, setIsConfirmEmailModalOpen] = useState(false);
  const [isVerifyEmailModalOpen, setIsVerifyEmailModalOpen] = useState(false);
  const [isVerificationCodeModalOpen, setIsVerificationCodeModalOpen] = useState(false);
  const [isVerificationSuccessModalOpen, setIsVerificationSuccessModalOpen] = useState(false);
  const [isSaveChangesModalOpen, setIsSaveChangesModalOpen] = useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);
  const [showChangePasswordCard, setShowChangePasswordCard] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const hasFetchedProfile = useRef(false);
  const hasRefetchedAfterVerification = useRef(false);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPicture(true);
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      const formData = new FormData();
      formData.append("profile_picture", file);
      dispatch(authActions.uploadProfilePictureRequest(formData));
    }
  };

  const handleRemoveImage = () => {
    setIsDeletingPicture(true);
    // Delete the profile picture from server
    dispatch(authActions.deleteProfilePictureRequest());
  };

  const handleSaveChanges = () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      // You can add toast notification here
      return;
    }

    // Set flag to track successful update
    setProfileUpdateSuccess(true);

    // Dispatch update profile action
    dispatch(
      authActions.updateProfileRequest({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
    );
  };

  // Initialize fields from userData when it's first loaded
  useEffect(() => {
    if (userData?.user && isInitialLoad) {
      setFirstName(userData.user.firstName || "");
      setLastName(userData.user.lastName || "");
      setEmail(userData.user.email || "");
      // Set profile image if available
      if (userData.user.profilePicImage) {
        setProfileImage(userData.user.profilePicImage);
      } else {
        // Set default placeholder if no image
        setProfileImage(null);
      }
      setIsInitialLoad(false);
    }
  }, [userData?.user?._id, isInitialLoad]); // Only depend on user ID, not the whole user object

  // Update fields after successful profile update
  useEffect(() => {
    if (profileUpdateSuccess && userData?.user && !isLoading && !updateProfileError) {
      // Update local state with new user data after successful save
      if (userData.user.firstName) setFirstName(userData.user.firstName);
      if (userData.user.lastName) setLastName(userData.user.lastName);
      setIsSaveChangesModalOpen(false);
      setProfileUpdateSuccess(false);
      dispatch(authActions.clearAuthError());
    }
  }, [profileUpdateSuccess, userData?.user?.firstName, userData?.user?.lastName, isLoading, updateProfileError, dispatch]);

  // Handle profile picture upload success
  useEffect(() => {
    if (uploadProfilePictureSuccess && !isLoading) {
      // Update profile image from userData if available (reducer already updated userData)
      setProfileImage(userData.user.profilePicImage);
      setIsUploadingPicture(false);
      dispatch(authActions.clearAuthError());
      // Don't refetch - reducer already updated userData with the response
    }
  }, [uploadProfilePictureSuccess, isLoading, userData?.user?.profilePicImage, dispatch]);

  // Handle profile picture upload failure
  useEffect(() => {
    if (uploadProfilePictureError && !isLoading) {
      setIsUploadingPicture(false);
      // Revert to previous image if upload failed
      if (userData?.user?.profilePicImage) {
        setProfileImage(userData.user.profilePicImage);
      } else {
        setProfileImage(null);
      }
    }
  }, [uploadProfilePictureError, isLoading, userData]);

  // Handle profile picture delete success
  useEffect(() => {
    if (deleteProfilePictureSuccess && !isLoading) {
      // Clear the profile image
      // setProfileImage(null);
      setIsDeletingPicture(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      dispatch(authActions.clearAuthError());
      // Don't refetch - reducer already updated userData with the response
    }
  }, [deleteProfilePictureSuccess, isLoading, dispatch]);

  // Handle profile picture delete failure
  useEffect(() => {
    if (deleteProfilePictureError && !isLoading) {
      setIsDeletingPicture(false);
    }
  }, [deleteProfilePictureError, isLoading]);


  const handleConfirmSaveChanges = () => {
    handleSaveChanges();
  };

  const handleChangePassword = () => {
    setShowChangePasswordCard(!showChangePasswordCard);
  };

  const handleUpdatePassword = () => {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      // You can add toast notification here
      return;
    }

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      // You can add toast notification here
      return;
    }

    // Dispatch change password action
    dispatch(
      authActions.changePasswordRequest({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      })
    );
  };

  // Handle change password success
  useEffect(() => {
    if (changePasswordSuccess) {
      // Reset form after successful update
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePasswordCard(false);
      setIsUpdatePasswordModalOpen(false);
      dispatch(authActions.clearAuthError());
      dispatch(changePasswordFailure())
    }
  }, [changePasswordSuccess, dispatch]);

  const handleConfirmUpdatePassword = () => {
    handleUpdatePassword();
  };

  const handleVerifyEmail = () => {
    setIsConfirmEmailModalOpen(true);
  };

  const handleSendVerification = (emailToVerify: string) => {
    // Dispatch send verification email action
    dispatch(authActions.sendVerificationEmailRequest({ email: emailToVerify }));
  };



  const handleVerifyCode = (code: string) => {
    // Dispatch verify email OTP action
    dispatch(authActions.verifyEmailOtpRequest({ 
      email: email, 
      otp: code 
    }));
  };

  const handleVerificationSuccess = () => {
    // Add your success logic here
    // You might want to update the email verification status in the UI
  };

  const handleResendCode = () => {
    // Resend verification email
    dispatch(authActions.sendVerificationEmailRequest({ email: email }));
  };

  // Handle send verification email success
  useEffect(() => {
    if (sendVerificationEmailSuccess && !isLoading) {
      setIsEmailVerificationSent(true);
      setIsConfirmEmailModalOpen(false);
      // Open verification code modal after successful send
      setTimeout(() => {
        setIsVerificationCodeModalOpen(true);
        dispatch(sendVerificationEmailFailure(false))
      }, 100);
      dispatch(authActions.clearAuthError());
    }
  }, [sendVerificationEmailSuccess, isLoading, dispatch]);

  // Handle verify email OTP success
  useEffect(() => {
    // Only run once when verification succeeds
    if (verifyEmailOtpSuccess && !hasRefetchedAfterVerification.current) {
      hasRefetchedAfterVerification.current = true;
      // Close verification code modal and open success modal
      setIsVerificationCodeModalOpen(false);
      setTimeout(() => {
        setIsVerificationCodeModalOpen(false)
        setIsVerificationSuccessModalOpen(true);
      }, 100);
      dispatch(verifyEmailOtpFailure(false))
      dispatch(authActions.clearAuthError());
      // Refetch profile to get updated verification status (only once)
      // The reducer already updates userData, but we refetch to ensure we have the latest data
      dispatch(authActions.getProfileRequest());
    }
  }, [verifyEmailOtpSuccess, dispatch]); // Only depend on verifyEmailOtpSuccess to prevent multiple runs

  // Reset refetch flag when verification success is reset (when user starts new verification)
  useEffect(() => {
    if (!verifyEmailOtpSuccess) {
      hasRefetchedAfterVerification.current = false;
    }
  }, [verifyEmailOtpSuccess]);
  return (
    <div className="w-full min-h-[calc(100vh-100px)] bg-[#F3F5F7] pb-4 sm:pb-8 pt-4 sm:pt-6 md:pt-8">
      <div className="w-full max-w-[672px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Page Header */}
        <Link
              href="/dashboard"
              className="flex items-center gap-2 mb-3 px-4 py-3 border border-[#8A949E] rounded-lg bg-white hover:text-white text-[#2E3338] hover:bg-black/80 transition-colors w-fit"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className=" font-poppins font-semibold">
                Back to Review Queue
              </span>
            </Link>
        <div className="flex flex-col gap-0.5 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-h3 text-primary font-poppins font-semibold">
            My Profile
          </h1>
          <p className="text-sm sm:text-body-copy text-primary font-sf-pro">
            Manage your personal account settings
          </p>
        </div>

        {/* Profile Info Container */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)] mb-4 sm:mb-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
            {/* Profile Image Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
              {/* Profile Image */}
              <div className="relative w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] flex-shrink-0">
                {(isUploadingPicture || isDeletingPicture) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full z-20">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                  </div>
                )}
                {profileImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#DEE0E3]">
                    <img
                      src={profileImage}
                      alt="Profile"
                      // fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#DEE0E3]">
                    <span className="text-2xl text-gray-500 font-semibold">
                      {firstName?.[0]?.toUpperCase() || userData?.user?.firstName?.[0]?.toUpperCase() || ""}
                      {lastName?.[0]?.toUpperCase() || userData?.user?.lastName?.[0]?.toUpperCase() || ""}
                    </span>
                  </div>
                )}
                {/* Camera Button Overlay - positioned at bottom-right */}
                <button
                  onClick={handleImageClick}
                  disabled={isUploadingPicture || isDeletingPicture}
                  className="absolute bottom-0 right-0 w-[28px] h-[28px] sm:w-[37px] sm:h-[37px] flex items-center justify-center bg-[#FFFFFF] rounded-full transition-colors cursor-pointer z-10 shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ transform: 'translate(0, 0)' }}
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </button>
                {/* Delete Button Overlay - positioned at top-right, only show when image exists */}
                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingPicture || isDeletingPicture}
                    className="absolute top-0 right-0 w-[28px] h-[28px] sm:w-[37px] sm:h-[37px] flex items-center justify-center bg-[#FFFFFF] rounded-full transition-colors cursor-pointer z-10 shadow-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ transform: 'translate(0, 0)' }}
                    title="Delete profile picture"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 flex flex-col gap-3 w-full sm:w-auto">
                {/* Name and Email Section with Verify Button */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                      <h2 className="text-lg sm:text-xl md:text-h3 text-[#000000] font-poppins font-semibold">
                        {userData?.user?.firstName || firstName} {userData?.user?.lastName || lastName}
                      </h2>
                      {/* Not Verified Tag - Show only if verification status is "not verified" */}
                      {userData?.user?.verification === "verified" ? 
                      <span className="px-2 sm:px-3 h-6 flex items-center justify-center bg-[#E6F7EC] border border-[#1F6F66] rounded-full w-fit">
                      <span className="text-xs sm:text-small text-[#1F6F66] font-sf-pro">
                        Verified
                      </span>
                    </span>
                      :  (
                        <span className="px-2 sm:px-3 h-6 flex items-center justify-center bg-[#FFF6E6] border border-[#F59E0B] rounded-full w-fit">
                          <span className="text-xs sm:text-small text-[#F59E0B] font-sf-pro">
                            Not Verified
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-body-copy text-[#000000] font-sf-pro">
                      {userData?.user?.email || email}
                    </p>
                  </div>
                  {/* Verify Email Button - positioned next to name/email section */}
                  {userData?.user?.verification === "verified" ? "" : <button
                    onClick={handleVerifyEmail}
                    disabled={userData?.user?.verification === "verified"}
                    className="h-[35px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 px-3 py-2 sm:py-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors flex-shrink-0 w-full sm:w-auto"
                  >
                    <span className="text-sm sm:text-button font-poppins font-semibold">
                      Verify Email
                    </span>
                  </button>}
                </div>

                {/* Job Title */}
                <p className="text-sm sm:text-label capitalize text-[#000000] font-sf-pro">
                  {userData?.user?.role || ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Container */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <h2 className="text-xl sm:text-2xl md:text-h3 text-primary font-poppins font-semibold">
            Personal Information
          </h2>

          {/* Personal Information Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)]">
            <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-11 px-4 sm:px-6 py-6 sm:py-8">
             

              {/* Form Fields */}
              <div className="flex flex-col gap-4 sm:gap-6 w-full">
                {/* Name Fields */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-1 w-full">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      name="firstName"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      name="lastName"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email Field with Error */}
                <div className="flex flex-col gap-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    labelStyle="supporting"
                    inputStyle="body-copy"
                    name="email"
                    readOnly
                    disabled={isEmailVerificationSent}
                    className="flex-1 w-full"
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs sm:text-supporting text-[#6F7A85] font-sf-pro">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="h-[44px] sm:h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 sm:py-5 px-3 border border-[#8A949E] text-[#2E3338] rounded-lg hover:bg-black/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <span className="text-sm sm:text-button font-poppins font-semibold">
                      Change Password
                    </span>
                  </button>
                  <button
                    onClick={() => setIsSaveChangesModalOpen(true)}
                    disabled={isLoading}
                    className="h-[44px] sm:h-[50px] cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 sm:py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm sm:text-button font-poppins font-semibold">
                          Saving...
                        </span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-button font-poppins font-semibold">
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Container */}
        {showChangePasswordCard && (
          <div className="flex flex-col gap-3 sm:gap-4 mt-8">
            <h2 className="text-xl sm:text-2xl md:text-h3 text-primary font-poppins font-semibold">
              Change Password
            </h2>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#DEE0E3] shadow-[0px_4px_8px_0px_rgba(135,159,171,0.3)]">
              <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-11 px-4 sm:px-6 py-6 sm:py-8">
                {/* Password Fields */}
                <div className="flex flex-col gap-4 sm:gap-6 w-full">
                  {/* Current Password */}
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      name="currentPassword"
                      placeholder="Enter current password"
                    />
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-2">
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      name="newPassword"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Confirm new password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      labelStyle="supporting"
                      inputStyle="body-copy"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Requirements Alert */}
                  <div className="flex flex-col gap-2 p-3 sm:p-4 bg-[#EBF3FF] border border-[#3B82F6] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-xs sm:text-supporting text-primary font-sf-pro">
                        Password Requirements:
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pl-6">
                      <div className="flex items-center gap-1">
                        <Check className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-xs sm:text-supporting text-[#03111F] font-sf-pro">
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-xs sm:text-supporting text-[#03111F] font-sf-pro">
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-xs sm:text-supporting text-[#03111F] font-sf-pro">
                          One number
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Password Button */}
                  <button
                    onClick={() => setIsUpdatePasswordModalOpen(true)}
                    disabled={
                      isLoading ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword
                    }
                    className="h-[44px] sm:h-[50px] cursor-pointer w-full flex items-center justify-center gap-2 py-3 sm:py-5 px-3 bg-[#1F6F66] text-[#F3F5F7] rounded-lg hover:bg-[#1a5d55] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm sm:text-button font-poppins font-semibold">
                          Updating...
                        </span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-button font-poppins font-semibold">
                        Update Password
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Email Modal */}
      <ConfirmEmailModal
        isOpen={isConfirmEmailModalOpen}
        onClose={() => setIsConfirmEmailModalOpen(false)}
        currentEmail={email}
        onSendVerification={handleSendVerification}
        isLoading={isLoading}
      />

      {/* Verify Email Modal */}
      <VerifyEmailModal
        isOpen={isVerifyEmailModalOpen}
        onClose={() => setIsVerifyEmailModalOpen(false)}
      />

      {/* Verification Code Modal */}
      <VerificationCodeModal
        isOpen={isVerificationCodeModalOpen}
        onClose={() => setIsVerificationCodeModalOpen(false)}
        email={email}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        isVerifying={isVerifyingOtp}
        isResending={isSendingVerificationEmail}
      />

      {/* Verification Success Modal */}
      <VerificationSuccessModal
        isOpen={isVerificationSuccessModalOpen}
        onClose={() => setIsVerificationSuccessModalOpen(false)}
        onConfirm={handleVerificationSuccess}
      />

      {/* Save Changes Modal */}
      <SaveChangesModal
        isOpen={isSaveChangesModalOpen}
        onClose={() => setIsSaveChangesModalOpen(false)}
        onConfirm={handleConfirmSaveChanges}
        isLoading={isLoading}
      />

      {/* Update Password Modal */}
      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
        onConfirm={handleConfirmUpdatePassword}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EditProfilePage;


