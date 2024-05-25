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
	const [showAnswerButton, setShowAnswerButton] = useState(true);

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
		data.categories.forEach((item: any) =>
			item.questions.sort((a: any, b: any) => a.points - b.points)
		);
		setGame(data);
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
					<div className='w-[1200px] max-h-[900px] bg-white p-4 rounded-lg flex flex-col space-y-4 gap-y-3'>
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
									src={`http://localhost:8000/${selectedQuestion.question_file}`}
									alt=''
									className='mx-auto rounded-lg h-[660px] object-cover'
								/>
							)}
							{selectedQuestion?.question_type == "music" && (
								<audio
									controls
									className='mx-auto'
								>
									<source
										src={`http://localhost:8000/${selectedQuestion.question_file}`}
									/>
								</audio>
							)}
							{selectedQuestion?.question_type == "video" && (
								<video
									controls
									className='mx-auto'
								>
									<source
										src={`http://localhost:8000/${selectedQuestion.question_file}`}
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
										onClick={addPointUser}
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
				<div className='absolute w-full h-screen bg-background-img z-10 flex justify-center items-center text-lg p-4'>
					<div className='w-[1200px] max-h-[900px] bg-white p-4 rounded-lg flex flex-col space-y-4 gap-y-3'>
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
								src={`http://localhost:8000/${selectedQuestion.answer_file}`}
								alt=''
								className='mx-auto rounded-lg h-[660px] object-cover'
							/>
						)}
						{selectedQuestion?.answer_type == "music" && (
							<audio
								controls
								className='mx-auto'
							>
								<source
									src={`http://localhost:8000/${selectedQuestion.answer_file}`}
								/>
							</audio>
						)}
						{selectedQuestion?.answer_type == "video" && (
							<video
								controls
								className='mx-auto'
							>
								<source
									src={`http://localhost:8000/${selectedQuestion.answer_file}`}
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

			<div className='grid grid-cols-3 justify-between items-center my-4 p-4'>
				<h1 className='col-span-2 text-4xl font-bold text-center'>
					{game?.title}
				</h1>
				<div className='justify-self-end'>
					<button
						className='text-4xl font-bold text-end mr-[30px] underline decoration-2'
						onClick={() => {
							setIsUser(!isUser);
						}}
					>
						Таблица
					</button>
				</div>
			</div>

			{!isUser ? (
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
														"fa-solid fa-trophy text-2xl"
													)}
												></i>
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
