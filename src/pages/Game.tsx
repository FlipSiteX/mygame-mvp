import { useEffect, useState } from "react";
import { IUser } from "../interface/IUser";
import { IGame } from "../interface/IGame";
import { IQuestion } from "../interface/IQuestion";
import { ITopic } from "../interface/ITopic";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import styles from "./Game.module.css";
import classNames from "classnames";

const arr = [
	"первым",
	"вторым",
	"третьим",
	"четвертым",
	"пятым",
	"шестым",
	"седьмым",
];

const Game = () => {
	const location = useLocation();
	const [user, setUser] = useState<IUser | null>(null);
	const [users, setUsers] = useState<IUser[]>();
	const [queue, setQueue] = useState<IUser[]>([]);
	const [game, setGame] = useState<IGame>();
	const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(
		null
	);
	const [activeUser, setActiveUser] = useState<IUser | null>();
	const [lastQuestion, setLastQuestion] = useState<IQuestion | null>(null);
	const [lastAnsweredUser, setLastAnsweredUser] = useState<IUser | null>(null);
	const [userToReassignPoints, setUserToReassignPoints] =
		useState<IUser | null>();
	const [isSelect, setIsSelect] = useState(false);
	const [isUser, setIsUser] = useState(false);
	const [isAnswer, setIsAnswer] = useState(false);
	const [isPointsCorrect, setIsPointsCorrect] = useState(true);
	const [completedQuestionsCount, setCompletedQuestionsCount] = useState(0);

	// Функции для работы с клиентом
	const showQuestion = (question: IQuestion) => {
		socket.emit("selectQuestion", question);
		question.isHidden = true;
		setIsSelect(true);
	};

	const hiddenQuestion = () => {
		setIsSelect(false);
		setIsAnswer(true);
		changeUser();
	};

	const closeQuestion = () => {
		setIsAnswer(false);
		setLastQuestion(selectedQuestion as IQuestion);
		setSelectedQuestion(null);
		socket.emit("closeQuestion");
	};

	// Функции для работы с сервером
	const addPointUser = () => {
		socket.emit("addPoints", { activeUser, points: selectedQuestion?.points });
		hiddenQuestion();
	};

	const reassignPoints = (lastAnsweredUser: IUser, userToReass: IUser) => {
		socket.emit("reassignPoints", {
			lastAnsweredUser,
			userToReass,
			points: lastQuestion?.points,
		});
	};

	const answerQuestion = (user: IUser) => {
		socket.emit("answerQuestion", user);
	};

	const changeUser = () => {
		socket.emit("changeUser");
	};

	const getGameData = () => {
		const data = JSON.parse(localStorage.getItem("game") as string);
		data?.categories.forEach((item: any) =>
			item.questions.sort((a: any, b: any) => a.points - b.points)
		);

		setGame(data);
	};

	const endGame = () => {
		setLastQuestion(null);
		setCompletedQuestionsCount(completedQuestionsCount + 1);
		localStorage.clear();
		socket.emit("endGame", users);
	};

	socket.on("newUserList", (users, lastAnsweredUser) => {
		if (user?.role == "user") {
			const newData = users?.find((el: IUser) => el.username == user.username);
			setUser(newData);
		}

		setLastAnsweredUser(lastAnsweredUser);
		setActiveUser(null);
		setUsers(users);
	});

	useEffect(() => {
		socket.emit("joinGame", {
			username: location.state?.username,
			role: location.state?.role,
			points: location.state?.points,
		});

		socket.on("myUser", (user) => {
			setUser(user);
		});

		socket.on("getActiveUser", (user) => {
			setActiveUser(user);
		});

		socket.on("all", (users) => {
			setUsers(users);
		});

		socket.on("setActiveQuestion", (activeQuestion) => {
			setSelectedQuestion(activeQuestion);
			setQueue([]);
		});

		socket.on("getQueue", (userQueue) => {
			setQueue(userQueue);
		});

		socket.on("newActiveUser", (user) => {
			setActiveUser(user);
		});

		socket.on("connect", () => {
			console.log("connected");
		});

		socket.on("disconnect", () => {
			console.log("disconnected");
			socket.connect();
		});

		getGameData();

		return () => {
			socket.disconnect();
		};
	}, []);

	if (!user) {
		return <h1>Loading...</h1>;
	}

	if (user?.role == "user") {
		return (
			<div className='w-full h-screen flex-col justify-center items-center'>
				<div className='w-full h-1/3 flex flex-col justify-between items-center header-bg py-3 rounded-b-[76px]'>
					<div className='circles_1'></div>
					<div className='circles_2'></div>
					<img
						className='w-64'
						src='/logo-3.png'
						alt=''
					/>
					<h2 className='text-4xl font-bold grow text-center flex items-center'>
						БИТВА <br /> РАЗУМОВ
					</h2>
				</div>
				<div className='h-2/3 bg-white rounded-lg p-4 flex flex-col gap-y-3 items-center'>
					{selectedQuestion?.points && (
						<h2 className='text-wrap text-xl text-center'>
							Вопрос за {selectedQuestion?.points}
						</h2>
					)}
					<p className='text-2xl font-bold text-center text-wrap'>
						{selectedQuestion
							? selectedQuestion?.question
							: "Вопрос ещё не выбран"}
					</p>
					<h2 className='text-center text-xl'>{user?.username}</h2>
					<h2 className='text-center text-xl'>Очки: {user?.points}</h2>
					{selectedQuestion &&
						!queue.find((el: IUser) => el.username == user?.username) && (
							<button
								onClick={() => answerQuestion(user)}
								className='w-40 h-40 rounded-full text-2xl bg-green-300 p-2'
							>
								Ответить
							</button>
						)}
					{selectedQuestion &&
						queue.find((el: IUser) => el.username == user?.username) && (
							<p className='text-xl'>
								Вы отвечаете{" "}
								{arr[queue.findIndex((el) => el.username == user?.username)]}
							</p>
						)}
				</div>
			</div>
		);
	}

	return (
		<div className='w-full h-screen flex flex-col relative bg-background-img bg-cover'>
			{isSelect && (
				<div className='absolute w-full min-h-screen z-10 flex justify-center items-center text-lg p-4 bg-background-img bg-cover'>
					<div className='w-[1200px] bg-white p-4 rounded-lg flex flex-col space-y-4 gap-y-3'>
						<h2 className='text-wrap text-center text-2xl font-bold'>
							Вопрос за {selectedQuestion?.points}
						</h2>
						{selectedQuestion?.desc && (
							<p className='text-wrap text-center text-2xl'>
								{selectedQuestion?.desc}
							</p>
						)}
						<h2 className='text-wrap text-center text-2xl font-bold'>
							{selectedQuestion?.question}
						</h2>
						{selectedQuestion?.question_type == "img" && (
							<img
								src={`http://192.168.10.53:8003/${selectedQuestion.question_file}`}
								alt=''
								className='mx-auto h-[600px] rounded-lg object-cover'
							/>
						)}
						{selectedQuestion?.question_type == "music" && (
							<audio
								controls
								className='mx-auto'
							>
								<source
									src={`http://192.168.10.53:8003/${selectedQuestion.question_file}`}
								/>
							</audio>
						)}
						{selectedQuestion?.question_type == "video" && (
							<video
								controls
								className='mx-auto rounded-lg'
							>
								<source
									src={`http://192.168.10.53:8003/${selectedQuestion.question_file}`}
								/>
							</video>
						)}
						<div className='flex flex-col gap-y-3'>
							{queue.length > 0 ? (
								[...queue]?.map((user) => (
									<div
										key={user.username}
										className={classNames(
											user.username === activeUser?.username
												? "w-full drop-shadow-lg border-2 bg-green-200 border-white  flex justify-between p-3 rounded-lg"
												: "w-full drop-shadow-lg border-2 bg-white flex justify-between p-3 rounded-lg"
										)}
									>
										<h2>{user.username}</h2>
										<h2>Очки: {user.points}</h2>
									</div>
								))
							) : (
								<button
									className='w-full p-2 bg-red-300 rounded-lg'
									onClick={() => {
										setCompletedQuestionsCount(completedQuestionsCount + 1);
										socket.emit("addPoints", { activeUser, points: 0 });
										hiddenQuestion();
									}}
								>
									Следующий вопрос
								</button>
							)}
							{queue.length != 0 && (
								<div className='flex flex-col gap-y-3'>
									<button
										className='w-full p-2 bg-green-300 rounded-lg'
										onClick={() => {
											setCompletedQuestionsCount(completedQuestionsCount + 1);
											addPointUser();
										}}
									>
										Добавить очки {activeUser?.username}
									</button>
									<button
										className='w-full p-2 bg-yellow-300 rounded-lg'
										onClick={changeUser}
									>
										Перейти к другому игроку
									</button>
									<button
										className='w-full p-2 bg-red-300 rounded-lg'
										onClick={() => {
											setCompletedQuestionsCount(completedQuestionsCount + 1);
											socket.emit("addPoints", { activeUser, points: 0 });
											hiddenQuestion();
										}}
									>
										Никому
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{isAnswer && (
				<div className='absolute w-full min-h-screen bg-background-img z-10 flex justify-center items-center text-lg p-4'>
					<div className='w-[1200px] bg-white p-4 rounded-lg flex flex-col space-y-4 gap-y-3'>
						<h2 className='text-wrap text-center text-2xl font-bold'>
							Вопрос за {selectedQuestion?.points}
						</h2>
						<h2 className='text-wrap text-center text-2xl font-bold'>
							{selectedQuestion?.answer}
						</h2>
						{selectedQuestion?.answer_desc && (
							<p className='text-wrap text-center text-2xl'>
								{selectedQuestion?.answer_desc}
							</p>
						)}
						{selectedQuestion?.answer_type == "img" && (
							<img
								src={`http://192.168.10.53:8003/${selectedQuestion.answer_file}`}
								alt=''
								className='mx-auto h-[600px] rounded-lg object-cover'
							/>
						)}
						{selectedQuestion?.answer_type == "music" && (
							<audio
								controls
								className='mx-auto'
							>
								<source
									src={`http://192.168.10.53:8003/${selectedQuestion.answer_file}`}
								/>
							</audio>
						)}
						{selectedQuestion?.answer_type == "video" && (
							<video
								controls
								className='mx-auto rounded-lg'
							>
								<source
									src={`http://192.168.10.53:8003/${selectedQuestion.answer_file}`}
								/>
							</video>
						)}
						<button
							className='w-full p-2 bg-red-300 rounded-lg'
							onClick={closeQuestion}
						>
							Закрыть
						</button>
					</div>
				</div>
			)}

			<div className='grid grid-cols-4 justify-between items-center my-4 p-4'>
				<img className="justify-self-center" src="/logo-3.png" width={250} alt="logo" />
				<h1 className='col-start-2 col-end-4 text-4xl font-bold text-center'>
					{game?.title}
				</h1>
				<div className='col-end-5 justify-self-end'>
					<button
						className='text-4xl font-bold text-center mr-[30px] underline decoration-2'
						onClick={() => {
							setIsUser(!isUser);
						}}
					>
						Таблица
					</button>
				</div>
			</div>

			{!isUser && completedQuestionsCount < 25 ? (
				<div className={styles.grid_wrapper}>
					<div className={styles.categories}>
						{game?.categories.map((topic: ITopic) => (
							<div
								className={classNames(
									styles.category,
									"text-4xl text-end font-bold"
								)}
								key={topic.title}
							>
								{topic.title}
							</div>
						))}
					</div>
					<div className={styles.buttons_grid}>
						{game?.categories.map((topic: ITopic) => (
							<div
								className={styles.buttons_row}
								key={topic.id}
							>
								{topic.questions.map((question: IQuestion) => {
									if (!question.isHidden) {
										return (
											<div
												onClick={() => {
													showQuestion(question);
												}}
												key={question.id}
												className={styles.question_button}
											>
												<h2 className='text-center text-5xl font-bold'>
													{question.points}
												</h2>
											</div>
										);
									}
									return (
										<div
											className={classNames(
												styles.question_button,
												"invisible"
											)}
											key={question.id}
										></div>
									);
								})}
							</div>
						))}
					</div>
				</div>
			) : (
				<div className='flex w-[800px] bg-white p-4 rounded-lg mx-auto flex-col gap-y-3'>
					{lastQuestion && isPointsCorrect && (
						<button
							onClick={() => setIsPointsCorrect(false)}
							className='w-full bg-red-300 hover:bg-red-400 drop-shadow-lg text-center text-2xl p-5 rounded-lg'
						>
							Переназначить очки за последний вопрос
						</button>
					)}
					{completedQuestionsCount === 25 && (
						<button
							onClick={endGame}
							className='w-full bg-green-300 hover:bg-green-400 drop-shadow-lg text-center text-2xl p-5 rounded-lg'
						>
							Завершить игру
						</button>
					)}
					{completedQuestionsCount > 25 && <h2 className='text-2xl font-bold'>Итоги</h2>}
					{!isPointsCorrect && (
						<h2 className='text-2xl'>
							Кому назначить очки ({lastQuestion?.points}) за последний вопрос:
						</h2>
					)}
					{users && isPointsCorrect
						? [...users]
							?.filter((user) => user.role !== "admin")
							.sort((a, b) => b.points - a.points)
							.map((user, id) => (
								<div
									key={user.username}
									className='w-full bg-white border-2 drop-shadow-lg flex justify-between p-5 rounded-lg'
								>
									<div className='flex items-center'>
										{/[0-2]/.test(String(id)) && (
											<i
												className={classNames(
													id == 0
														? "text-yellow-400"
														: id == 1
															? "text-slate-400"
															: "text-orange-600",
													"text-2xl"
												)}
											>
												<svg xmlns="http://www.w3.org/2000/svg" height='30px' width='30px' viewBox="0 0 576 512"><path fill="currentColor" d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z" /></svg>
											</i>
										)}
										<h2
											className={classNames(
												/[0-2]/.test(String(id)) ? "ml-4" : null,
												"text-2xl"
											)}
										>
											{user.username}
										</h2>
									</div>
									<h2 className='text-2xl'>Очки: {user.points}</h2>
								</div>
							))
						: users &&
						[...users]
							?.filter(
								(user) =>
									user.role !== "admin" &&
									user.username !== lastAnsweredUser?.username
							)
							.sort((a, b) => b.points - a.points)
							.map((user) => (
								<div
									key={user.username}
									onClick={() => {
										setUserToReassignPoints(user);
									}}
									className={classNames(
										user.username == userToReassignPoints?.username
											? "w-full bg-green-200 border-white border-2 drop-shadow-lg flex justify-between p-5 rounded-lg"
											: "w-full bg-white border-2 drop-shadow-lg flex justify-between p-5 rounded-lg"
									)}
								>
									<h2 className='text-2xl'>{user.username}</h2>
									<h2 className='text-2xl'>Очки: {user.points}</h2>
								</div>
							))}
					{!isPointsCorrect && (
						<div className='flex flex-col gap-y-3'>
							<button
								className='w-full text-2xl text-center drop-shadow-lg p-5 rounded-lg bg-green-300 hover:bg-green-400'
								onClick={() => {
									reassignPoints(
										lastAnsweredUser as IUser,
										userToReassignPoints as IUser
									);
									setIsPointsCorrect(true);
								}}
							>
								Добавить очки {userToReassignPoints?.username}
							</button>
							<button
								className='w-full text-2xl text-center drop-shadow-lg p-5 rounded-lg bg-red-300 hover:bg-red-400'
								onClick={() => {
									setIsPointsCorrect(true);
								}}
							>
								Отмена
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Game;
