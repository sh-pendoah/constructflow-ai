import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Company State Interface
 */
interface CompanyState {
  // Jobs
  jobs: any[] | null;
  jobsStatistics: {
    totalJobs: number;
    activeJobs: number;
    inactiveJobs: number;
  } | null;
  getJobsError: string | null;
  createJobError: string | null;
  createJobSuccess: boolean;
  updateJobError: string | null;
  updateJobSuccess: boolean;
  isLoading: boolean;
  isCreatingJob: boolean;
  isUpdatingJob: boolean;
  // Cost Codes
  costCodes: any[] | null;
  costCodesPagination: {
    total: number;
    page: number;
    pageSize: number;
  } | null;
  getCostCodesError: string | null;
  createCostCodeError: string | null;
  createCostCodeSuccess: boolean;
  isCreatingCostCode: boolean;
  updateCostCodeError: string | null;
  updateCostCodeSuccess: boolean;
  isUpdatingCostCode: boolean;
  deleteCostCodeError: string | null;
  deleteCostCodeSuccess: boolean;
  isDeletingCostCode: boolean;
  // WC Codes
  wcCodes: any[] | null;
  wcCodesPagination: {
    total: number;
    page: number;
    pageSize: number;
  } | null;
  getWCCodesError: string | null;
  isLoadingWCCodes: boolean;
  createWCCodeError: string | null;
  createWCCodeSuccess: boolean;
  isCreatingWCCode: boolean;
  updateWCCodeError: string | null;
  updateWCCodeSuccess: boolean;
  isUpdatingWCCode: boolean;
  deleteWCCodeError: string | null;
  deleteWCCodeSuccess: boolean;
  isDeletingWCCode: boolean;
  // Approval Rules
  updateApprovalRulesError: string | null;
  updateApprovalRulesSuccess: boolean;
  isUpdatingApprovalRules: boolean;
  // COI Vendors
  coiVendors: any[] | null;
  getCOIVendorsError: string | null;
  isLoadingCOIVendors: boolean;
  createCOIVendorError: string | null;
  createCOIVendorSuccess: boolean;
  isCreatingCOIVendor: boolean;
  updateCOIVendorError: string | null;
  updateCOIVendorSuccess: boolean;
  isUpdatingCOIVendor: boolean;
}

/**
 * Initial State
 */
const initialState: CompanyState = {
  jobs: null,
  jobsStatistics: null,
  getJobsError: null,
  createJobError: null,
  createJobSuccess: false,
  updateJobError: null,
  updateJobSuccess: false,
  isLoading: false,
  isCreatingJob: false,
  isUpdatingJob: false,
  costCodes: null,
  costCodesPagination: null,
  getCostCodesError: null,
  createCostCodeError: null,
  createCostCodeSuccess: false,
  isCreatingCostCode: false,
  updateCostCodeError: null,
  updateCostCodeSuccess: false,
  isUpdatingCostCode: false,
  deleteCostCodeError: null,
  deleteCostCodeSuccess: false,
  isDeletingCostCode: false,
  wcCodes: null,
  wcCodesPagination: null,
  getWCCodesError: null,
  isLoadingWCCodes: false,
  createWCCodeError: null,
  createWCCodeSuccess: false,
  isCreatingWCCode: false,
  updateWCCodeError: null,
  updateWCCodeSuccess: false,
  isUpdatingWCCode: false,
  deleteWCCodeError: null,
  deleteWCCodeSuccess: false,
  isDeletingWCCode: false,
  updateApprovalRulesError: null,
  updateApprovalRulesSuccess: false,
  isUpdatingApprovalRules: false,
  coiVendors: null,
  getCOIVendorsError: null,
  isLoadingCOIVendors: false,
  createCOIVendorError: null,
  createCOIVendorSuccess: false,
  isCreatingCOIVendor: false,
  updateCOIVendorError: null,
  updateCOIVendorSuccess: false,
  isUpdatingCOIVendor: false,
};

/**
 * Company Slice
 */
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    // Get Jobs Reducers
    getJobsRequest: (state) => {
      state.isLoading = true;
      state.getJobsError = null;
      // Don't clear existing jobs while refetching - keep them visible
    },
    getJobsSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.getJobsError = null;
      // Store jobs data
      if (action.payload?.data) {
        state.jobs = action.payload.data.jobs || [];
        state.jobsStatistics = action.payload.data.statistics || null;
      }
    },
    getJobsFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.getJobsError = action.payload;
    },
    // Create Job Reducers
    createJobRequest: (state) => {
      state.isCreatingJob = true;
      state.createJobError = null;
      state.createJobSuccess = false;
    },
    createJobSuccess: (state, action: PayloadAction<any>) => {
      state.isCreatingJob = false;
      state.createJobError = null;
      state.createJobSuccess = true;
    },
    createJobFailure: (state, action: PayloadAction<any>) => {
      state.isCreatingJob = false;
      state.createJobError = action.payload;
      state.createJobSuccess = false;
    },
    // Update Job Reducers
    updateJobRequest: (state) => {
      state.isUpdatingJob = true;
      state.updateJobError = null;
      state.updateJobSuccess = false;
    },
    updateJobSuccess: (state, action: PayloadAction<any>) => {
      state.isUpdatingJob = false;
      state.updateJobError = null;
      state.updateJobSuccess = true;
    },
    updateJobFailure: (state, action: PayloadAction<any>) => {
      state.isUpdatingJob = false;
      state.updateJobError = action.payload;
      state.updateJobSuccess = false;
    },
    // Get Cost Codes Reducers
    getCostCodesRequest: (state) => {
      state.isLoading = true;
      state.getCostCodesError = null;
    },
    getCostCodesSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.getCostCodesError = null;
      // Store cost codes data
      if (action.payload?.data) {
        state.costCodes = action.payload.data.data || [];
        state.costCodesPagination = {
          total: action.payload.data.total || 0,
          page: action.payload.data.page || 1,
          pageSize: action.payload.data.pageSize || 15,
        };
      }
    },
    getCostCodesFailure: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.getCostCodesError = action.payload;
    },
    // Create Cost Code Reducers
    createCostCodeRequest: (state) => {
      state.isCreatingCostCode = true;
      state.createCostCodeError = null;
      state.createCostCodeSuccess = false;
    },
    createCostCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isCreatingCostCode = false;
      state.createCostCodeError = null;
      state.createCostCodeSuccess = true;
    },
    createCostCodeFailure: (state, action: PayloadAction<any>) => {
      state.isCreatingCostCode = false;
      state.createCostCodeError = action.payload;
      state.createCostCodeSuccess = false;
    },
    // Update Cost Code Reducers
    updateCostCodeRequest: (state) => {
      state.isUpdatingCostCode = true;
      state.updateCostCodeError = null;
      state.updateCostCodeSuccess = false;
    },
    updateCostCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isUpdatingCostCode = false;
      state.updateCostCodeError = null;
      state.updateCostCodeSuccess = true;
    },
    updateCostCodeFailure: (state, action: PayloadAction<any>) => {
      state.isUpdatingCostCode = false;
      state.updateCostCodeError = action.payload;
      state.updateCostCodeSuccess = false;
    },
    // Delete Cost Code Reducers
    deleteCostCodeRequest: (state) => {
      state.isDeletingCostCode = true;
      state.deleteCostCodeError = null;
      state.deleteCostCodeSuccess = false;
    },
    deleteCostCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isDeletingCostCode = false;
      state.deleteCostCodeError = null;
      state.deleteCostCodeSuccess = true;
    },
    deleteCostCodeFailure: (state, action: PayloadAction<any>) => {
      state.isDeletingCostCode = false;
      state.deleteCostCodeError = action.payload;
      state.deleteCostCodeSuccess = false;
    },
    // Get WC Codes Reducers
    getWCCodesRequest: (state) => {
      state.isLoadingWCCodes = true;
      state.getWCCodesError = null;
    },
    getWCCodesSuccess: (state, action: PayloadAction<any>) => {
      state.isLoadingWCCodes = false;
      state.getWCCodesError = null;
      // Store WC codes data
      if (action.payload?.data) {
        state.wcCodes = action.payload.data.data || [];
        state.wcCodesPagination = {
          total: action.payload.data.total || 0,
          page: action.payload.data.page || 1,
          pageSize: action.payload.data.pageSize || 15,
        };
      }
    },
    getWCCodesFailure: (state, action: PayloadAction<any>) => {
      state.isLoadingWCCodes = false;
      state.getWCCodesError = action.payload;
    },
    // Create WC Code Reducers
    createWCCodeRequest: (state) => {
      state.isCreatingWCCode = true;
      state.createWCCodeError = null;
      state.createWCCodeSuccess = false;
    },
    createWCCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isCreatingWCCode = false;
      state.createWCCodeError = null;
      state.createWCCodeSuccess = true;
    },
    createWCCodeFailure: (state, action: PayloadAction<any>) => {
      state.isCreatingWCCode = false;
      state.createWCCodeError = action.payload;
      state.createWCCodeSuccess = false;
    },
    // Update WC Code Reducers
    updateWCCodeRequest: (state) => {
      state.isUpdatingWCCode = true;
      state.updateWCCodeError = null;
      state.updateWCCodeSuccess = false;
    },
    updateWCCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isUpdatingWCCode = false;
      state.updateWCCodeError = null;
      state.updateWCCodeSuccess = true;
    },
    updateWCCodeFailure: (state, action: PayloadAction<any>) => {
      state.isUpdatingWCCode = false;
      state.updateWCCodeError = action.payload;
      state.updateWCCodeSuccess = false;
    },
    // Delete WC Code Reducers
    deleteWCCodeRequest: (state) => {
      state.isDeletingWCCode = true;
      state.deleteWCCodeError = null;
      state.deleteWCCodeSuccess = false;
    },
    deleteWCCodeSuccess: (state, action: PayloadAction<any>) => {
      state.isDeletingWCCode = false;
      state.deleteWCCodeError = null;
      state.deleteWCCodeSuccess = true;
    },
    deleteWCCodeFailure: (state, action: PayloadAction<any>) => {
      state.isDeletingWCCode = false;
      state.deleteWCCodeError = action.payload;
      state.deleteWCCodeSuccess = false;
    },
    // Update Approval Rules Reducers
    updateApprovalRulesRequest: (state) => {
      state.isUpdatingApprovalRules = true;
      state.updateApprovalRulesError = null;
      state.updateApprovalRulesSuccess = false;
    },
    updateApprovalRulesSuccess: (state, action: PayloadAction<any>) => {
      state.isUpdatingApprovalRules = false;
      state.updateApprovalRulesError = null;
      state.updateApprovalRulesSuccess = true;
    },
    updateApprovalRulesFailure: (state, action: PayloadAction<any>) => {
      state.isUpdatingApprovalRules = false;
      state.updateApprovalRulesError = action.payload;
      state.updateApprovalRulesSuccess = false;
    },
    // Get COI Vendors Reducers
    getCOIVendorsRequest: (state) => {
      state.isLoadingCOIVendors = true;
      state.getCOIVendorsError = null;
    },
    getCOIVendorsSuccess: (state, action: PayloadAction<any>) => {
      state.isLoadingCOIVendors = false;
      state.getCOIVendorsError = null;
      // Store COI vendors data
      if (action.payload?.data) {
        state.coiVendors = action.payload.data.data || [];
      }
    },
    getCOIVendorsFailure: (state, action: PayloadAction<any>) => {
      state.isLoadingCOIVendors = false;
      state.getCOIVendorsError = action.payload;
    },
    // Create COI Vendor Reducers
    createCOIVendorRequest: (state) => {
      state.isCreatingCOIVendor = true;
      state.createCOIVendorError = null;
      state.createCOIVendorSuccess = false;
    },
    createCOIVendorSuccess: (state, action: PayloadAction<any>) => {
      state.isCreatingCOIVendor = false;
      state.createCOIVendorError = null;
      state.createCOIVendorSuccess = true;
    },
    createCOIVendorFailure: (state, action: PayloadAction<any>) => {
      state.isCreatingCOIVendor = false;
      state.createCOIVendorError = action.payload;
      state.createCOIVendorSuccess = false;
    },
    // Update COI Vendor Reducers
    updateCOIVendorRequest: (state) => {
      state.isUpdatingCOIVendor = true;
      state.updateCOIVendorError = null;
      state.updateCOIVendorSuccess = false;
    },
    updateCOIVendorSuccess: (state, action: PayloadAction<any>) => {
      state.isUpdatingCOIVendor = false;
      state.updateCOIVendorError = null;
      state.updateCOIVendorSuccess = true;
    },
    updateCOIVendorFailure: (state, action: PayloadAction<any>) => {
      state.isUpdatingCOIVendor = false;
      state.updateCOIVendorError = action.payload;
      state.updateCOIVendorSuccess = false;
    },
  },
});

export const {
  getJobsRequest,
  getJobsSuccess,
  getJobsFailure,
  createJobRequest,
  createJobSuccess,
  createJobFailure,
  updateJobRequest,
  updateJobSuccess,
  updateJobFailure,
  getCostCodesRequest,
  getCostCodesSuccess,
  getCostCodesFailure,
  createCostCodeRequest,
  createCostCodeSuccess,
  createCostCodeFailure,
  updateCostCodeRequest,
  updateCostCodeSuccess,
  updateCostCodeFailure,
  deleteCostCodeRequest,
  deleteCostCodeSuccess,
  deleteCostCodeFailure,
  getWCCodesRequest,
  getWCCodesSuccess,
  getWCCodesFailure,
  createWCCodeRequest,
  createWCCodeSuccess,
  createWCCodeFailure,
  updateWCCodeRequest,
  updateWCCodeSuccess,
  updateWCCodeFailure,
  deleteWCCodeRequest,
  deleteWCCodeSuccess,
  deleteWCCodeFailure,
  updateApprovalRulesRequest,
  updateApprovalRulesSuccess,
  updateApprovalRulesFailure,
  getCOIVendorsRequest,
  getCOIVendorsSuccess,
  getCOIVendorsFailure,
  createCOIVendorRequest,
  createCOIVendorSuccess,
  createCOIVendorFailure,
  updateCOIVendorRequest,
  updateCOIVendorSuccess,
  updateCOIVendorFailure,
} = companySlice.actions;

export default companySlice.reducer;
