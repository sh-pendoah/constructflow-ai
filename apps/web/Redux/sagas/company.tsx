import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-hot-toast";
import companyActions, { COMPANY_ACTION_TYPES } from "../actions/company";
import {
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
} from "../reducers/company";
import { getJobsApi, createJobApi, updateJobApi, getCostCodesApi, createCostCodeApi, updateCostCodeApi, deleteCostCodeApi, getWCCodesApi, createWCCodeApi, updateWCCodeApi, deleteWCCodeApi, updateApprovalRulesApi, getCOIVendorsApi, createCOIVendorApi, updateCOIVendorApi } from "../Apis/company";

function* getJobsSaga(action: any): any {
  try {
    yield put(getJobsRequest());
    const params = action.payload || {};
    const resp = yield call(getJobsApi, params);
    yield put(getJobsSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch jobs";
    yield put(getJobsFailure(errorMessage));
  }
}

function* createJobSaga(action: any): any {
  try {
    yield put(createJobRequest());
    const resp = yield call(createJobApi, action.payload);
    yield put(createJobSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Job created successfully."
      );
    }
    
    // Refetch jobs after successful creation (without filters, will use default)
    yield put(companyActions.getJobsRequest({ status: "all" }));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to create job";
    toast.error(errorMessage);
    yield put(createJobFailure(errorMessage));
  }
}

function* updateJobSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.jobId) {
      throw new Error("Job ID is required");
    }
    
    yield put(updateJobRequest());
    const { jobId, ...payload } = action.payload;
    const resp = yield call(updateJobApi, jobId, payload);
    yield put(updateJobSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Job updated successfully."
      );
    }
    
    // Refetch jobs after successful update (without filters, will use default)
    yield put(companyActions.getJobsRequest({ status: "all" }));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update job";
    toast.error(errorMessage);
    yield put(updateJobFailure(errorMessage));
  }
}

function* getCostCodesSaga(): any {
  try {
    yield put(getCostCodesRequest());
    const resp = yield call(getCostCodesApi);
    yield put(getCostCodesSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch cost codes";
    yield put(getCostCodesFailure(errorMessage));
  }
}

function* createCostCodeSaga(action: any): any {
  try {
    yield put(createCostCodeRequest());
    const resp = yield call(createCostCodeApi, action.payload);
    yield put(createCostCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Cost code created successfully."
      );
    }
    
    // Refetch cost codes after successful creation
    yield put(getCostCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to create cost code";
    toast.error(errorMessage);
    yield put(createCostCodeFailure(errorMessage));
  }
}

function* updateCostCodeSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.costCodeId) {
      throw new Error("Cost code ID is required");
    }
    
    yield put(updateCostCodeRequest());
    const { costCodeId, ...payload } = action.payload;
    const resp = yield call(updateCostCodeApi, costCodeId, payload);
    yield put(updateCostCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Cost code updated successfully."
      );
    }
    
    // Refetch cost codes after successful update
    yield put(getCostCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update cost code";
    toast.error(errorMessage);
    yield put(updateCostCodeFailure(errorMessage));
  }
}

function* deleteCostCodeSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload) {
      throw new Error("Cost code ID is required");
    }
    
    yield put(deleteCostCodeRequest());
    const resp = yield call(deleteCostCodeApi, action.payload);
    yield put(deleteCostCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Cost code deleted successfully."
      );
    }
    
    // Refetch cost codes after successful deletion
    yield put(getCostCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to delete cost code";
    toast.error(errorMessage);
    yield put(deleteCostCodeFailure(errorMessage));
  }
}

function* getWCCodesSaga(): any {
  try {
    yield put(getWCCodesRequest());
    const resp = yield call(getWCCodesApi);
    yield put(getWCCodesSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch WC codes";
    yield put(getWCCodesFailure(errorMessage));
  }
}

function* createWCCodeSaga(action: any): any {
  try {
    yield put(createWCCodeRequest());
    const resp = yield call(createWCCodeApi, action.payload);
    yield put(createWCCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "WC code created successfully."
      );
    }
    
    // Refetch WC codes after successful creation
    yield put(getWCCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to create WC code";
    toast.error(errorMessage);
    yield put(createWCCodeFailure(errorMessage));
  }
}

function* updateWCCodeSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.wcCodeId) {
      throw new Error("WC code ID is required");
    }
    
    yield put(updateWCCodeRequest());
    const { wcCodeId, ...payload } = action.payload;
    const resp = yield call(updateWCCodeApi, wcCodeId, payload);
    yield put(updateWCCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "WC code updated successfully."
      );
    }
    
    // Refetch WC codes after successful update
    yield put(getWCCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update WC code";
    toast.error(errorMessage);
    yield put(updateWCCodeFailure(errorMessage));
  }
}

function* deleteWCCodeSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload) {
      throw new Error("WC code ID is required");
    }
    
    yield put(deleteWCCodeRequest());
    const resp = yield call(deleteWCCodeApi, action.payload);
    yield put(deleteWCCodeSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "WC code deleted successfully."
      );
    }
    
    // Refetch WC codes after successful deletion
    yield put(getWCCodesRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to delete WC code";
    toast.error(errorMessage);
    yield put(deleteWCCodeFailure(errorMessage));
  }
}

function* updateApprovalRulesSaga(action: any): any {
  try {
    yield put(updateApprovalRulesRequest());
    const resp = yield call(updateApprovalRulesApi, action.payload);
    yield put(updateApprovalRulesSuccess(resp.data));
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "Approval rules updated successfully."
      );
    }
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update approval rules";
    toast.error(errorMessage);
    yield put(updateApprovalRulesFailure(errorMessage));
  }
}

function* getCOIVendorsSaga(): any {
  try {
    yield put(getCOIVendorsRequest());
    const resp = yield call(getCOIVendorsApi);
    yield put(getCOIVendorsSuccess(resp.data));
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to fetch COI vendors";
    yield put(getCOIVendorsFailure(errorMessage));
  }
}

function* createCOIVendorSaga(action: any): any {
  try {
    yield put(createCOIVendorRequest());
    const resp = yield call(createCOIVendorApi, action.payload);
    yield put(createCOIVendorSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "COI vendor created successfully."
      );
    }
    
    // Refetch COI vendors after successful creation
    yield put(getCOIVendorsRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to create COI vendor";
    toast.error(errorMessage);
    yield put(createCOIVendorFailure(errorMessage));
  }
}

function* updateCOIVendorSaga(action: any): any {
  try {
    // Validate payload
    if (!action.payload || !action.payload.vendorId || !action.payload.formData) {
      throw new Error("Vendor ID and form data are required");
    }
    
    yield put(updateCOIVendorRequest());
    const { vendorId, formData } = action.payload;
    const resp = yield call(updateCOIVendorApi, vendorId, formData);
    yield put(updateCOIVendorSuccess(resp.data));
    
    // Show success message
    if (resp.data.status || resp.data.success || resp.status === 200) {
      toast.success(
        resp.data?.responseDescription || resp.data?.message || "COI vendor updated successfully."
      );
    }
    
    // Refetch COI vendors after successful update
    yield put(getCOIVendorsRequest());
  } catch (e: any) {
    const errorMessage =
      e?.response?.data?.responseDescription || e?.response?.data?.message || "Failed to update COI vendor";
    toast.error(errorMessage);
    yield put(updateCOIVendorFailure(errorMessage));
  }
}

export default function* companySaga() {
  yield takeLatest(COMPANY_ACTION_TYPES.GET_JOBS_REQUEST, getJobsSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.CREATE_JOB_REQUEST, createJobSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.UPDATE_JOB_REQUEST, updateJobSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.GET_COST_CODES_REQUEST, getCostCodesSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.CREATE_COST_CODE_REQUEST, createCostCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.UPDATE_COST_CODE_REQUEST, updateCostCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.DELETE_COST_CODE_REQUEST, deleteCostCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.GET_WC_CODES_REQUEST, getWCCodesSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.CREATE_WC_CODE_REQUEST, createWCCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.UPDATE_WC_CODE_REQUEST, updateWCCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.DELETE_WC_CODE_REQUEST, deleteWCCodeSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.UPDATE_APPROVAL_RULES_REQUEST, updateApprovalRulesSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.GET_COI_VENDORS_REQUEST, getCOIVendorsSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.CREATE_COI_VENDOR_REQUEST, createCOIVendorSaga);
  yield takeLatest(COMPANY_ACTION_TYPES.UPDATE_COI_VENDOR_REQUEST, updateCOIVendorSaga);
}
