const ObjectId = require('mongoose').Types.ObjectId;
const express = require('express');
const socket = require('../socketController.js');

const router = express.Router();
const Room = require('../model/Room');
const User = require('../model/User');
const GameType = require('../model/GameType');
const GameLog = require('../model/GameLog');
const RoomBoxPrize = require('../model/RoomBoxPrize');
const Question = require('../model/Question');
const Answer = require('../model/Answer');
const BrainGameType = require('../model/BrainGameType');
const Message = require('../model/Message');
const moment = require('moment');
const auth = require('../middleware/auth');
const Transaction = require('../model/Transaction');
const SystemSetting = require('../model/SystemSetting');

let user_access_log = {};

getCommission = async () => {
	const commission = await SystemSetting.findOne({name: 'commission'});
	if (commission.value) {
		return parseFloat(commission.value);
	}

	return 0;
}

// /api/game_types call
router.get('/game_types', async (req, res) => {
	try {
		const gameTypes = await GameType.find({});
		res.json({
			success: true,
			query: req.query,
			gameTypeList: gameTypes
		});
	} catch (err) {
		res.json({
			success: false,
			err: message
		});
	}
});

router.post('/checkGamePassword', async (req, res) => {
	try {
		const room = await Room.findOne({_id: req.body.room_id});
		if (room.room_password === req.body.password) {
			res.json({
				success: true
			});
		} else {
			res.json({
				success: false,
			});
		}
	} catch (err) {
		res.json({
			success: false,
			err: message
		});
	}
});

// /api/room/:id call
router.get('/room/:id', async (req, res) => {
	try {
		const room = await Room.findOne({_id: req.params.id})
						.populate({path: 'game_type', model: GameType})
						.populate({path: 'brain_game_type', model: BrainGameType});
		const gameLogList = await GameLog.find({room: room});
		const boxPrizeList = await RoomBoxPrize.find({room: room}).sort({_id : 'asc'});

		res.json({
			success: true,
			query: req.query,
			roomInfo: {
				_id: room['_id'],
				creator_id: room['creator'],
				game_type: room['game_type']['game_type_name'],
				bet_amount: room['user_bet'],
				spleesh_bet_unit: room['spleesh_bet_unit'],
				brain_game_type: room['brain_game_type'],
				brain_game_score: room['brain_game_score'],
				qs_game_type: room['qs_game_type'],
				game_log_list: gameLogList,
				box_list: boxPrizeList,
				is_private: room['is_private']
			}
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

router.get('/question/:brain_game_type', async (req, res) => {
	try {
		const question = await Question.aggregate([
			{
				$match: {brain_game_type: new ObjectId(req.params.brain_game_type)}
			}, {
				$sample: {size: 1}
			}
		]);

		const correctAnswer = await Answer.aggregate([
			{
				$match: {question: new ObjectId(question[0]._id), is_correct_answer: true}
			}, {
				$sample: {size: 1}
			}
		]);

		const wrongAnswers = await Answer.aggregate([
			{
				$match: {question: new ObjectId(question[0]._id), is_correct_answer: false}
			}, {
				$sample: {size: 3}
			}
		]);

		let answers = [{_id: correctAnswer[0]._id, answer: correctAnswer[0].answer}];

		wrongAnswers.forEach(answer => {
			answers.push({
				_id: answer._id,
				answer: answer.answer
			});
		});

		answers.sort(() => Math.random() - 0.5);

		res.json({
			success: true,
			question: {_id: question[0]._id, question: question[0].question},
			// question: {_id: question._id, question: question.question},
			answers
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

router.post('/answer', async (req, res) => {
	try {
		const count = await Answer.countDocuments({
			_id: req.body.answer_id,
			question: new ObjectId(req.body.question_id),
			is_correct_answer: true
		});
		res.json({
			success: true,
			answer_result: count > 0 ? 1 : -1
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

getHistory = async (keyword) => {
	try {
		const gameLogList = await GameLog.find()
			.sort({created_at: 'desc'})
			// .limit(10)
			.populate({path: 'room', model: Room})
			.populate({path: 'game_type', model: GameType})
			.populate({path: 'creator', model: User})
			.populate({path: 'joined_user', model: User});

		let result = [];
		const commission = await getCommission();
		const commissionRate = (100 - commission) / 100.0;

		let count = 0;
		gameLogList.forEach(gameLog => {
			try {
				if (count >= 10) { return; }
				let temp = {
					_id: gameLog._id,
					room_name: gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'],
					history: '',
					// created_at: moment(gameLog['created_at']).fromNow()
					created_at: gameLog['created_at']
				};
		
				if (keyword === '' || temp.room_name.toLowerCase().includes(keyword.toLowerCase()) || gameLog['creator']['username'].toLowerCase().includes(keyword.toLowerCase())) {
					if (gameLog['game_type']['game_type_name'] === 'Classic RPS') {
						if (gameLog.game_result === 1) {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['bet_amount'] * 2 * commissionRate) 
								+ "</span>] against <img class='avatar' src='" + gameLog['creator']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['creator']['username'] + "] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						} else if (gameLog.game_result === 0) {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] split [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['bet_amount'] * 2 * commissionRate) 
								+ "</span>] with <img class='avatar' src='" + gameLog['creator']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['creator']['username'] + "] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						} else {
							temp.history = "<img class='avatar' src='" + gameLog['creator']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['creator']['username'] + "] won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['bet_amount'] * 2 * commissionRate) 
								+ "</span>] against <img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						}
					} else if (gameLog['game_type']['game_type_name'] === 'Quick Shoot') {
						if (gameLog.game_result === 1) {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" + gameLog['joined_user']['username'] 
								+ "] scored a goal and won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['bet_amount'] * gameLog['room']['qs_game_type'] * commissionRate) 
								+ "</span>] in [<span style='color: #C83228;'>" 
								+ gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						} else {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" + gameLog['joined_user']['username']
								+ "] missed his shot and lost [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['user_bet']) + "</span>] in [<span style='color: #C83228;'>" 
								+ gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						}
					} else if (gameLog['game_type']['game_type_name'] === 'Spleesh!') {
						if (gameLog.game_result === 1) {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] guessed [<span style='color: #02c526;'>" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and won [<span style='color: #02c526;'>£" + updateDigitToPoint2((gameLog['room']['host_pr'] + gameLog['room']['bet_amount']) * commissionRate) 
								+ "</span>] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						} else if (gameLog.game_result === -100) { //end game
							temp.history = "<img class='avatar' src='" + gameLog['creator']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['creator']['username'] + "] ended [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] 
								+ '-' + gameLog['room']['room_number'] + "</span>] and won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount']) + "</span>]";
						} else {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] guessed [<span style='color: #02c526;'>" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and lost in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						}
					} else if (gameLog['game_type']['game_type_name'] === 'Mystery Box') {
						if (gameLog.game_result === 0) {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] opened a box [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and won [<span style='color: #02c526;'>Nothing</span>] in [<span style='color: #C83228;'>" 
								+ gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						} else if (gameLog.game_result === -100) { //end game
							temp.history = "<img class='avatar' src='" + gameLog['creator']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['creator']['username'] + "] ended [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] 
								+ '-' + gameLog['room']['room_number'] + "</span>] and won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount'] * commissionRate) + "</span>]";
						} else {
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] opened a box [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['game_result'] * commissionRate) + "</span>] in [<span style='color: #C83228;'>" 
								+ gameLog['game_type']['short_name'] + '-' + gameLog['room']['room_number'] + "</span>]";
						}
					} else if (gameLog['game_type']['game_type_name'] === 'Brain Game') {
						if (gameLog.game_result === 0) {   //draw          Draw, No Winner! PR will be split.
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] bet [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and split [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['pr'] * commissionRate) 
								+ "</span>] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' 
								+ gameLog['room']['room_number'] + "</span>]";
						} else if (gameLog.game_result === 1) { //win       WOW, What a BRAIN BOX - You WIN!
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
								+ gameLog['joined_user']['username'] + "] bet [<span style='color: #02c526;'>£" + gameLog['bet_amount'] 
								+ "</span>] and won [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['room']['pr'] * commissionRate) 
								+ "</span>] in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] 
								+ '-' + gameLog['room']['room_number'] + "</span>]";
						} else {    //failed    Oops, back to school for you loser!!
							temp.history = "<img class='avatar' src='" + gameLog['joined_user']['avatar'] + " ' alt='' onerror='this.src=\"../img/profile-thumbnail.svg\"' />[" 
							+ gameLog['joined_user']['username'] + "] bet [<span style='color: #02c526;'>£" + updateDigitToPoint2(gameLog['bet_amount']) 
								+ "</span>] and lost in [<span style='color: #C83228;'>" + gameLog['game_type']['short_name'] + '-' 
								+ gameLog['room']['room_number'] + "</span>]";
						}
					}
					result.push(temp);
					count++;
				}
			} catch (e) {
				return;
			}
		});

		return result;
	} catch (err) {
		return false;
	}
};

updateDigitToPoint2 = (number) => {
	if (parseFloat(number) - parseInt(number) > 0) {
		return parseFloat(number).toFixed(2);
	}
	return number;
}

getRoomList = async (pagination, page, keyword) => {
	const start = new Date();

	const rooms = await Room.find({ status: 'open' })
		.select('_id is_anonymous bet_amount creator game_type user_bet pr spleesh_bet_unit is_private brain_game_type status room_number created_at')
		.sort({created_at: 'desc'})
		.skip(pagination * page - pagination)
		.limit(pagination)
		.populate({path: 'creator', model: User})
		.populate({path: 'game_type', model: GameType})
		.populate({path: 'brain_game_type', model: BrainGameType})
	const commission = await getCommission();
	const commissionRate = (100 - commission) / 100.0;
	let count = await Room.countDocuments({ status: 'open' });
	let result = [];
	for (const room of rooms) {
		const room_id = room['game_type']['short_name'] + '-' + room['room_number'];
		try {
			if (keyword === '' || room_id.toLowerCase().includes(keyword.toLowerCase()) || room['creator']['username'].toLowerCase().includes(keyword.toLowerCase())) {
				let temp = {
					_id : room['_id'],
					creator : room['is_anonymous'] === true ? 'Anonymous' : (room['creator'] ? room['creator']['username'] : ''),
					creator_id: room['creator']['_id'],
					creator_avatar: room['creator']['avatar'],
					creator_status: room['creator']['status'],
					game_type : room['game_type'],
					user_bet : room['user_bet'],
					pr : room['pr'],
					winnings : '',
					spleesh_bet_unit: room['spleesh_bet_unit'],
					is_anonymous : room['is_anonymous'],
					is_private : room['is_private'],
					brain_game_type: room['brain_game_type'],
					status: room['status'],
					index: room['room_number'],
					created_at : moment(room['created_at']).format('YYYY-MM-DD HH:mm'),
				};
		
				if (temp.game_type.game_type_id === 1) {
					temp.winnings = "£" + updateDigitToPoint2(room['bet_amount'] * 2 * commissionRate);
				} else if (temp.game_type.game_type_id === 2) {
					const gameLogList = await GameLog.find({room: room}).sort({bet_amount: 'desc'});
					if (!gameLogList || gameLogList.length == 0) {
						temp.winnings = "£" + temp.spleesh_bet_unit * 10;
					} else {
						for (let i = 10; i > 0; i--) {
							let is_exist = false;
							for(let j = 0; j < gameLogList.length; j++) {
								if (gameLogList[j].bet_amount == i * temp.spleesh_bet_unit) {
									is_exist = true;
									break;
								}
							}

							if (!is_exist) {
								temp.winnings = "£" + (i * temp.spleesh_bet_unit);
								break;
							}
						}
					}
				} else if (temp.game_type.game_type_id === 3) {
					temp.winnings = "£" + updateDigitToPoint2((room['pr'] + room['bet_amount']) * commissionRate);
				} else if (temp.game_type.game_type_id === 4) {
					temp.winnings = "£" + updateDigitToPoint2(room['pr'] * commissionRate);
				} else if (temp.game_type.game_type_id === 5) {
					temp.winnings = "£" + updateDigitToPoint2(room['pr'] * commissionRate);
				}
		
				result.push(temp);
			}
		} catch (e) {
			console.log(e);
			console.log('room_id: ', room_id);
		}
	}

	return {
		rooms: result,
		count: count,
		page: page
	}
}

router.get('/history', async (req, res) => {
	try {
		const keyword = req.query.keyword ? req.query.keyword : '';
		const history = await getHistory(keyword);
		res.json({
			success: true,
			history: history
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

// /api/rooms call
router.get('/rooms', async (req, res) => {
	const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
	const page = req.query.page ? parseInt(req.query.page) : 1;
	const keyword = req.query.keyword ? req.query.keyword : '';

	try {
		const rooms = await getRoomList(pagination, page, keyword);
		res.json({
			success: true,
			query: req.query,
			total: rooms.count,
			roomList: rooms.rooms,
			pages: Math.ceil(rooms.count / pagination)
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

router.post('/rooms', auth, async (req, res) => {
	try {
		const start = new Date();
		if (req.body.bet_amount * 100 <= 0) {
			return res.json({
				success: false,
				message: 'Wrong bet amount!'
			});
		}

		if (req.body.bet_amount * 100 > req.user.balance) {
			return res.json({
				success: false,
				message: 'Not enough balance!'
			});
		}

		gameType = await GameType.findOne({game_type_id: parseInt(req.body.game_type)});

		if (req.body.game_type === 1) { // Classic RPS
			pr = req.body.bet_amount * 2;
			host_pr = req.body.bet_amount;
			user_bet = req.body.bet_amount;
		} else if (req.body.game_type === 2) { // Spleesh!
			user_bet = "??";
			host_pr = 0;
			pr = 0;
		} else if (req.body.game_type === 3) { // Brain Game
			pr = req.body.bet_amount;
			host_pr = req.body.bet_amount;
			user_bet = req.body.bet_amount;
		} else if (req.body.game_type == 4) {   // Mystery Box
			pr = req.body.max_prize;
			host_pr = req.body.bet_amount;
			user_bet = req.body.lowest_box_price;
		} else if (req.body.game_type == 5) {   // Quick Shoot
			pr = req.body.max_return;
			host_pr = req.body.max_return;
			user_bet = req.body.max_return - req.body.bet_amount;
		}

		const roomCount = await Room.countDocuments({});
		
		newRoom = new Room({ ...req.body, creator: req.user, game_type: gameType, user_bet: user_bet, pr: pr, host_pr: host_pr, room_number: roomCount + 1, status: 'open' });
		await newRoom.save();

		if (gameType.game_type_name === "Mystery Box") {
			req.body.box_list.forEach(box => {
				newBox = new RoomBoxPrize({
					room: newRoom,
					box_prize: box.box_prize,
					box_price: box.box_price,
					status: 'init'
				});
				newBox.save();
			});
		}

		newTransaction = new Transaction({user: req.user, amount: 0, description: 'create ' + gameType.game_type_name + ' - ' + newRoom.room_number});

		if (req.body.is_anonymous === true) {
			req.user['balance'] -= 10;
			newTransaction.amount -= 10;
		}

		req.user['balance'] -= req.body.bet_amount * 100;
		newTransaction.amount -= req.body.bet_amount * 100;

		await req.user.save();
		await newTransaction.save();

		const rooms = await getRoomList(10, 1, '');
		req.io.sockets.emit('UPDATED_ROOM_LIST', {
			total: rooms.count,
			roomList: rooms.rooms,
			pages: Math.ceil(rooms.count / 10)
		});

		const end = new Date();

		res.json({
			success: true,
			message: 'room create',
			newTransaction
		});
	} catch (err) {
		res.json({
			success: false,
			message: err
		});
	}
});

getMyRooms = async (user_id, pagination, page) => {
	const rooms = await Room.find({creator: new ObjectId(user_id), status: 'open'})
		.populate({path: 'game_type', model: GameType})
		.sort({created_at: 'desc'})
		.skip(pagination * page - pagination)
		.limit(pagination);
	const count = await Room.countDocuments({creator: new ObjectId(user_id), status: 'open'});
	
	let result = [];
	const commission = await getCommission();
	const commissionRate = (100 - commission) / 100.0;

	for (const room of rooms) {
		try {
			let temp = {
				_id : room['_id'],
				game_type : room['game_type'],
				bet_amount : room['bet_amount'],
				pr : room['host_pr'], 
				winnings : '',
				index: room['room_number'],
				endgame_amount: room['endgame_amount'],
				is_private: room['is_private'],
			};
			
			const gameLogCount = await GameLog.countDocuments({ room: new ObjectId(room._id) });

			if (temp.game_type.game_type_id === 1) { // Classic RPS
				temp.pr = updateDigitToPoint2(temp.pr * 2 * commissionRate);
			}

			if (gameLogCount === 0) {
				temp.winnings = "£" + temp.bet_amount;
			} else if (temp.game_type.game_type_id === 2) { // Spleesh!
				temp.pr = temp.pr === 0 ? temp.bet_amount : temp.pr;
				temp.winnings = "£" + updateDigitToPoint2(temp.pr  * commissionRate);
			} else if (temp.game_type.game_type_id === 3) { // Brain Game
				temp.winnings = "£" + updateDigitToPoint2((room['pr'] + room['bet_amount']) * commissionRate);
			} else if (temp.game_type.game_type_id === 4) { //Mytery Box
				temp.winnings = "£" + updateDigitToPoint2(temp.pr * commissionRate);
			} else if (temp.game_type.game_type_id === 5) { // Quick Shoot
				temp.winnings = "£" + updateDigitToPoint2(temp.pr * commissionRate);
			}

			result.push(temp);
		} catch (e) {
			console.log(e);
		}
	}

	return {
		rooms: result,
		count: count,
	};
}

router.get('/my_games', auth, async (req, res) => {
	try {
		const pagination = req.query.pagination ? parseInt(req.query.pagination) : 8;
		const page = req.query.page ? parseInt(req.query.page) : 1;
		console.log("myGames: ", 111)
		const rooms = await getMyRooms(req.user._id, pagination, page);
		console.log(rooms.length);
		res.json({
			success: true,
			myGames: rooms.rooms,
			total: rooms.count,
			pages: Math.ceil(rooms.count / pagination)
		});
	} catch (err) {
		res.json({
			success: false,
			message: err
		});
	}
});

router.post('/end_game', auth, async (req, res) => {
	try {
		if (!check_access_time(req.user._id)) {
			res.json({
				success: false,
				message: 'illregular action',
				betResult: -1000
			});

			return;
		}

		const roomInfo = await Room.findOne({_id: req.body.room_id})
						.populate({path: 'creator', model: User})
						.populate({path: 'game_type', model: GameType});

		if (roomInfo.status === "finished") {
			res.json({
				success: false,
				already_finished: true,
				message: "Sorry, this game is already finished."
			});
			return;
		}

		roomInfo.status = "finished";

		const gameLogCount = await GameLog.countDocuments({ room: new ObjectId(roomInfo._id) });
		let message = new Message({
			from: req.user,
			to: roomInfo['creator'],
			message: '',
			is_anonymous: req.body.is_anonymous,
			is_read: true
		});

		const newTransaction = new Transaction({user: roomInfo['creator'], amount: 0, description: 'end game ' + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number']});

		if (gameLogCount === 0) {
			newTransaction.amount += roomInfo['bet_amount'] * 100;

			message.message = "I made £" + roomInfo['bet_amount'] + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
		} else {
			const commission = await getCommission();
			const percent = 100 - commission;
			const commissionRate = percent / 100.0;

			if (roomInfo['game_type']['game_type_name'] === 'Spleesh!') {
				newTransaction.amount += roomInfo['host_pr'] * percent;

				message.message = "I made £" + roomInfo['host_pr'] + " * " + commissionRate + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

			} else if (roomInfo['game_type']['game_type_name'] === 'Classic RPS') {
				newTransaction.amount += roomInfo['host_pr'] * percent;
				message.message = "I made £" + roomInfo['host_pr'] + " * " + commissionRate + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

			} else if (roomInfo['game_type']['game_type_name'] === 'Quick Shoot') {
				newTransaction.amount += roomInfo['host_pr'] * percent;
				message.message = "I made £" + roomInfo['host_pr'] + " * " + commissionRate + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

			} else if (roomInfo['game_type']['game_type_name'] === 'Mystery Box') {
				newTransaction.amount += roomInfo['host_pr'] * percent;
				message.message = "I made £" + roomInfo['host_pr'] + " * " + commissionRate + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

			} else if (roomInfo['game_type']['game_type_name'] === 'Brain Game') {
				newTransaction.amount += roomInfo['host_pr'] * percent;
				message.message = "I made £" + roomInfo['host_pr'] + " * " + commissionRate + " from ENDING " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
			}

			newGameLog = new GameLog({
				room: roomInfo,
				creator: roomInfo['creator'],
				joined_user: roomInfo['creator'],
				game_type: roomInfo['game_type'],
				bet_amount: roomInfo['host_pr'],
				is_anonymous: roomInfo['is_anonymous'],
				game_result: -100
			});

			await newGameLog.save();
		}

		roomInfo['creator']['balance'] += newTransaction.amount;
		await roomInfo['creator'].save();
		await roomInfo.save();
		await newTransaction.save();

		sendEndedMessageToJoiners(roomInfo._id, roomInfo['creator']['_id'], message.message, roomInfo.is_anonymous);

		const myRooms = await getMyRooms(req.user._id);
		
		res.json({
			success: true,
			myGames: myRooms.rooms,
			pages: Math.ceil(myRooms.count / 8),
			newTransaction
		});

		const rooms = await getRoomList(10, 1, '');

		req.io.sockets.emit('UPDATED_ROOM_LIST', {
			total: rooms.count,
			roomList: rooms.rooms,
			pages: Math.ceil(rooms.count / 10)
		});
	} catch (err) {
		res.json({
			success: false,
			already_finished: false,
			message: err
		});
	}
});

router.get('/my_history', auth, async (req, res) => {
	try {
		const start = new Date();
		messages1 = await Message.find({from: new ObjectId(req.user._id)})
						.populate({path: 'to', model: User});
		messages2 = await Message.find({to: new ObjectId(req.user._id)})
						.populate({path: 'from', model: User});

		myHistory = {};
		for (let message of messages1) {
			if (message.to && (!myHistory[message.to._id] || myHistory[message.to._id]['updated_at'] < message.updated_at)) {
				myHistory[message.to._id] = {
					...myHistory[message.to._id],
					_id: message.to._id,
					message: message.message,
					username: message.to.username,
					avatar: message.to.avatar,
					created_at: message.created_at,
					created_at_str: moment(message.created_at).format('LLL'),
					updated_at: message.updated_at,
					unread_message_count: 0
				}
			}
		}

		for (let message of messages2) {
			if (message.from && message.from._id === message.to) {
				continue;
			}

			if (message.from && (!myHistory[message.from._id] || myHistory[message.from._id]['updated_at'] < message.updated_at)) {
				myHistory[message.from._id] = {
					...myHistory[message.from._id],
					_id: message.from._id,
					message: message.message,
					username: message.from.username,
					avatar: message.from.avatar,
					created_at: message.created_at,
					created_at_str: moment(message.created_at).format('LLL'),
					updated_at: message.updated_at
				}
			}

			if (message.from && !myHistory[message.from._id].unread_message_count) {
				myHistory[message.from._id].unread_message_count = 0;
			}

			if (message.from && !message.is_read) {
				myHistory[message.from._id].unread_message_count++;
			}
		}

		const end = new Date();
		// console.log('getMyHistory: ', end - start, 'ms');

		res.json({
			success: true,
			myHistory,
		});
	} catch (err) {
		console.log(err);
		res.json({
			success: false,
			message: err
		});
	}
});

router.post('/start_brain_game', auth, async (req, res) => {
	try {
		const user = await User.findOne({_id: new ObjectId(req.user._id)});
		user.balance -= req.body.bet_amount * 100;
		await user.save();

		res.json({
			success: true,
			balance: user.balance
		});
	} catch (err) {
		res.json({
			success: false,
			message: err
		});
	}
});

router.post('/get_chat_room_info', auth, async (req, res) => {
	try {
		const user = await User.findOne({_id: new ObjectId(req.body.user_id)});
		
		await Message.updateMany(
			{
				is_read: false,
				from: new ObjectId(req.body.user_id),
				to: new ObjectId(req.user._id)
			}, 
			{$set:{is_read: true}}, 
			(err, writeResult) => { console.log('set messages as read (open chat room)', err); }
		);

		const chatLogs = await Message.find(
			{$or:[
				{from: new ObjectId(req.body.user_id), to: new ObjectId(req.user._id)},
				{from: new ObjectId(req.user._id), to: new ObjectId(req.body.user_id)},
			]}
		).sort({created_at : 'asc'});

		let messages = [];
		for (const chatLog of chatLogs) {
			const message = {
				from: chatLog.from,
				to: chatLog.to,
				message: chatLog.message,
				created_at: moment(chatLog.created_at).format('LLL')
			}
			messages.push(message);
		}

		res.json({
			success: true,
			chatRoomInfo: {
				user_id: user._id,
				avatar: user.avatar,
				username: user.username,
				chatLogs: messages
			},
		});
	} catch (err) {
		res.json({
			success: false,
			message: err
		});
	}
});

function check_access_time(user_id) {
	const check_result = (user_access_log[user_id] && Date.now() - user_access_log[user_id] < 3000 ) ? false : true;
	user_access_log[user_id] = Date.now();
	return check_result;
}

async function sendEndedMessageToJoiners(roomId, from, message, is_anonymous) {
	let joiners = {};
	const gameLogList = await GameLog.find({room: new ObjectId(roomId)});
	const now = moment(new Date()).format('LLL');

	gameLogList.forEach(log => {
		if (log.joined_user === from || joiners[log.joined_user]) {
			return;
		}
		joiners[log.joined_user] = 1;
		const temp = new Message({
			from: new ObjectId(from),
			to: new ObjectId(log.joined_user),
			message: message,
			is_anonymous: is_anonymous,
			is_read: false
		});
		temp.save();
		socket.sendMessage(log.joined_user, {
			from: from,
			to: log.joined_user,
			message: message,
			created_at: now
		});
	});
}

router.post('/bet', auth, async (req, res) => {
	try {
		const start = new Date();
		if (req.body._id) {
			if (!check_access_time(req.user._id)) {
				res.json({
					success: false,
					message: 'illregular action',
					betResult: -1000
				});

				return;
			}

			roomInfo = await Room.findOne({_id: req.body._id})
						.populate({path: 'creator', model: User})
						.populate({path: 'game_type', model: GameType});

			if (roomInfo['creator']._id === req.user._id) {
				res.json({
					success: true,
					message: 'Sorry, this game is yours. You can\'t join this game.',
					betResult: -101
				});
				
				return;
			}

			if (roomInfo['status'] === 'finished') {
				res.json({
					success: true,
					message: 'Sorry, this game is already finished.',
					betResult: -100
				});
				
				return;
			}

			newGameLog = new GameLog({
				room: roomInfo,
				creator: roomInfo['creator'],
				joined_user: req.user,
				game_type: roomInfo['game_type'],
				bet_amount: roomInfo['bet_amount'],
				is_anonymous: req.body.is_anonymous
			});

			newTransactionC = new Transaction({user: roomInfo['creator'], amount: 0, description: 'play game ' + roomInfo['game_type']['game_type_name'] + ' - ' + roomInfo['room_number']});
			newTransactionJ = new Transaction({user: req.user, amount: 0, description: 'play game ' + roomInfo['game_type']['game_type_name'] + ' - ' + roomInfo['room_number']});

			if (req.body.is_anonymous == true) {
				req.user['balance'] -= 10;
				newTransactionJ.amount -= 10;
			}

			let message = new Message({
				from: req.user,
				to: roomInfo['creator'],
				message: '',
				is_anonymous: req.body.is_anonymous,
				is_read: false
			});

			const commission = await getCommission();

			if (roomInfo['game_type']['game_type_name'] === 'Classic RPS') {
				newTransactionJ.amount -= roomInfo['bet_amount'] * 100;

				newGameLog.selected_rps = req.body.selected_rps;

				if (roomInfo.selected_rps % 3 === req.body.selected_rps - 1) {
					newGameLog.game_result = 1;
					newTransactionJ.amount += roomInfo['bet_amount'] * 2 * (100 - commission);
					message.message = "I won £" + (roomInfo['bet_amount'] * 2) + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				} else if (roomInfo.selected_rps === req.body.selected_rps) {
					newGameLog.game_result = 0;
					newTransactionJ.amount += roomInfo['bet_amount'] * (100 - commission);
					newTransactionC.amount += roomInfo['bet_amount'] * (100 - commission);

					message.message = "We split £" + (roomInfo['bet_amount'] * 2) + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in our " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				} else {
					newGameLog.game_result = -1;
					newTransactionC.amount += roomInfo['bet_amount'] * 2 * (100 - commission);

					message.message = "I lost £" + roomInfo['bet_amount'] + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				}

				roomInfo.status = 'finished';
			} else if (roomInfo['game_type']['game_type_name'] === 'Quick Shoot') {
				newTransactionJ.amount -= roomInfo['user_bet'] * 100;

				newGameLog.selected_qs_position = req.body.selected_qs_position;

				if (roomInfo.selected_qs_position !== req.body.selected_qs_position) {
					newGameLog.game_result = 1;
					newTransactionJ.amount += roomInfo['bet_amount'] * roomInfo['qs_game_type'] * (100 - commission);
					message.message = "Your not the best keeper are you? I just won £" + (roomInfo['bet_amount'] * roomInfo['qs_game_type']) 
						+ " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				} else {
					newGameLog.game_result = -1;
					newTransactionC.amount += roomInfo['bet_amount'] * roomInfo['qs_game_type'] * (100 - commission);

					message.message = "The boots suck, I just lost £" + roomInfo['user_bet'] + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				}

				roomInfo.status = 'finished';
			} else if (roomInfo['game_type']['game_type_name'] === 'Spleesh!') {
				newGameLog.bet_amount = req.body.bet_amount;

				newTransactionJ.amount -= req.body.bet_amount * 100;

				roomInfo['host_pr'] += req.body.bet_amount;
				roomInfo['pr'] += req.body.bet_amount;
				
				if (roomInfo.bet_amount == req.body.bet_amount) {
					newTransactionJ.amount += (roomInfo['pr'] + roomInfo['bet_amount']) * (100 - commission);

					roomInfo.status = 'finished';
					newGameLog.game_result = 1;
					message.message = "I won £" + (roomInfo['host_pr'] + roomInfo['bet_amount']) + " * " + updateDigitToPoint2((100 - commission) / 100.0)
						+ " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				} else {
					message.message = "I lost £" + req.body.bet_amount + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
					
					newGameLog.game_result = -1;
					if (roomInfo['endgame_type'] && roomInfo['host_pr'] >= roomInfo['endgame_amount']) {
						roomInfo.status = 'finished';
						newTransactionC.amount += roomInfo['host_pr'] * 100;
						const newGameLogC = new GameLog({
							room: roomInfo,
							creator: roomInfo['creator'],
							joined_user: roomInfo['creator'],
							game_type: roomInfo['game_type'],
							bet_amount: roomInfo['host_pr'],
							is_anonymous: roomInfo['is_anonymous'],
							game_result: -100
						});
						await newGameLogC.save();
					}
				}
			} else if (roomInfo['game_type']['game_type_name'] === 'Mystery Box') {
				newGameLog.bet_amount = req.body.bet_amount;

				let selected_box = await RoomBoxPrize.findOne({_id: new ObjectId(req.body.selected_id)})
					.populate({path: 'joiner', model: User});
				selected_box.status = 'opened';
				selected_box.joiner = req.user;
				await selected_box.save();

				newGameLog.game_result = selected_box.box_prize;

				newTransactionJ.amount -= selected_box.box_price * 100;
				newTransactionJ.amount += selected_box.box_prize * (100 - commission);

				if (selected_box.box_prize === 0) {
					message.message = "I won NOTHING in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				} else {
					message.message = "I won £" + (selected_box.box_prize) + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in " 
						+ roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
				}

				opened_amount = 0;
				box_list = await RoomBoxPrize.find({room: roomInfo});
				max_prize = 0;
				lowest_box_price = -1;
				new_host_pr = 0;

				box_list.forEach(box => {
					if (box.status === 'opened') {
						new_host_pr += box.box_price;
					} else {
						new_host_pr += box.box_prize;

						if (lowest_box_price === -1 || lowest_box_price > box.box_price) {
							lowest_box_price = box.box_price;
						}

						if (max_prize < box.box_prize) {
							max_prize = box.box_prize;
						}
					}
				});

				if ((roomInfo['endgame_type'] && new_host_pr > roomInfo.endgame_amount) || max_prize === 0) {
					roomInfo.status = 'finished';
					newTransactionC.amount += new_host_pr * (100 - commission);
					
					const messageC = "I made £" + new_host_pr + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " from ENDING " 
						+ roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
					sendEndedMessageToJoiners(roomInfo._id, roomInfo['creator']['id'], messageC, roomInfo.is_anonymous);

					const newGameLogC = new GameLog({
						room: roomInfo,
						creator: roomInfo['creator'],
						joined_user: roomInfo['creator'],
						game_type: roomInfo['game_type'],
						bet_amount: new_host_pr,
						is_anonymous: roomInfo['is_anonymous'],
						game_result: -100
					});
					await newGameLogC.save();
				}

				roomInfo.host_pr = new_host_pr;
				roomInfo.user_bet = lowest_box_price === -1 ? 0 : lowest_box_price;
				roomInfo.pr = max_prize;
				newGameLog.selected_box = selected_box;
			} else if (roomInfo['game_type']['game_type_name'] === 'Brain Game') {
				newGameLog.bet_amount = roomInfo['bet_amount'];
				newGameLog.brain_game_score = req.body.brain_game_score;

				newTransactionJ.amount -= roomInfo['bet_amount'] * 100;

				roomInfo['pr'] += roomInfo['bet_amount'];
				roomInfo['host_pr'] += roomInfo['bet_amount'];
				
				if (roomInfo.brain_game_score == req.body.brain_game_score) {   //draw          Draw, No Winner! PR will be split.
					message.message = "We split £" + (roomInfo['pr']) + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in " 
						+ roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];
					
					newTransactionJ.amount += roomInfo['pr'] * (100 - commission) / 2;
					newTransactionC.amount += roomInfo['pr'] * (100 - commission) / 2;

					roomInfo.status = 'finished';
					newGameLog.game_result = 0;
				} else if (roomInfo.brain_game_score < req.body.brain_game_score) { //win       WOW, What a BRAIN BOX - You WIN!
					message.message = "I won £" + roomInfo['pr'] + " * " + updateDigitToPoint2((100 - commission) / 100.0) + " in " 
						+ roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

					newTransactionJ.amount += roomInfo['pr'] * (100 - commission);

					newGameLog.game_result = 1;
					roomInfo.status = 'finished';
				} else {    //failed    Oops, back to school for you loser!!
					message.message = "I lost £" + (roomInfo['bet_amount']) + " in " + roomInfo['game_type']['short_name'] + '-' + roomInfo['room_number'];

					newGameLog.game_result = -1;
					if (roomInfo['endgame_type'] && roomInfo['host_pr'] >= roomInfo['endgame_amount']) {
						roomInfo.status = 'finished';
						newTransactionC.amount += roomInfo['host_pr'] * (100 - commission);
					}
				}
			}

			roomInfo['creator']['balance'] += newTransactionC.amount;
			roomInfo['creator'].save();

			req.user['balance'] += newTransactionJ.amount;

			if (roomInfo['game_type']['game_type_name'] === 'Brain Game') {
				req.user['balance'] += roomInfo['bet_amount'] * 100;
			}
			await req.user.save();

			newGameLog.save();
			await roomInfo.save();

			const rooms = await getRoomList(10, 1, '');
			req.io.sockets.emit('UPDATED_ROOM_LIST', {
				_id: roomInfo['_id'],
				total: rooms.count,
				roomList: rooms.rooms,
				pages: Math.ceil(rooms.count / 10)
			});

			if (newTransactionJ.acount !== 0) {
				newTransactionJ.save();
			}

			if (newTransactionC.amount !== 0) {
				newTransactionC.save();
				socket.newTransaction(newTransactionC);
			}

			if (message.from._id !== message.to._id) {
				message.save();
				socket.sendMessage(message.to._id, {
					from: message.from._id,
					to: message.to_id,
					message: message.message,
					created_at: moment(new Date()).format('LLL')
				});
			}
	
			res.json({
				success: true,
				message: 'successful bet',
				betResult: newGameLog.game_result,
				newTransaction: newTransactionJ,
				roomStatus: roomInfo.status
			});
		}
		const end = new Date();
	} catch (err) {
		res.json({
			success: false,
			message: err
		});
	}
});
  
module.exports = router;
