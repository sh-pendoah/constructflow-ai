import { all, fork } from "redux-saga/effects";
import authSaga from "./auth";
import companySaga from "./company";

/**
 * Root Saga
 * Combines all sagas
 */
export default function* rootSaga() {
  yield all([fork(authSaga), fork(companySaga)]);
}

