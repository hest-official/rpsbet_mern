import api from '../../util/Api';
import history from '../history';

import {
  MSG_ERROR,
  MSG_WARNING,
  CUSTOMER_QUERY,
  PAGINATION_FOR_CUSTOMER,
  PAGINATION_FOR_ACTIVITY,
  LOADING_CUSTOMER_TABLE,
  ACTIVITY_QUERY,
  ADD_MAIN_INFO
} from '../types';

export const acPaginationCustomer = (pagination, page) => async (
  dispatch,
  getState
) => {
  let payload = {
    pagination,
    page
  };
  dispatch({ type: LOADING_CUSTOMER_TABLE, payload: true });
  dispatch({ type: PAGINATION_FOR_CUSTOMER, payload });
  let body = {};
  body.pagination = getState().customerReducer.pagination;
  body.page = getState().customerReducer.page;
  try {
    const { data } = await api.get('user', {
      params: body
    });
    if (data.success) {
      dispatch({ type: CUSTOMER_QUERY, payload: data });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  }
};

export const queryCustomer = (pagination, page) => async (dispatch, getState) => {
  dispatch({ type: LOADING_CUSTOMER_TABLE, payload: true });
  let payload = {
    pagination,
    page
  };
  dispatch({ type: PAGINATION_FOR_CUSTOMER, payload });
  let body = {};
  body.pagination = getState().customerReducer.pagination;
  body.page = getState().customerReducer.page;
  try {
    const { data } = await api.get('user', { params: body });
    if (data.success) {
      dispatch({ type: CUSTOMER_QUERY, payload: data });
      dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
      dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  }
};

export const queryActivity = (pagination, page) => async (dispatch, getState) => {
  dispatch({ type: LOADING_CUSTOMER_TABLE, payload: true });
  let payload = {
    pagination,
    page
  };
  dispatch({ type: PAGINATION_FOR_CUSTOMER, payload });
  let body = {};
  body.pagination = getState().customerReducer.pagination;
  body.page = getState().customerReducer.activity_page;
  try {
    const { data } = await api.get('user/activity', { params: body });
    if (data.success) {
      dispatch({ type: ACTIVITY_QUERY, payload: data });
      dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
      dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  }
};

export const acPaginationActivity = (pagination, page) => async (
  dispatch,
  getState
) => {
  let payload = {
    pagination,
    page
  };
  dispatch({ type: LOADING_CUSTOMER_TABLE, payload: true });
  dispatch({ type: PAGINATION_FOR_ACTIVITY, payload });
  let body = {};
  body.pagination = getState().customerReducer.pagination;
  body.page = getState().customerReducer.activity_page;
  try {
    const { data } = await api.get('user/activity', {
      params: body
    });
    if (data.success) {
      dispatch({ type: ACTIVITY_QUERY, payload: data });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_CUSTOMER_TABLE, payload: false });
  }
};

export const acGetCustomerInfo = _id => async dispatch => {
  try {
    const { data } = await api.post('user/get-info', {_id});
    if (data.success) {
      return data.user;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

// Update Customer
export const updateCustomer = customer => async dispatch => {
  try {
    const { data } = await api.post('user/updateCustomer', customer);
    if (data.success) {
      history.push(`/admin/customers/`);
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};
