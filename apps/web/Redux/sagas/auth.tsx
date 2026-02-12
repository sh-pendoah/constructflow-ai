import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import authActions, { AUTH_ACTION_TYPES } from "../actions/auth";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  signupFailure,
  signupRequest,
  signupSuccess,
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
} from "../reducers/auth";
import {
  loginApi,
  signupApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  changePasswordApi,
  getProfileApi,
  uploadProfilePictureApi,
  deleteProfilePictureApi,
  sendVerificationEmailApi,
  verifyEmailOtpApi,
  updateProfileApi,
  onboardingApi,
  getCompanyInfoApi,
  updateCompanyInfoApi,
  getTeamMembersApi,
  inviteTeamMemberApi,
  updateTeamMemberApi,
  deleteTeamMemberApi,
  getWorkflowsApi,
} from "../Apis/auth";
import toast from "react-hot-toast";
import { setCookie } from "nookies";

function* loginSaga(action: any): any {
  try {
    yield put(loginRequest());
    const resp = yield call(loginApi, action.payload);
    yield put(loginSuccess(resp.data));
    if (resp.data.status) {
      toast.success(resp.data.responseDescription);
      setCookie(null, "auth_token", resp.data?.data?.accessToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
      location.href = "/dashboard";
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.responseDescription || "Login failed");
  } finally {
    yield put(loginFailure(false));
  }
}

function* signupSaga(action: any): any {
  try {
    yield put(signupRequest());
    const resp = yield call(signupApi, action.payload);
    yield put(signupSuccess(resp.data));
    if (resp.data.status) {
      toast.success(resp.data.responseDescription);
      setCookie(null, "auth_token", resp.data?.data?.accessToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
      location.href = "/onboarding/step-1";
    }
  } catch (e: any) {
    toast.error(e?.response?.data?.error?.message || "Signup failed");
  } finally {
    yield put(signupFailure(false));
  }
}

function* forgotPasswordSaga(action: any): any {
  try {
    yield put(forgotPasswordRequest());
    const resp = yield call(forgotPasswordApi, action.payload);
    yield put(forgotPasswordSuccess(resp.data));
    if (resp.data.status) {
      toast.success(
        resp.data.responseDescription || "Password reset code sent to your email."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || "Failed to send reset code";
    toast.error(errorMessage);
    yield put(forgotPasswordFailure(errorMessage));
  }
}

function* verifyOtpSaga(action: any): any {
  try {
    yield put(verifyOtpRequest());
    const resp = yield call(verifyOtpApi, action.payload);
    yield put(verifyOtpSuccess(resp.data));
    if (resp.data.status) {
      toast.success(
        resp.data.responseDescription || "OTP verified successfully."
      );
      // Store reset password token if provided
      if (resp.data?.data?.resetPasswordToken) {
        localStorage.setItem(
          "resetPasswordToken",
          resp.data.data.resetPasswordToken
        );
      }
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || "OTP verification failed";
    toast.error(errorMessage);
    yield put(verifyOtpFailure(errorMessage));
  }
}

function* resetPasswordSaga(action: any): any {
  try {
    yield put(resetPasswordRequest());
    const resp = yield call(resetPasswordApi, action.payload);
    yield put(resetPasswordSuccess(resp.data));
    if (resp.data.status) {
      toast.success(
        resp.data.responseDescription || "Password reset successful. Please login."
      );
      // Clear reset password token
      localStorage.removeItem("resetPasswordToken");
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || "Password reset failed";
    toast.error(errorMessage);
    yield put(resetPasswordFailure(errorMessage));
  }
}

function* changePasswordSaga(action: any): any {
  try {
    yield put(changePasswordRequest());
    const resp = yield call(changePasswordApi, action.payload);
    yield put(changePasswordSuccess(resp.data));
    if (resp.data.success) {
      toast.success(
        resp.data.message || "Password changed successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || "Failed to change password";
    toast.error(errorMessage);
    yield put(changePasswordFailure(errorMessage));
  }
}

function* getProfileSaga(): any {
  try {
    yield put(getProfileRequest());
    const resp = yield call(getProfileApi);
    yield put(getProfileSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch profile";
    yield put(getProfileFailure(errorMessage));
  }
}

function* uploadProfilePictureSaga(action: any): any {
  try {
    yield put(uploadProfilePictureRequest());
    const resp = yield call(uploadProfilePictureApi, action.payload);
    yield put(uploadProfilePictureSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Profile picture uploaded successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to upload profile picture";
    toast.error(errorMessage);
    yield put(uploadProfilePictureFailure(errorMessage));
  }
}

function* deleteProfilePictureSaga(): any {
  try {
    yield put(deleteProfilePictureRequest());
    const resp = yield call(deleteProfilePictureApi);
    yield put(deleteProfilePictureSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Profile picture deleted successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to delete profile picture";
    toast.error(errorMessage);
    yield put(deleteProfilePictureFailure(errorMessage));
  }
}

function* sendVerificationEmailSaga(action: any): any {
  try {
    if (!action.payload || !action.payload.email) {
      throw new Error("Email is required");
    }
    yield put(sendVerificationEmailRequest());
    const resp = yield call(sendVerificationEmailApi, action.payload);
    if (resp && resp.data) {
      yield put(sendVerificationEmailSuccess(resp.data));
      if (resp.data.status || resp.data.success || resp.status === 200) {
        toast.success(
          resp.data?.responseDescription || resp.data?.message || "Verification email sent successfully."
        );
      }
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || 
      e?.response?.data?.message || 
      e?.message ||
      "Failed to send verification email";
    toast.error(errorMessage);
    yield put(sendVerificationEmailFailure(errorMessage));
  }
}

function* verifyEmailOtpSaga(action: any): any {
  try {
    if (!action.payload || !action.payload.email || !action.payload.otp) {
      throw new Error("Email and OTP are required");
    }
    yield put(verifyEmailOtpRequest());
    const resp = yield call(verifyEmailOtpApi, action.payload);
    if (resp && resp.data) {
      yield put(verifyEmailOtpSuccess(resp.data));
      if (resp.data.status || resp.data.success || resp.status === 200) {
        toast.success(
          resp.data?.responseDescription || resp.data?.message || "Email verified successfully."
        );
      }
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || 
      e?.response?.data?.message || 
      e?.message ||
      "Failed to verify email";
    toast.error(errorMessage);
    yield put(verifyEmailOtpFailure(errorMessage));
  }
}

function* updateProfileSaga(action: any): any {
  try {
    yield put(updateProfileRequest());
    const resp = yield call(updateProfileApi, action.payload);
    yield put(updateProfileSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Profile updated successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update profile";
    toast.error(errorMessage);
    yield put(updateProfileFailure(errorMessage));
  }
}

function* onboardingApiSaga(action: any): any {
  try {
    yield put(setOnboardingApiLoading(true));
    const resp = yield call(onboardingApi, action.payload);
    yield put(setOnboardingApiSuccess(true));
    toast.success(resp.data?.message || resp.data?.responseDescription || "Onboarding successful");
  } catch (e: any) {
    toast.error(e?.response?.data?.message || e?.response?.data?.responseDescription || "Failed to onboard");
    yield put(setOnboardingApiSuccess(false));
  } finally {
    yield put(setOnboardingApiLoading(false));
  }
}

function* getCompanyInfoSaga(): any {
  try {
    yield put(getCompanyInfoRequest());
    const resp = yield call(getCompanyInfoApi);
    yield put(getCompanyInfoSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch company information";
    yield put(getCompanyInfoFailure(errorMessage));
  }
}

function* updateCompanyInfoSaga(action: any): any {
  try {
    yield put(updateCompanyInfoRequest());
    const resp = yield call(updateCompanyInfoApi, action.payload);
    yield put(updateCompanyInfoSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Company information updated successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update company information";
    toast.error(errorMessage);
    yield put(updateCompanyInfoFailure(errorMessage));
  }
}

function* getTeamMembersSaga(): any {
  try {
    yield put(getTeamMembersRequest());
    const resp = yield call(getTeamMembersApi);
    yield put(getTeamMembersSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch team members";
    yield put(getTeamMembersFailure(errorMessage));
  }
}

function* inviteTeamMemberSaga(action: any): any {
  try {
    yield put(inviteTeamMemberRequest());
    const resp = yield call(inviteTeamMemberApi, action.payload);
    yield put(inviteTeamMemberSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Team member invited successfully."
      );
      // Refetch team members after successful invite
      yield put(getTeamMembersRequest());
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to invite team member";
    toast.error(errorMessage);
    yield put(inviteTeamMemberFailure(errorMessage));
  }
}

function* updateTeamMemberSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.memberId) {
      throw new Error("Member ID is required");
    }
    
    yield put(updateTeamMemberRequest());
    const { memberId, ...payload } = action.payload;
    const resp = yield call(updateTeamMemberApi, memberId, payload);
    yield put(updateTeamMemberSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Team member updated successfully."
      );
    }
    
    // Always refetch team members after successful update to refresh the listing
    yield put(getTeamMembersRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || e?.message || "Failed to update team member";
    toast.error(errorMessage);
    yield put(updateTeamMemberFailure(errorMessage));
  }
}

function* deleteTeamMemberSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.memberId) {
      throw new Error("Member ID is required");
    }
    
    yield put(deleteTeamMemberRequest());
    const resp = yield call(deleteTeamMemberApi, action.payload.memberId);
    yield put(deleteTeamMemberSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Team member removed successfully."
      );
    }
    
    // Always refetch team members after successful delete to refresh the listing
    yield put(getTeamMembersRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || e?.message || "Failed to remove team member";
    toast.error(errorMessage);
    yield put(deleteTeamMemberFailure(errorMessage));
  }
}

function* getWorkflowsSaga(): any {
  try {
    yield put(getWorkflowsRequest());
    const resp = yield call(getWorkflowsApi);
    yield put(getWorkflowsSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch workflows";
    yield put(getWorkflowsFailure(errorMessage));
  }
}

export default function* authSaga() {
  yield takeLatest(AUTH_ACTION_TYPES.LOGIN_REQUEST, loginSaga);
  yield takeLatest(AUTH_ACTION_TYPES.SIGNUP_REQUEST, signupSaga);
  yield takeLatest(AUTH_ACTION_TYPES.FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
  yield takeLatest(AUTH_ACTION_TYPES.VERIFY_OTP_REQUEST, verifyOtpSaga);
  yield takeLatest(AUTH_ACTION_TYPES.RESET_PASSWORD_REQUEST, resetPasswordSaga);
  yield takeLatest(AUTH_ACTION_TYPES.CHANGE_PASSWORD_REQUEST, changePasswordSaga);
  yield takeLatest(AUTH_ACTION_TYPES.GET_PROFILE_REQUEST, getProfileSaga);
  yield takeLatest(AUTH_ACTION_TYPES.UPLOAD_PROFILE_PICTURE_REQUEST, uploadProfilePictureSaga);
  yield takeLatest(AUTH_ACTION_TYPES.DELETE_PROFILE_PICTURE_REQUEST, deleteProfilePictureSaga);
  yield takeLatest(AUTH_ACTION_TYPES.SEND_VERIFICATION_EMAIL_REQUEST, sendVerificationEmailSaga);
  yield takeLatest(AUTH_ACTION_TYPES.VERIFY_EMAIL_OTP_REQUEST, verifyEmailOtpSaga);
  yield takeLatest(AUTH_ACTION_TYPES.UPDATE_PROFILE_REQUEST, updateProfileSaga);
  yield takeLatest(AUTH_ACTION_TYPES.ONBOARDING_API_REQUEST, onboardingApiSaga);
  yield takeLatest(AUTH_ACTION_TYPES.GET_COMPANY_INFO_REQUEST, getCompanyInfoSaga);
  yield takeLatest(AUTH_ACTION_TYPES.UPDATE_COMPANY_INFO_REQUEST, updateCompanyInfoSaga);
  yield takeLatest(AUTH_ACTION_TYPES.GET_TEAM_MEMBERS_REQUEST, getTeamMembersSaga);
  yield takeLatest(AUTH_ACTION_TYPES.INVITE_TEAM_MEMBER_REQUEST, inviteTeamMemberSaga);
  yield takeLatest(AUTH_ACTION_TYPES.UPDATE_TEAM_MEMBER_REQUEST, updateTeamMemberSaga);
  yield takeLatest(AUTH_ACTION_TYPES.DELETE_TEAM_MEMBER_REQUEST, deleteTeamMemberSaga);
  yield takeLatest(AUTH_ACTION_TYPES.GET_WORKFLOWS_REQUEST, getWorkflowsSaga);
}
