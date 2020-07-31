import {
  GAMETYPE_LOADED,
  ROOMINFO_LOADED,
  START_LOADING,
  END_LOADING,
  ROOMS_LOADED,
  BET_FAIL,
  BET_SUCCESS,
  MSG_CREATE_ROOM_FAIL,
  MSG_CREATE_ROOM_SUCCESS,
  MSG_ROOMS_LOAD_FAILED,
  MSG_GAMETYPE_LOAD_FAILED,
  SET_GAME_MODE,
  SET_CUR_ROOM_INFO,
  SET_URL,
  MY_GAMES_LOADED,
  MY_HISTORY_LOADED,
  SET_CHAT_ROOM_INFO,
  HISTORY_LOADED,
  NEW_TRANSACTION,
  OPEN_ALERT_MODAL
} from '../types';
import axios from '../../util/Api';
import history from '../history';

// CreateRoom
export const createRoom = (room_info) => async dispatch => {
  const body = JSON.stringify(room_info);
  try {
    dispatch({ type: START_LOADING });
    const res = await axios.post('/game/rooms', body);

    if (res.data.success) {
      if (room_info.game_type === 3) {
        dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'warning', title: 'RPS Bet', message: 'Time is Up!'} });
      }
      history.push('/join');
      dispatch({ type: MSG_CREATE_ROOM_SUCCESS, payload: res.data.message });
      dispatch({ type: NEW_TRANSACTION, payload: res.data.newTransaction });
    } else {
      dispatch({ type: MSG_CREATE_ROOM_FAIL });
    }

    dispatch({ type: END_LOADING });

  } catch (err) {
    dispatch({ type: MSG_CREATE_ROOM_FAIL, payload: err });
  }
};

// joinRoom
export const bet = (bet_info) => async dispatch => {
  const body = JSON.stringify(bet_info);
  try {
    dispatch({ type: START_LOADING });
    const res = await axios.post('/game/bet', body);
    dispatch({ type: END_LOADING });

    if (res.data.success) {
      if (res.data.betResult === -100) {
        dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'warning', title: 'Warning!', message: res.data.message} });
        history.push('/join');
        return;
      }
      dispatch({ type: NEW_TRANSACTION, payload: res.data.newTransaction });

      if (bet_info.game_type === 'Mystery Box') {
        dispatch({ type: BET_SUCCESS, payload: res.data });
      } else if (bet_info.game_type === 'Brain Game') {
        if (res.data.betResult === 1) {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'win', title: 'Congratulations!', message: 'WOW, What a BRAIN BOX - You WIN!'} });
        } else if (res.data.betResult === 0) {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'draw', title: 'Draw', message: 'Draw, No Winner! PR will be split.'} });
        } else {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'lost', title: 'Oops!', message: 'Oops, back to school for you loser!!'} });
        }
        history.push('/join');
      } else {
        if (res.data.betResult === 1) {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'win', title: 'Congratulations!', message: 'Nice, You Win!'} });
        } else if (res.data.betResult === 0) {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'draw', title: 'Draw', message: 'Draw, No Winner!'} });
        } else {
          dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'lost', title: 'Oops!', message: 'Oops, You Lost!'} });
        }
        history.push('/join');
      }
    } else {
      dispatch({ type: BET_FAIL });
    }
  } catch (err) {
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
    }
  } catch (err) {
  }
};

// GetHistory
export const getHistory = () => async dispatch => {
  try {
    const res = await axios.get('/game/history');
    if (res.data.success) {
      dispatch({ type: HISTORY_LOADED, payload: res.data.history });
    }
  } catch (err) {
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
    dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
  }
};

export const getMyGames = () => async dispatch => {
  try {
    const res = await axios.get('/game/my_games');
    if (res.data.success) {
      dispatch({ type: MY_GAMES_LOADED, payload: res.data.myGames });
    } else {
      dispatch({ type: MSG_GAMETYPE_LOAD_FAILED });
    }
  } catch (err) {
    dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
  }
};

export const endGame = (room_id) => async dispatch => {
  try {
    const res = await axios.post('/game/end_game', {room_id});
    if (res.data.success) {
      dispatch({ type: MY_GAMES_LOADED, payload: res.data.myGames });
      dispatch({ type: NEW_TRANSACTION, payload: res.data.newTransaction });

    } else {
      if (res.data.already_finished) {
        dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'warning', title: 'Warning!', message: res.data.message} });
      } else {
        dispatch({ type: MSG_GAMETYPE_LOAD_FAILED });
      }
    }
  } catch (err) {
    dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
  }
}

export const getMyHistory = () => async dispatch => {
  try {
    const res = await axios.get('/game/my_history');
    if (res.data.success) {
      dispatch({ type: MY_HISTORY_LOADED, payload: res.data.myHistory });
    } else {
      dispatch({ type: MSG_GAMETYPE_LOAD_FAILED });
    }
  } catch (err) {
    dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
  }
}

export const getChatRoomInfo = (user_id) => async dispatch => {
  try {
    const res = await axios.post('/game/get_chat_room_info', {user_id});
    if (res.data.success) {
      dispatch({ type: SET_CHAT_ROOM_INFO, payload: res.data.chatRoomInfo });
    } else {
      dispatch({ type: MSG_GAMETYPE_LOAD_FAILED });
    }
  } catch (err) {
    dispatch({ type: MSG_GAMETYPE_LOAD_FAILED, payload: err });
  }
}

export const setRoomList = (data) => dispatch => {
  dispatch({ type: ROOMS_LOADED, payload: data });
}

export const setGameMode = game_mode => dispatch => {
  dispatch({ type: SET_GAME_MODE, payload: game_mode });
};

export const setCurRoomInfo = room_info => dispatch => {
  dispatch({ type: SET_CUR_ROOM_INFO, payload: room_info });
  if (room_info.game_type === 'Mystery Box') {
    dispatch({ type: BET_SUCCESS, payload: {betResult: -1} });
  }
};

export const setChatRoomInfo = room_info => dispatch => {
  dispatch({ type: SET_CHAT_ROOM_INFO, payload: room_info });
};

const getNow = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = "0" + (date.getMonth() + 1);
  const day = "0" + date.getDate();
  const seconds = "0" + date.getSeconds();
  const minutes = "0" + date.getMinutes();
  const hours = "0" + date.getHours();

  return `${year}-${month.substr(-2)}-${day.substr(-2)}T${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(-2)}.000Z`;
}

export const addChatLog = chatLog => (dispatch, getState) => {
  const myId = getState().auth.user._id;
  let newHistory = JSON.parse(JSON.stringify(getState().logic.myHistory));

  const otherId = myId === chatLog.from ? chatLog.to : chatLog.from;

  console.log(chatLog);
  console.log(otherId);
  console.log(newHistory);

  newHistory[otherId] = {
    ...newHistory[otherId],
    unread_message_count: newHistory[otherId] ? newHistory[otherId].unread_message_count + 1 : 1,
    _id: otherId,
    message: chatLog.message,
    created_at_str: chatLog.created_at,
    updated_at: getNow()
  };
  
  dispatch({ type: MY_HISTORY_LOADED, payload: newHistory });

  let chatRoomInfo = JSON.parse(JSON.stringify(getState().logic.chatRoomInfo));
  if (chatRoomInfo.user_id === otherId) {
    chatRoomInfo.chatLogs.push(chatLog);
    dispatch({ type: SET_CHAT_ROOM_INFO, payload: chatRoomInfo });
  }
}

export const addNewTransaction = data => dispatch => {
  dispatch({ type: NEW_TRANSACTION, payload: data });
};

export const setUrl = url => dispatch => {
  dispatch({ type: SET_URL, payload: url });
};
