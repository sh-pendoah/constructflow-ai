import api from "./api";

export const getJobsApi = async (params?: { status?: string; searchText?: string }): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.searchText) {
      queryParams.append("searchText", params.searchText);
    }
    const queryString = queryParams.toString();
    const url = `/api/v1/jobs${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const createJobApi = async (payload: any): Promise<any> => {
  try {
    const response = await api.post("/api/v1/jobs", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateJobApi = async (jobId: string, payload: any): Promise<any> => {
  try {
    const response = await api.patch(`/api/v1/jobs/${jobId}`, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getCostCodesApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/cost-codes");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const createCostCodeApi = async (payload: { codeNumber: string; category: string; description: string }): Promise<any> => {
  try {
    const response = await api.post("/api/v1/cost-codes", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateCostCodeApi = async (costCodeId: string, payload: { codeNumber: string; category: string; description: string }): Promise<any> => {
  try {
    const response = await api.patch(`/api/v1/cost-codes/${costCodeId}`, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const deleteCostCodeApi = async (costCodeId: string): Promise<any> => {
  try {
    const response = await api.delete(`/api/v1/cost-codes/${costCodeId}`);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getWCCodesApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/wc-codes");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const createWCCodeApi = async (payload: { codeNumber: string; category: string; description: string }): Promise<any> => {
  try {
    const response = await api.post("/api/v1/wc-codes", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateWCCodeApi = async (wcCodeId: string, payload: { codeNumber: string; category: string; description: string }): Promise<any> => {
  try {
    const response = await api.patch(`/api/v1/wc-codes/${wcCodeId}`, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const deleteWCCodeApi = async (wcCodeId: string): Promise<any> => {
  try {
    const response = await api.delete(`/api/v1/wc-codes/${wcCodeId}`);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateApprovalRulesApi = async (payload: { pmApprovalLimit: number }): Promise<any> => {
  try {
    const response = await api.patch("/api/v1/company/approval-rules", payload);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const getCOIVendorsApi = async (): Promise<any> => {
  try {
    const response = await api.get("/api/v1/coi-vendors");
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const createCOIVendorApi = async (formData: FormData): Promise<any> => {
  try {
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await api.post("/api/v1/coi-vendors", formData);
    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateCOIVendorApi = async (vendorId: string, formData: FormData): Promise<any> => {
  try {
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await api.put(`/api/v1/coi-vendors/${vendorId}`, formData);
    return response;
  } catch (error: any) {
    throw error;
  }
};
