import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Auth State Interface
 */
interface AuthState {
  // User data
  user: {
    id: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string | null;
    companyId: string | null;
    companyName: string | null;
    avatar: string | null;
  } | null;

  // Auth tokens
  accessToken: string | null;
  refreshToken: string | null;

  // Auth status
  isAuthenticated: boolean;
  isLoading: boolean;
  isVerifying: boolean;

  // Errors
  error: string | null;
  loginError: string | null;
  registerError: string | null;
  verifyEmailError: string | null;
  forgotPasswordError: string | null;
  resetPasswordError: string | null;
  changePasswordError: string | null;
  updateProfileError: string | null;
  uploadProfilePictureError: string | null;
  deleteProfilePictureError: string | null;
  uploadProfilePictureSuccess: boolean;
  deleteProfilePictureSuccess: boolean;
  sendVerificationEmailError: string | null;
  sendVerificationEmailSuccess: boolean;
  verifyEmailOtpError: string | null;
  verifyEmailOtpSuccess: boolean;

  // Success messages
  successMessage: string | null;
  forgotPasswordSuccess: boolean;
  verifyOtpSuccess: boolean;
  resetPasswordSuccess: boolean;
  userData: any | null;
  changePasswordSuccess: boolean;
  onboardingStepsData: any | null;
  onboardingApiLoading: boolean;
  onboardingApiSuccess: boolean;
  getCompanyInfoError: string | null;
  companyInfo: any | null;
  updateCompanyInfoError: string | null;
  updateCompanyInfoSuccess: boolean;
  teamMembers: any[] | null;
  getTeamMembersError: string | null;
  inviteTeamMemberError: string | null;
  inviteTeamMemberSuccess: boolean;
  updateTeamMemberError: string | null;
  updateTeamMemberSuccess: boolean;
  deleteTeamMemberError: string | null;
  deleteTeamMemberSuccess: boolean;
  workflows: any[] | null;
  getWorkflowsError: string | null;
}

/**
 * Initial State
 */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isVerifying: false,
  error: null,
  loginError: null,
  registerError: null,
  verifyEmailError: null,
  forgotPasswordError: null,
  resetPasswordError: null,
  changePasswordError: null,
  updateProfileError: null,
  uploadProfilePictureError: null,
  deleteProfilePictureError: null,
  uploadProfilePictureSuccess: false,
  deleteProfilePictureSuccess: false,
  sendVerificationEmailError: null,
  sendVerificationEmailSuccess: false,
  verifyEmailOtpError: null,
  verifyEmailOtpSuccess: false,
  successMessage: null,
  forgotPasswordSuccess: false,
  verifyOtpSuccess: false,
  resetPasswordSuccess: false,
  userData: null,
  changePasswordSuccess: false,
  onboardingStepsData: null,
  onboardingApiLoading: false,
  onboardingApiSuccess: false,
  getCompanyInfoError: null,
  companyInfo: null,
  updateCompanyInfoError: null,
  updateCompanyInfoSuccess: false,
  teamMembers: null,
  getTeamMembersError: null,
  inviteTeamMemberError: null,
  inviteTeamMemberSuccess: false,
  updateTeamMemberError: null,
  updateTeamMemberSuccess: false,
  deleteTeamMemberError: null,
  deleteTeamMemberSuccess: false,
  workflows: null,
  getWorkflowsError: null,
};

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login Reducers
    loginRequest: (state) => {
      state.isLoading = true;
      state.loginError = null;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.userData = action.payload.data;
      localStorage.setItem("token", action.payload.accessToken || action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.loginError = action.payload;
      state.error = action.payload;
    },
    signupRequest: (state) => {
      state.isLoading = true;
      state.registerError = null;
      state.error = null;
    },
    signupSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
    },
    signupFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.registerError = action.payload;
      state.error = action.payload;
    },
    // Forgot Password Reducers
    forgotPasswordRequest: (state) => {
      state.isLoading = true;
      state.forgotPasswordError = null;
      state.error = null;
      state.successMessage = null;
    },
    forgotPasswordSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.forgotPasswordSuccess = true;
      state.forgotPasswordError = null;
      state.successMessage = action.payload?.responseDescription || "Password reset code sent to your email.";
    },
    forgotPasswordFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.forgotPasswordError = action.payload;
      state.error = action.payload;
    },
    // Verify OTP Reducers
    verifyOtpRequest: (state) => {
      state.isVerifying = true;
      state.verifyEmailError = null;
      state.error = null;
    },
    verifyOtpSuccess: (state, action: PayloadAction<any>) => {
      state.isVerifying = false;
      state.verifyEmailError = null;
      state.verifyOtpSuccess = true;
      state.successMessage = action.payload?.responseDescription || "OTP verified successfully.";
    },
    verifyOtpFailure: (state, action: PayloadAction<any>) => {
      state.isVerifying = false;
      state.verifyEmailError = action.payload;
      state.error = action.payload;
    },
    // Reset Password Reducers
    resetPasswordRequest: (state) => {
      state.isLoading = true;
      state.resetPasswordError = null;
      state.error = null;
      state.successMessage = null;
    },
    resetPasswordSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Password reset successful. Please login.";
    },
    resetPasswordFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.resetPasswordError = action.payload;
      state.error = action.payload;
      state.resetPasswordSuccess = false;
    },
    // Change Password Reducers
    changePasswordRequest: (state) => {
      state.isLoading = true;
      state.changePasswordError = null;
      state.error = null;
      state.successMessage = null;
    },
    changePasswordSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Password changed successfully.";
    },
    changePasswordFailure: (state) => {
      state.isLoading = false;
      state.changePasswordError = null;
      state.error = null;
      state.changePasswordSuccess = false;
    },
    // Get Profile Reducers
    getProfileRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getProfileSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      // Update userData with the profile data from API response
      if (action.payload?.data) {
        state.userData = {
          ...state.userData,
          user: {
            ...state.userData?.user,
            ...action.payload.data,
          },
        };
      }
    },
    getProfileFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Upload Profile Picture Reducers
    uploadProfilePictureRequest: (state) => {
      state.isLoading = true;
      state.uploadProfilePictureError = null;
      state.error = null;
      state.uploadProfilePictureSuccess = false;
    },
    uploadProfilePictureSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.uploadProfilePictureError = null;
      state.uploadProfilePictureSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Profile picture uploaded successfully.";
      // Update user data if provided
      if (action.payload?.data) {
        state.userData = {
          ...state.userData,
          user: {
            ...state.userData?.user,
            ...action.payload.data,
          },
        };
      }
    },
    uploadProfilePictureFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.uploadProfilePictureError = action.payload;
      state.error = action.payload;
      state.uploadProfilePictureSuccess = false;
    },
    // Delete Profile Picture Reducers
    deleteProfilePictureRequest: (state) => {
      state.isLoading = true;
      state.deleteProfilePictureError = null;
      state.error = null;
      state.deleteProfilePictureSuccess = false;
    },
    deleteProfilePictureSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.deleteProfilePictureError = null;
      state.deleteProfilePictureSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Profile picture deleted successfully.";
      // Update user data if provided
      if (action.payload?.data) {
        state.userData = {
          ...state.userData,
          user: {
            ...state.userData?.user,
            ...action.payload.data,
          },
        };
      }
    },
    deleteProfilePictureFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.deleteProfilePictureError = action.payload;
      state.error = action.payload;
      state.deleteProfilePictureSuccess = false;
    },
    // Send Verification Email Reducers
    sendVerificationEmailRequest: (state) => {
      state.isLoading = true;
      state.sendVerificationEmailError = null;
      state.error = null;
      state.sendVerificationEmailSuccess = false;
    },
    sendVerificationEmailSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.sendVerificationEmailError = null;
      state.sendVerificationEmailSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Verification email sent successfully.";
    },
    sendVerificationEmailFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.sendVerificationEmailError = action.payload;
      state.error = action.payload;
      state.sendVerificationEmailSuccess = false;
    },
    // Verify Email OTP Reducers
    verifyEmailOtpRequest: (state) => {
      state.isLoading = true;
      state.verifyEmailOtpError = null;
      state.error = null;
      state.verifyEmailOtpSuccess = false;
    },
    verifyEmailOtpSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.verifyEmailOtpError = null;
      state.verifyEmailOtpSuccess = true;
      state.successMessage = action.payload?.responseDescription || "Email verified successfully.";
      // Update user data if provided
      if (action.payload?.data) {
        state.userData = {
          ...state.userData,
          user: {
            ...state.userData?.user,
            ...action.payload.data,
          },
        };
      }
    },
    verifyEmailOtpFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.verifyEmailOtpError = action.payload;
      state.error = action.payload;
      state.verifyEmailOtpSuccess = false;
    },
    // Update Profile Reducers
    updateProfileRequest: (state) => {
      state.isLoading = true;
      state.updateProfileError = null;
      state.error = null;
      state.successMessage = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.updateProfileError = null;
      state.successMessage = action.payload?.responseDescription || action.payload?.message || "Profile updated successfully.";
      // Update user data if provided
      if (action.payload?.data) {
        state.userData = {
          ...state.userData,
          user: {
            ...state.userData?.user,
            ...action.payload.data,
          },
        };
      }
    },
    updateProfileFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.updateProfileError = action.payload;
      state.error = action.payload;
    },
    clearAllForgotModals: (state) => {
      state.forgotPasswordSuccess = false;
      state.verifyOtpSuccess = false;
      state.resetPasswordSuccess = false;
    },
    setOnboardingStepsData: (state, action: PayloadAction<any>) => {
      state.onboardingStepsData = action.payload;
    },
    setOnboardingApiLoading: (state, action: PayloadAction<any>) => {
      state.onboardingApiLoading = action.payload;
    },
    setOnboardingApiSuccess: (state, action: PayloadAction<any>) => {
      state.onboardingApiSuccess = action.payload;
    },
    // Get Company Info Reducers
    getCompanyInfoRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.getCompanyInfoError = null;
    },
    getCompanyInfoSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.getCompanyInfoError = null;
      // Store company info data
      if (action.payload?.data) {
        state.companyInfo = action.payload.data;
      }
    },
    getCompanyInfoFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.getCompanyInfoError = action.payload;
    },
    // Update Company Info Reducers
    updateCompanyInfoRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.updateCompanyInfoError = null;
      state.updateCompanyInfoSuccess = false;
    },
    updateCompanyInfoSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.updateCompanyInfoError = null;
      state.updateCompanyInfoSuccess = true;
      // Update companyInfo with the new data
      if (action.payload?.data) {
        state.companyInfo = {
          ...state.companyInfo,
          ...action.payload.data,
        };
      }
    },
    updateCompanyInfoFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.updateCompanyInfoError = action.payload;
      state.updateCompanyInfoSuccess = false;
    },
    // Get Team Members Reducers
    getTeamMembersRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.getTeamMembersError = null;
    },
    getTeamMembersSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.getTeamMembersError = null;
      // Store team members data
      if (action.payload?.data && Array.isArray(action.payload.data)) {
        state.teamMembers = action.payload.data;
      }
    },
    getTeamMembersFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.getTeamMembersError = action.payload;
    },
    // Invite Team Member Reducers
    inviteTeamMemberRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.inviteTeamMemberError = null;
      state.inviteTeamMemberSuccess = false;
    },
    inviteTeamMemberSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.inviteTeamMemberError = null;
      state.inviteTeamMemberSuccess = true;
    },
    inviteTeamMemberFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.inviteTeamMemberError = action.payload;
      state.inviteTeamMemberSuccess = false;
    },
    // Update Team Member Reducers
    updateTeamMemberRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.updateTeamMemberError = null;
      state.updateTeamMemberSuccess = false;
    },
    updateTeamMemberSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.updateTeamMemberError = null;
      state.updateTeamMemberSuccess = true;
    },
    updateTeamMemberFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.updateTeamMemberError = action.payload;
      state.updateTeamMemberSuccess = false;
    },
    // Delete Team Member Reducers
    deleteTeamMemberRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.deleteTeamMemberError = null;
      state.deleteTeamMemberSuccess = false;
    },
    deleteTeamMemberSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.deleteTeamMemberError = null;
      state.deleteTeamMemberSuccess = true;
    },
    deleteTeamMemberFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.deleteTeamMemberError = action.payload;
      state.deleteTeamMemberSuccess = false;
    },
    // Get Workflows Reducers
    getWorkflowsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
      state.getWorkflowsError = null;
    },
    getWorkflowsSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = null;
      state.getWorkflowsError = null;
      // Store workflows data
      if (action.payload?.data) {
        state.workflows = action.payload.data;
      }
    },
    getWorkflowsFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.getWorkflowsError = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupRequest,
  signupSuccess,
  signupFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  verifyOtpRequest,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
  getProfileRequest,
  getProfileSuccess,
  getProfileFailure,
  uploadProfilePictureRequest,
  uploadProfilePictureSuccess,
  uploadProfilePictureFailure,
  deleteProfilePictureRequest,
  deleteProfilePictureSuccess,
  deleteProfilePictureFailure,
  sendVerificationEmailRequest,
  sendVerificationEmailSuccess,
  sendVerificationEmailFailure,
  verifyEmailOtpRequest,
  verifyEmailOtpSuccess,
  verifyEmailOtpFailure,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFailure,
  clearAllForgotModals,
  setOnboardingStepsData,
  setOnboardingApiLoading,
  setOnboardingApiSuccess,
  getCompanyInfoRequest,
  getCompanyInfoSuccess,
  getCompanyInfoFailure,
  updateCompanyInfoRequest,
  updateCompanyInfoSuccess,
  updateCompanyInfoFailure,
  getTeamMembersRequest,
  getTeamMembersSuccess,
  getTeamMembersFailure,
  inviteTeamMemberRequest,
  inviteTeamMemberSuccess,
  inviteTeamMemberFailure,
  updateTeamMemberRequest,
  updateTeamMemberSuccess,
  updateTeamMemberFailure,
  deleteTeamMemberRequest,
  deleteTeamMemberSuccess,
  deleteTeamMemberFailure,
  getWorkflowsRequest,
  getWorkflowsSuccess,
  getWorkflowsFailure,
} = authSlice.actions;
export default authSlice.reducer;

