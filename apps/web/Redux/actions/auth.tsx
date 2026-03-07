/**
 * Auth Action Types
 */
export const AUTH_ACTION_TYPES = {
  // Login Actions
  LOGIN_REQUEST: "auth/LOGIN_REQUEST",
  LOGIN_SUCCESS: "auth/LOGIN_SUCCESS",
  LOGIN_FAILURE: "auth/LOGIN_FAILURE",
  SIGNUP_REQUEST: "auth/SIGNUP_REQUEST",
  SIGNUP_SUCCESS: "auth/SIGNUP_SUCCESS",
  SIGNUP_FAILURE: "auth/SIGNUP_FAILURE",
  // Forgot Password Actions
  FORGOT_PASSWORD_REQUEST: "auth/FORGOT_PASSWORD_REQUEST",
  FORGOT_PASSWORD_SUCCESS: "auth/FORGOT_PASSWORD_SUCCESS",
  FORGOT_PASSWORD_FAILURE: "auth/FORGOT_PASSWORD_FAILURE",
  // Verify OTP Actions
  VERIFY_OTP_REQUEST: "auth/VERIFY_OTP_REQUEST",
  VERIFY_OTP_SUCCESS: "auth/VERIFY_OTP_SUCCESS",
  VERIFY_OTP_FAILURE: "auth/VERIFY_OTP_FAILURE",
  // Reset Password Actions
  RESET_PASSWORD_REQUEST: "auth/RESET_PASSWORD_REQUEST",
  RESET_PASSWORD_SUCCESS: "auth/RESET_PASSWORD_SUCCESS",
  RESET_PASSWORD_FAILURE: "auth/RESET_PASSWORD_FAILURE",
  // Change Password Actions
  CHANGE_PASSWORD_REQUEST: "auth/CHANGE_PASSWORD_REQUEST",
  CHANGE_PASSWORD_SUCCESS: "auth/CHANGE_PASSWORD_SUCCESS",
  CHANGE_PASSWORD_FAILURE: "auth/CHANGE_PASSWORD_FAILURE",
  // Get Profile Actions
  GET_PROFILE_REQUEST: "auth/GET_PROFILE_REQUEST",
  GET_PROFILE_SUCCESS: "auth/GET_PROFILE_SUCCESS",
  GET_PROFILE_FAILURE: "auth/GET_PROFILE_FAILURE",
  // Upload Profile Picture Actions
  UPLOAD_PROFILE_PICTURE_REQUEST: "auth/UPLOAD_PROFILE_PICTURE_REQUEST",
  UPLOAD_PROFILE_PICTURE_SUCCESS: "auth/UPLOAD_PROFILE_PICTURE_SUCCESS",
  UPLOAD_PROFILE_PICTURE_FAILURE: "auth/UPLOAD_PROFILE_PICTURE_FAILURE",
  // Delete Profile Picture Actions
  DELETE_PROFILE_PICTURE_REQUEST: "auth/DELETE_PROFILE_PICTURE_REQUEST",
  DELETE_PROFILE_PICTURE_SUCCESS: "auth/DELETE_PROFILE_PICTURE_SUCCESS",
  DELETE_PROFILE_PICTURE_FAILURE: "auth/DELETE_PROFILE_PICTURE_FAILURE",
  // Send Verification Email Actions
  SEND_VERIFICATION_EMAIL_REQUEST: "auth/SEND_VERIFICATION_EMAIL_REQUEST",
  SEND_VERIFICATION_EMAIL_SUCCESS: "auth/SEND_VERIFICATION_EMAIL_SUCCESS",
  SEND_VERIFICATION_EMAIL_FAILURE: "auth/SEND_VERIFICATION_EMAIL_FAILURE",
  // Verify Email OTP Actions
  VERIFY_EMAIL_OTP_REQUEST: "auth/VERIFY_EMAIL_OTP_REQUEST",
  VERIFY_EMAIL_OTP_SUCCESS: "auth/VERIFY_EMAIL_OTP_SUCCESS",
  VERIFY_EMAIL_OTP_FAILURE: "auth/VERIFY_EMAIL_OTP_FAILURE",
  // Update Profile Actions
  UPDATE_PROFILE_REQUEST: "auth/UPDATE_PROFILE_REQUEST",
  UPDATE_PROFILE_SUCCESS: "auth/UPDATE_PROFILE_SUCCESS",
  UPDATE_PROFILE_FAILURE: "auth/UPDATE_PROFILE_FAILURE",
  // Onboarding Actions
  ONBOARDING_API_REQUEST: "auth/ONBOARDING_API_REQUEST",
  // Get Company Info Actions
  GET_COMPANY_INFO_REQUEST: "auth/GET_COMPANY_INFO_REQUEST",
  GET_COMPANY_INFO_SUCCESS: "auth/GET_COMPANY_INFO_SUCCESS",
  GET_COMPANY_INFO_FAILURE: "auth/GET_COMPANY_INFO_FAILURE",
  // Update Company Info Actions
  UPDATE_COMPANY_INFO_REQUEST: "auth/UPDATE_COMPANY_INFO_REQUEST",
  UPDATE_COMPANY_INFO_SUCCESS: "auth/UPDATE_COMPANY_INFO_SUCCESS",
  UPDATE_COMPANY_INFO_FAILURE: "auth/UPDATE_COMPANY_INFO_FAILURE",
  // Get Team Members Actions
  GET_TEAM_MEMBERS_REQUEST: "auth/GET_TEAM_MEMBERS_REQUEST",
  GET_TEAM_MEMBERS_SUCCESS: "auth/GET_TEAM_MEMBERS_SUCCESS",
  GET_TEAM_MEMBERS_FAILURE: "auth/GET_TEAM_MEMBERS_FAILURE",
  // Invite Team Member Actions
  INVITE_TEAM_MEMBER_REQUEST: "auth/INVITE_TEAM_MEMBER_REQUEST",
  INVITE_TEAM_MEMBER_SUCCESS: "auth/INVITE_TEAM_MEMBER_SUCCESS",
  INVITE_TEAM_MEMBER_FAILURE: "auth/INVITE_TEAM_MEMBER_FAILURE",
  // Update Team Member Actions
  UPDATE_TEAM_MEMBER_REQUEST: "auth/UPDATE_TEAM_MEMBER_REQUEST",
  UPDATE_TEAM_MEMBER_SUCCESS: "auth/UPDATE_TEAM_MEMBER_SUCCESS",
  UPDATE_TEAM_MEMBER_FAILURE: "auth/UPDATE_TEAM_MEMBER_FAILURE",
  // Delete Team Member Actions
  DELETE_TEAM_MEMBER_REQUEST: "auth/DELETE_TEAM_MEMBER_REQUEST",
  DELETE_TEAM_MEMBER_SUCCESS: "auth/DELETE_TEAM_MEMBER_SUCCESS",
  DELETE_TEAM_MEMBER_FAILURE: "auth/DELETE_TEAM_MEMBER_FAILURE",
  // Get Workflows Actions
  GET_WORKFLOWS_REQUEST: "auth/GET_WORKFLOWS_REQUEST",
  GET_WORKFLOWS_SUCCESS: "auth/GET_WORKFLOWS_SUCCESS",
  GET_WORKFLOWS_FAILURE: "auth/GET_WORKFLOWS_FAILURE",
  // Magic Link Actions
  REQUEST_MAGIC_LINK_REQUEST: "auth/REQUEST_MAGIC_LINK_REQUEST",
  REQUEST_MAGIC_LINK_SUCCESS: "auth/REQUEST_MAGIC_LINK_SUCCESS",
  REQUEST_MAGIC_LINK_FAILURE: "auth/REQUEST_MAGIC_LINK_FAILURE",
  VERIFY_MAGIC_TOKEN_REQUEST: "auth/VERIFY_MAGIC_TOKEN_REQUEST",
  VERIFY_MAGIC_TOKEN_SUCCESS: "auth/VERIFY_MAGIC_TOKEN_SUCCESS",
  VERIFY_MAGIC_TOKEN_FAILURE: "auth/VERIFY_MAGIC_TOKEN_FAILURE",
  // Clear Auth Error
  CLEAR_AUTH_ERROR: "auth/CLEAR_AUTH_ERROR",
} as const;

/**
 * Auth Action Interfaces
 */
export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface VerifyEmailRequestPayload {
  email: string;
  code: string;
}

export interface ResendVerificationCodeRequestPayload {
  email: string;
}

export interface ForgotPasswordRequestPayload {
  email: string;
}

export interface VerifyOtpRequestPayload {
  email: string;
  code: string;
}

export interface ResetPasswordRequestPayload {
  resetPasswordToken: string;
  newPassword: string;
}

export interface ChangePasswordRequestPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequestPayload {
  firstName: string;
  lastName: string;
}

export interface SendVerificationEmailRequestPayload {
  email: string;
}

export interface VerifyEmailOtpRequestPayload {
  email: string;
  otp: string;
}

export interface RefreshTokenRequestPayload {
  refreshToken: string;
}

/**
 * Auth Action Creators
 */
export const authActions = {
  // Login
  loginRequest: (payload: LoginRequestPayload) => ({
    type: AUTH_ACTION_TYPES.LOGIN_REQUEST,
    payload,
  }),

  loginSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.LOGIN_SUCCESS,
    payload,
  }),

  loginFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.LOGIN_FAILURE,
    payload: error,
  }),  // Clear Auth Error
  signupRequest: (payload: any) => ({
    type: AUTH_ACTION_TYPES.SIGNUP_REQUEST,
    payload,
  }),
  // Forgot Password
  forgotPasswordRequest: (payload: ForgotPasswordRequestPayload) => ({
    type: AUTH_ACTION_TYPES.FORGOT_PASSWORD_REQUEST,
    payload,
  }),
  forgotPasswordSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.FORGOT_PASSWORD_SUCCESS,
    payload,
  }),
  forgotPasswordFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.FORGOT_PASSWORD_FAILURE,
    payload: error,
  }),
  // Verify OTP
  verifyOtpRequest: (payload: VerifyOtpRequestPayload) => ({
    type: AUTH_ACTION_TYPES.VERIFY_OTP_REQUEST,
    payload,
  }),
  verifyOtpSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.VERIFY_OTP_SUCCESS,
    payload,
  }),
  verifyOtpFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.VERIFY_OTP_FAILURE,
    payload: error,
  }),
  // Reset Password
  resetPasswordRequest: (payload: ResetPasswordRequestPayload) => ({
    type: AUTH_ACTION_TYPES.RESET_PASSWORD_REQUEST,
    payload,
  }),
  resetPasswordSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.RESET_PASSWORD_SUCCESS,
    payload,
  }),
  resetPasswordFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.RESET_PASSWORD_FAILURE,
    payload: error,
  }),
  // Change Password
  changePasswordRequest: (payload: ChangePasswordRequestPayload) => ({
    type: AUTH_ACTION_TYPES.CHANGE_PASSWORD_REQUEST,
    payload,
  }),
  changePasswordSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.CHANGE_PASSWORD_SUCCESS,
    payload,
  }),
  changePasswordFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.CHANGE_PASSWORD_FAILURE,
    payload: error,
  }),
  // Get Profile
  getProfileRequest: () => ({
    type: AUTH_ACTION_TYPES.GET_PROFILE_REQUEST,
  }),
  getProfileSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.GET_PROFILE_SUCCESS,
    payload,
  }),
  getProfileFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.GET_PROFILE_FAILURE,
    payload: error,
  }),
  // Upload Profile Picture
  uploadProfilePictureRequest: (payload: FormData) => ({
    type: AUTH_ACTION_TYPES.UPLOAD_PROFILE_PICTURE_REQUEST,
    payload,
  }),
  uploadProfilePictureSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.UPLOAD_PROFILE_PICTURE_SUCCESS,
    payload,
  }),
  uploadProfilePictureFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.UPLOAD_PROFILE_PICTURE_FAILURE,
    payload: error,
  }),
  // Delete Profile Picture
  deleteProfilePictureRequest: () => ({
    type: AUTH_ACTION_TYPES.DELETE_PROFILE_PICTURE_REQUEST,
  }),
  deleteProfilePictureSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.DELETE_PROFILE_PICTURE_SUCCESS,
    payload,
  }),
  deleteProfilePictureFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.DELETE_PROFILE_PICTURE_FAILURE,
    payload: error,
  }),
  // Send Verification Email
  sendVerificationEmailRequest: (payload: SendVerificationEmailRequestPayload) => ({
    type: AUTH_ACTION_TYPES.SEND_VERIFICATION_EMAIL_REQUEST,
    payload,
  }),
  sendVerificationEmailSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.SEND_VERIFICATION_EMAIL_SUCCESS,
    payload,
  }),
  sendVerificationEmailFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.SEND_VERIFICATION_EMAIL_FAILURE,
    payload: error,
  }),
  // Verify Email OTP
  verifyEmailOtpRequest: (payload: VerifyEmailOtpRequestPayload) => ({
    type: AUTH_ACTION_TYPES.VERIFY_EMAIL_OTP_REQUEST,
    payload,
  }),
  verifyEmailOtpSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.VERIFY_EMAIL_OTP_SUCCESS,
    payload,
  }),
  verifyEmailOtpFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.VERIFY_EMAIL_OTP_FAILURE,
    payload: error,
  }),
  // Update Profile
  updateProfileRequest: (payload: UpdateProfileRequestPayload) => ({
    type: AUTH_ACTION_TYPES.UPDATE_PROFILE_REQUEST,
    payload,
  }),
  updateProfileSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.UPDATE_PROFILE_SUCCESS,
    payload,
  }),
  updateProfileFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.UPDATE_PROFILE_FAILURE,
    payload: error,
  }),
  clearAuthError: () => ({
    type: AUTH_ACTION_TYPES.CLEAR_AUTH_ERROR,
  }),
  onboardingApiRequest: (payload: any) => ({
    type: AUTH_ACTION_TYPES.ONBOARDING_API_REQUEST,
    payload,
  }),
  // Get Company Info
  getCompanyInfoRequest: () => ({
    type: AUTH_ACTION_TYPES.GET_COMPANY_INFO_REQUEST,
  }),
  getCompanyInfoSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.GET_COMPANY_INFO_SUCCESS,
    payload,
  }),
  getCompanyInfoFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.GET_COMPANY_INFO_FAILURE,
    payload: error,
  }),
  // Update Company Info
  updateCompanyInfoRequest: (payload: FormData) => ({
    type: AUTH_ACTION_TYPES.UPDATE_COMPANY_INFO_REQUEST,
    payload,
  }),
  updateCompanyInfoSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.UPDATE_COMPANY_INFO_SUCCESS,
    payload,
  }),
  updateCompanyInfoFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.UPDATE_COMPANY_INFO_FAILURE,
    payload: error,
  }),
  // Get Team Members
  getTeamMembersRequest: () => ({
    type: AUTH_ACTION_TYPES.GET_TEAM_MEMBERS_REQUEST,
  }),
  getTeamMembersSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.GET_TEAM_MEMBERS_SUCCESS,
    payload,
  }),
  getTeamMembersFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.GET_TEAM_MEMBERS_FAILURE,
    payload: error,
  }),
  // Invite Team Member
  inviteTeamMemberRequest: (payload: { email: string; name: string; role: string }) => ({
    type: AUTH_ACTION_TYPES.INVITE_TEAM_MEMBER_REQUEST,
    payload,
  }),
  inviteTeamMemberSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.INVITE_TEAM_MEMBER_SUCCESS,
    payload,
  }),
  inviteTeamMemberFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.INVITE_TEAM_MEMBER_FAILURE,
    payload: error,
  }),
  // Update Team Member
  updateTeamMemberRequest: (memberId: string, payload: { email: string; name: string; role: string }) => ({
    type: AUTH_ACTION_TYPES.UPDATE_TEAM_MEMBER_REQUEST,
    payload: { memberId, ...payload },
  }),
  updateTeamMemberSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.UPDATE_TEAM_MEMBER_SUCCESS,
    payload,
  }),
  updateTeamMemberFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.UPDATE_TEAM_MEMBER_FAILURE,
    payload: error,
  }),
  // Delete Team Member
  deleteTeamMemberRequest: (memberId: string) => ({
    type: AUTH_ACTION_TYPES.DELETE_TEAM_MEMBER_REQUEST,
    payload: { memberId },
  }),
  deleteTeamMemberSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.DELETE_TEAM_MEMBER_SUCCESS,
    payload,
  }),
  deleteTeamMemberFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.DELETE_TEAM_MEMBER_FAILURE,
    payload: error,
  }),
  // Get Workflows
  getWorkflowsRequest: () => ({
    type: AUTH_ACTION_TYPES.GET_WORKFLOWS_REQUEST,
  }),
  getWorkflowsSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.GET_WORKFLOWS_SUCCESS,
    payload,
  }),
  getWorkflowsFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.GET_WORKFLOWS_FAILURE,
    payload: error,
  }),
  // Magic Link
  requestMagicLinkRequest: (payload: { email: string }) => ({
    type: AUTH_ACTION_TYPES.REQUEST_MAGIC_LINK_REQUEST,
    payload,
  }),
  requestMagicLinkSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.REQUEST_MAGIC_LINK_SUCCESS,
    payload,
  }),
  requestMagicLinkFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.REQUEST_MAGIC_LINK_FAILURE,
    payload: error,
  }),
  verifyMagicTokenRequest: (token: string) => ({
    type: AUTH_ACTION_TYPES.VERIFY_MAGIC_TOKEN_REQUEST,
    payload: { token },
  }),
  verifyMagicTokenSuccess: (payload: any) => ({
    type: AUTH_ACTION_TYPES.VERIFY_MAGIC_TOKEN_SUCCESS,
    payload,
  }),
  verifyMagicTokenFailure: (error: string) => ({
    type: AUTH_ACTION_TYPES.VERIFY_MAGIC_TOKEN_FAILURE,
    payload: error,
  }),
};

export default authActions;

