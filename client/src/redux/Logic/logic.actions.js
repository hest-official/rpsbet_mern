import {
    GAMETYPE_LOADED,
    ROOMINFO_LOADED,
    ROOMS_LOADED,
    BET_SUCCESS,
    BET_FAIL,
    MSG_CREATE_ROOM_FAIL,
    MSG_CREATE_ROOM_SUCCESS,
    MSG_ROOMS_LOAD_FAILED,
    MSG_GAMETYPE_LOAD_FAILED,
    SET_GAME_MODE,
    SET_CUR_ROOM_INFO,
    SET_URL
  } from '../types';
  import axios from '../../util/Api';
  import history from '../history';
  
  // CreateRoom
  export const createRoom = (room_info) => async dispatch => {
    const body = JSON.stringify(room_info);
    try {
      const res = await axios.post('/game/rooms', body);
      if (res.data.success) {
        history.push('/join');
        dispatch({ type: MSG_CREATE_ROOM_SUCCESS, payload: res.data.message });
      } else {
        dispatch({ type: MSG_CREATE_ROOM_FAIL });
      }
    } catch (err) {
      console.log('err***', err);
      dispatch({ type: MSG_CREATE_ROOM_FAIL, payload: err });
    }
  };

  // joinRoom
  export const bet = (bet_info) => async dispatch => {
    const body = JSON.stringify(bet_info);
    try {
      const res = await axios.post('/game/bet', body);
      if (res.data.success) {
        // dispatch({ type: BET_SUCCESS, payload: res.data });
        if (res.data.betResult === 1) {
          alert('Nice, You Win!');
        } else if (res.data.betResult === 0) {
          alert('Draw, No Winner!');
        } else {
          alert('Oops, You Lost!');
        }
        history.push('/join');
      } else {
        dispatch({ type: BET_FAIL });
      }
    } catch (err) {
      console.log('err***', err);
      dispatch({ type: BET_FAIL, payload: err });
    }
  };

  // GetRoomInfo
  export const getRoomInfo = (room_id) => async dispatch => {
    try {
      const res = await axios.get('/game/room/' + room_id);
      if (res.data.success) {
        dispatch({ type: ROOMINFO_LOADED, payload: res.data });
      } else {
        dispatch({ type: MSG_ROOMS_LOAD_FAILED });
      }
    } catch (err) {
      console.log('err***', err);
      dispatch({ type: MSG_ROOMS_LOAD_FAILED, payload: err });
    }
  };
  
  // GetRoomList
  export const getRoomList = (search_condition) => async dispatch => {
    const body = JSON.stringify(search_condition);
    try {
      const res = await axios.get('/game/rooms', body);
      if (res.data.success) {
        dispatch({ type: ROOMS_LOADED, payload: res.data });
      } else {
        dispatch({ type: MSG_ROOMS_LOAD_FAILED });
      }
    } catch (err) {
      console.log('err***', err);
      dispatch({ type: MSG_ROOMS_LOAD_FAILED, payload: err });
    }
  };
  
  // GetGameTypeList
  export const getGameTypeList = () => async dispatch => {
    try {
      const res = await axios.get('/game/game_types');
      if (res.data.success) {
        dispatch({ type: GAMETYPE_LOADED, payload: res.data });
      } else {
        dispatch({ type: MSG_GAMETYPE_LOAD_FAILED });
      }
    } catch (err) {
      console.log('err***', err);
      dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
    }
  };

  export const setGameMode = game_mode => dispatch => {
    dispatch({ type: SET_GAME_MODE, payload: game_mode });
  };

  export const setCurRoomInfo = room_info => dispatch => {
    dispatch({ type: SET_CUR_ROOM_INFO, payload: room_info });
  };

  export const setUrl = url => dispatch => {
    dispatch({ type: SET_URL, payload: url });
  };
  