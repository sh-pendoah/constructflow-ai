/**
 * Company Action Types
 */
export const COMPANY_ACTION_TYPES = {
  // Get Jobs Actions
  GET_JOBS_REQUEST: "company/GET_JOBS_REQUEST",
  GET_JOBS_SUCCESS: "company/GET_JOBS_SUCCESS",
  GET_JOBS_FAILURE: "company/GET_JOBS_FAILURE",
  // Create Job Actions
  CREATE_JOB_REQUEST: "company/CREATE_JOB_REQUEST",
  CREATE_JOB_SUCCESS: "company/CREATE_JOB_SUCCESS",
  CREATE_JOB_FAILURE: "company/CREATE_JOB_FAILURE",
  // Update Job Actions
  UPDATE_JOB_REQUEST: "company/UPDATE_JOB_REQUEST",
  UPDATE_JOB_SUCCESS: "company/UPDATE_JOB_SUCCESS",
  UPDATE_JOB_FAILURE: "company/UPDATE_JOB_FAILURE",
  // Get Cost Codes Actions
  GET_COST_CODES_REQUEST: "company/GET_COST_CODES_REQUEST",
  GET_COST_CODES_SUCCESS: "company/GET_COST_CODES_SUCCESS",
  GET_COST_CODES_FAILURE: "company/GET_COST_CODES_FAILURE",
  // Create Cost Code Actions
  CREATE_COST_CODE_REQUEST: "company/CREATE_COST_CODE_REQUEST",
  CREATE_COST_CODE_SUCCESS: "company/CREATE_COST_CODE_SUCCESS",
  CREATE_COST_CODE_FAILURE: "company/CREATE_COST_CODE_FAILURE",
  // Update Cost Code Actions
  UPDATE_COST_CODE_REQUEST: "company/UPDATE_COST_CODE_REQUEST",
  UPDATE_COST_CODE_SUCCESS: "company/UPDATE_COST_CODE_SUCCESS",
  UPDATE_COST_CODE_FAILURE: "company/UPDATE_COST_CODE_FAILURE",
  // Delete Cost Code Actions
  DELETE_COST_CODE_REQUEST: "company/DELETE_COST_CODE_REQUEST",
  DELETE_COST_CODE_SUCCESS: "company/DELETE_COST_CODE_SUCCESS",
  DELETE_COST_CODE_FAILURE: "company/DELETE_COST_CODE_FAILURE",
  // Get WC Codes Actions
  GET_WC_CODES_REQUEST: "company/GET_WC_CODES_REQUEST",
  GET_WC_CODES_SUCCESS: "company/GET_WC_CODES_SUCCESS",
  GET_WC_CODES_FAILURE: "company/GET_WC_CODES_FAILURE",
  // Create WC Code Actions
  CREATE_WC_CODE_REQUEST: "company/CREATE_WC_CODE_REQUEST",
  CREATE_WC_CODE_SUCCESS: "company/CREATE_WC_CODE_SUCCESS",
  CREATE_WC_CODE_FAILURE: "company/CREATE_WC_CODE_FAILURE",
  // Update WC Code Actions
  UPDATE_WC_CODE_REQUEST: "company/UPDATE_WC_CODE_REQUEST",
  UPDATE_WC_CODE_SUCCESS: "company/UPDATE_WC_CODE_SUCCESS",
  UPDATE_WC_CODE_FAILURE: "company/UPDATE_WC_CODE_FAILURE",
  // Delete WC Code Actions
  DELETE_WC_CODE_REQUEST: "company/DELETE_WC_CODE_REQUEST",
  DELETE_WC_CODE_SUCCESS: "company/DELETE_WC_CODE_SUCCESS",
  DELETE_WC_CODE_FAILURE: "company/DELETE_WC_CODE_FAILURE",
  // Update Approval Rules Actions
  UPDATE_APPROVAL_RULES_REQUEST: "company/UPDATE_APPROVAL_RULES_REQUEST",
  UPDATE_APPROVAL_RULES_SUCCESS: "company/UPDATE_APPROVAL_RULES_SUCCESS",
  UPDATE_APPROVAL_RULES_FAILURE: "company/UPDATE_APPROVAL_RULES_FAILURE",
  // Get COI Vendors Actions
  GET_COI_VENDORS_REQUEST: "company/GET_COI_VENDORS_REQUEST",
  GET_COI_VENDORS_SUCCESS: "company/GET_COI_VENDORS_SUCCESS",
  GET_COI_VENDORS_FAILURE: "company/GET_COI_VENDORS_FAILURE",
  // Create COI Vendor Actions
  CREATE_COI_VENDOR_REQUEST: "company/CREATE_COI_VENDOR_REQUEST",
  CREATE_COI_VENDOR_SUCCESS: "company/CREATE_COI_VENDOR_SUCCESS",
  CREATE_COI_VENDOR_FAILURE: "company/CREATE_COI_VENDOR_FAILURE",
  // Update COI Vendor Actions
  UPDATE_COI_VENDOR_REQUEST: "company/UPDATE_COI_VENDOR_REQUEST",
  UPDATE_COI_VENDOR_SUCCESS: "company/UPDATE_COI_VENDOR_SUCCESS",
  UPDATE_COI_VENDOR_FAILURE: "company/UPDATE_COI_VENDOR_FAILURE",
};

/**
 * Company Action Creators
 */
const companyActions = {
  // Get Jobs
  getJobsRequest: (params?: { status?: string; searchText?: string }) => ({
    type: COMPANY_ACTION_TYPES.GET_JOBS_REQUEST,
    payload: params,
  }),
  getJobsSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.GET_JOBS_SUCCESS,
    payload,
  }),
  getJobsFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.GET_JOBS_FAILURE,
    payload: error,
  }),
  // Create Job
  createJobRequest: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.CREATE_JOB_REQUEST,
    payload,
  }),
  createJobSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.CREATE_JOB_SUCCESS,
    payload,
  }),
  createJobFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.CREATE_JOB_FAILURE,
    payload: error,
  }),
  // Update Job
  updateJobRequest: (jobId: string, payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_JOB_REQUEST,
    payload: { jobId, ...payload },
  }),
  updateJobSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_JOB_SUCCESS,
    payload,
  }),
  updateJobFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_JOB_FAILURE,
    payload: error,
  }),
  // Get Cost Codes
  getCostCodesRequest: () => ({
    type: COMPANY_ACTION_TYPES.GET_COST_CODES_REQUEST,
  }),
  getCostCodesSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.GET_COST_CODES_SUCCESS,
    payload,
  }),
  getCostCodesFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.GET_COST_CODES_FAILURE,
    payload: error,
  }),
  // Create Cost Code
  createCostCodeRequest: (payload: { codeNumber: string; category: string; description: string }) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COST_CODE_REQUEST,
    payload,
  }),
  createCostCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COST_CODE_SUCCESS,
    payload,
  }),
  createCostCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COST_CODE_FAILURE,
    payload: error,
  }),
  // Update Cost Code
  updateCostCodeRequest: (costCodeId: string, payload: { codeNumber: string; category: string; description: string }) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COST_CODE_REQUEST,
    payload: { costCodeId, ...payload },
  }),
  updateCostCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COST_CODE_SUCCESS,
    payload,
  }),
  updateCostCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COST_CODE_FAILURE,
    payload: error,
  }),
  // Delete Cost Code
  deleteCostCodeRequest: (costCodeId: string) => ({
    type: COMPANY_ACTION_TYPES.DELETE_COST_CODE_REQUEST,
    payload: costCodeId,
  }),
  deleteCostCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.DELETE_COST_CODE_SUCCESS,
    payload,
  }),
  deleteCostCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.DELETE_COST_CODE_FAILURE,
    payload: error,
  }),
  // Get WC Codes
  getWCCodesRequest: () => ({
    type: COMPANY_ACTION_TYPES.GET_WC_CODES_REQUEST,
  }),
  getWCCodesSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.GET_WC_CODES_SUCCESS,
    payload,
  }),
  getWCCodesFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.GET_WC_CODES_FAILURE,
    payload: error,
  }),
  // Create WC Code
  createWCCodeRequest: (payload: { codeNumber: string; category: string; description: string }) => ({
    type: COMPANY_ACTION_TYPES.CREATE_WC_CODE_REQUEST,
    payload,
  }),
  createWCCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.CREATE_WC_CODE_SUCCESS,
    payload,
  }),
  createWCCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.CREATE_WC_CODE_FAILURE,
    payload: error,
  }),
  // Update WC Code
  updateWCCodeRequest: (wcCodeId: string, payload: { codeNumber: string; category: string; description: string }) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_WC_CODE_REQUEST,
    payload: { wcCodeId, ...payload },
  }),
  updateWCCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_WC_CODE_SUCCESS,
    payload,
  }),
  updateWCCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_WC_CODE_FAILURE,
    payload: error,
  }),
  // Delete WC Code
  deleteWCCodeRequest: (wcCodeId: string) => ({
    type: COMPANY_ACTION_TYPES.DELETE_WC_CODE_REQUEST,
    payload: wcCodeId,
  }),
  deleteWCCodeSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.DELETE_WC_CODE_SUCCESS,
    payload,
  }),
  deleteWCCodeFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.DELETE_WC_CODE_FAILURE,
    payload: error,
  }),
  // Update Approval Rules
  updateApprovalRulesRequest: (payload: { pmApprovalLimit: number }) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_APPROVAL_RULES_REQUEST,
    payload,
  }),
  updateApprovalRulesSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_APPROVAL_RULES_SUCCESS,
    payload,
  }),
  updateApprovalRulesFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_APPROVAL_RULES_FAILURE,
    payload: error,
  }),
  // Get COI Vendors
  getCOIVendorsRequest: () => ({
    type: COMPANY_ACTION_TYPES.GET_COI_VENDORS_REQUEST,
  }),
  getCOIVendorsSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.GET_COI_VENDORS_SUCCESS,
    payload,
  }),
  getCOIVendorsFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.GET_COI_VENDORS_FAILURE,
    payload: error,
  }),
  // Create COI Vendor
  createCOIVendorRequest: (formData: FormData) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COI_VENDOR_REQUEST,
    payload: formData,
  }),
  createCOIVendorSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COI_VENDOR_SUCCESS,
    payload,
  }),
  createCOIVendorFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.CREATE_COI_VENDOR_FAILURE,
    payload: error,
  }),
  // Update COI Vendor
  updateCOIVendorRequest: (vendorId: string, formData: FormData) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COI_VENDOR_REQUEST,
    payload: { vendorId, formData },
  }),
  updateCOIVendorSuccess: (payload: any) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COI_VENDOR_SUCCESS,
    payload,
  }),
  updateCOIVendorFailure: (error: string) => ({
    type: COMPANY_ACTION_TYPES.UPDATE_COI_VENDOR_FAILURE,
    payload: error,
  }),
};

export default companyActions;
