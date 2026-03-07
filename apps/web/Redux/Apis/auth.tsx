import api from "./api";
// Magic link auth
export const requestMagicLinkApi = async (payload: { email: string }): Promise<any> => {
  try {
    const response = await api.post('/api/auth/request-login', payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const verifyMagicTokenApi = async (token: string): Promise<any> => {
  try {
    const response = await api.get(`/api/auth/verify?token=${encodeURIComponent(token)}`);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const loginApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/login", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const signupApi = async (payload: any) => {
  try {
    const response = await api.post("/auth/v1/signup", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const forgotPasswordApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/forgot-password", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const verifyOtpApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/verify-otp", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const resetPasswordApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/reset-password", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const changePasswordApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.patch("/auth/v1/change-password", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getProfileApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/users/profile/me");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateProfileApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.patch("/api/v1/users/profile/me", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const uploadProfilePictureApi = async (formData: FormData): Promise<any> => {
  try {
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await api.patch("/api/v1/users/profile-picture-upload", formData);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const deleteProfilePictureApi = async (): Promise<any> => {
  try {
    const response = await api.delete("/api/v1/users/profile/me/picture");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const sendVerificationEmailApi = async (payload: { email: string }): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/send-verification-email", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const verifyEmailOtpApi = async (payload: { email: string; otp: string }): Promise<any> => {
  try {
    const response = await api.post("/auth/v1/verify-email-otp", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const onboardingApi = async (formData: FormData): Promise<any> => {
  try {
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await api.patch("/api/v1/users/company/me/submit", formData);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getCompanyInfoApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/company/me");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateCompanyInfoApi = async (formData: FormData): Promise<any> => {
  try {
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await api.patch("/api/v1/company/me", formData);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getTeamMembersApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/users/team-members");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const inviteTeamMemberApi = async (payload: { email: string; name: string; role: string }): Promise<any> => {
  try {
    const response = await api.post("/api/v1/users/team-members/invite", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateTeamMemberApi = async (memberId: string, payload: { email: string; name: string; role: string }): Promise<any> => {
  try {
    const response = await api.patch(`/api/v1/users/team-members/${memberId}`, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const deleteTeamMemberApi = async (memberId: string): Promise<any> => {
  try {
    const response = await api.delete(`/api/v1/users/team-members/${memberId}`);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getWorkflowsApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/workflows");
    return response;
  } catch (error: any) {
    throw error;
  }
};