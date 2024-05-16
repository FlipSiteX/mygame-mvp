import { useEffect, useState } from 'react'
import { IUser } from '../interface/IUser'
import { IGame } from '../interface/IGame'
import { IQuestion } from '../interface/IQuestion'
import { ITopic } from '../interface/ITopic'
import { useLocation } from 'react-router-dom'
import { socket } from '../socket'
import toast from 'react-hot-toast/headless'
import { dataGame } from '../game'

const arr = ['первым', "вторым", 'третьим', 'четвертым', 'пятым']

const Game = () => {
    const location = useLocation();
    const [user, setUser] = useState<IUser | null>(null)
    const [users, setUsers] = useState<IUser[]>()
    const [queue, setQueue] = useState<IUser[]>([])
    const [game, setGame] = useState<IGame>(dataGame)
    const [selectedQuestion, setSelectedQuestion] = useState<IQuestion | null>(null)
    const [activeUser, setActiveUser] = useState<IUser | null>()
    const [isSelect, setIsSelect] = useState(false)
    const [isUser, setIsUser] = useState(false)
    const [isAnswer, setIsAnswer] = useState(false)

    // Функции для работы с клиентом
    const showQuestion = (question: IQuestion) => {
        socket.emit("selectQuestion", question)
        question.isHidden = true;
        setIsSelect(true)
        setSelectedQuestion(question)
    }

    const hiddenQuestion = () => {
        setIsSelect(false)
        setIsAnswer(true)
        changeUser()
    }

    const closeQuestion = () => {
        setSelectedQuestion(null)
        setIsAnswer(false)
        socket.emit("closeQuestion")
    }

    // Функции для работы с сервером
    const addPointUser = () => {
        socket.emit("addPoints", { activeUser, points: selectedQuestion?.points })

        hiddenQuestion()
    }

    const answerQuestion = () => {

        if (!selectedQuestion) {
            return
        }

        toast.success("Вы успешно добавлены в очередь")

        socket.emit("answerQuestion", user)
    }

    const changeUser = () => {
        socket.emit("changeUser")
    }

    const getGameData = () => {

        // @ts-ignore
        const data = JSON.parse(localStorage.getItem("game"))
        console.log(data)
        data.categories.forEach((item: any) => item.questions.sort((a: any, b: any) => a.points - b.points))
        setGame(data)
    }

    socket.on("newUserList", (users) => {

        if (user?.role == "user") {

            const newData = users?.find((el: IUser) => el.username == user.username)
            setUser(newData)
        }

        setActiveUser(null)
        setQueue([])
        setUsers(users)
    })

    useEffect(() => {
        // getGameData()
        socket.emit("joinGame", {
            username: location.state?.username,
            role: location.state?.role,
            points: location.state?.points,
        })

        socket.on("myUser", (user) => {
            setUser(user)
        })

        socket.on("getActiveUser", (user) => {
            setActiveUser(user)
        })

        socket.on("all", (users) => {
            setUsers(users)
        })

        socket.on("setActiveQuestion", (activeQuestion) => {
            setSelectedQuestion(activeQuestion)
        })

        socket.on("getQueue", (userQueue) => {
            setQueue(userQueue)
        })

        socket.on("newActiveUser", (user) => {
            setActiveUser(user)
        })

        socket.on('connect', () => {
            console.log('connected');
        });

        socket.on('disconnect', () => {
            console.log('disconnected');
            socket.connect();
        });

        return () => {
            socket.disconnect();
        };

    }, [])
    
     if (!user) {
         return <h1>Loading...</h1>
     }

    if (user?.role == "user") {
        return (
            <div className='w-full h-screen flex-col justify-center items-center'>
                <div className='w-full h-1/3 flex flex-col justify-between items-center header-bg py-3 rounded-b-[76px]'>
                    <div className='circles_1'></div>
                    <div className='circles_2'></div>
                    <img className='w-64' src="/public/logo-3.png" alt="" />
                    <h2 className='text-4xl font-bold grow text-center flex items-center'>БИТВА <br /> РАЗУМОВ</h2>
                </div>
                <div className='h-2/3 bg-white rounded-lg p-4 flex flex-col gap-y-3 items-center'>
                    {selectedQuestion?.points && (<h2 className='text-wrap text-xl text-center'>Вопрос за {selectedQuestion?.points}</h2>)}
                    <p className='text-2xl font-bold text-center text-wrap'>{selectedQuestion ? selectedQuestion?.question : "Вопрос ещё не выбран"}</p>
                    <h2 className='text-center text-xl'>{user?.username}</h2>
                    <h2 className='text-center text-xl'>Очки: {user?.points}</h2>
                    {
                        selectedQuestion && !queue.find((el: IUser) => el.username == user?.username) ? <button onClick={answerQuestion} className='w-40 h-40 rounded-full text-2xl bg-green-300 p-2'>
                             Ответить
                            </button> : 
                            <p>Вы отвечаете {arr[queue.findIndex(el => el.username == user?.username)]}</p>
                    }
                </div>
            </div>
        )
    }
    
    return (
        <div className="w-full h-screen flex flex-col relative bg-background-img bg-cover">

            {isSelect &&
                <div className='absolute w-full h-screen z-10 flex justify-center items-center text-lg p-4 bg-background-img bg-cover'>
                    <div className="w-[800px] bg-white p-4 rounded-lg flex flex-col gap-y-3">
                        <div>
                            <h2 className='text-wrap text-center text-xl'>Вопрос за {selectedQuestion?.points}</h2>
                            {
                                selectedQuestion?.desc && (
                                    <p className='text-wrap text-center text-xl'>{selectedQuestion?.desc}</p>
                                )
                            }
                            <h2 className='text-wrap text-center text-2xl font-bold'>{selectedQuestion?.question}</h2>
                            {
                                selectedQuestion?.question_type == "img" && (
                                    <img src={`http://localhost:8000/public/${selectedQuestion.question_file}`} alt="" className='mx-auto rounded-lg max-w-[300px] max-h-[260px] object-cover' />
                                )
                            }
                            {
                                selectedQuestion?.question_type == "music" && (
                                    <audio controls className='mx-auto'>
                                        <source src={`http://localhost:8000/public/${selectedQuestion.question_file}`} />
                                    </audio>
                                )
                            }
                            {
                                selectedQuestion?.question_type == "video" && (
                                    <video controls className='mx-auto'>
                                        <source src={`http://localhost:8000/public/${selectedQuestion.question_file}`} />
                                    </video>
                                )
                            }
                        </div>
                        <div className='flex flex-col gap-y-3'>
                            {
                                queue.length > 0 ? [...queue]?.map((user) => {
                                    if (user.username == activeUser?.username) {
                                        return (
                                            <div key={user.username} className="w-full drop-shadow-lg border-2 flex bg-green-100 justify-between p-3 rounded-lg">
                                                <h2>Имя: {user.username}</h2>
                                                <h2>Очки: {user.points}</h2>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div key={user.username} className="w-full drop-shadow-lg border-2 flex justify-between p-3 rounded-lg">
                                            <h2>Имя: {user.username}</h2>
                                            <h2>Очки: {user.points}</h2>
                                        </div>
                                    )

                                })
                                : <button className="w-full p-2 bg-red-300 rounded-lg" onClick={() => {
                                    socket.emit("addPoints", { activeUser, points: 0 })
                                    hiddenQuestion()
                                }}>Следующий вопрос</button>
                            }
                            {queue.length != 0 &&
                                <div className='flex flex-col gap-y-3'>
                                    <button className="w-full p-2 bg-green-300 rounded-lg" onClick={addPointUser}>Добавить очки {activeUser?.username}</button>
                                    <button className="w-full p-2 bg-yellow-300 rounded-lg" onClick={changeUser}>Перейти к другому игроку</button>
                                    <button className="w-full p-2 bg-red-300 rounded-lg" onClick={() => {
                                        socket.emit("addPoints", { activeUser, points: 0 })
                                        hiddenQuestion()
                                    }}>Никому</button>
                                </div>
                            }
                        </div>
                
                    </div>
                </div>
            }

            {
                isAnswer && (
                    <div className='absolute w-full h-screen bg-background-img z-10 flex justify-center items-center text-lg p-4'>
                        <div className="w-[600px] bg-white p-4 rounded-lg flex flex-col gap-y-3">
                            <h2 className='text-wrap text-center text-2xl font-bold'>{selectedQuestion?.answer}</h2>
                            {
                                selectedQuestion?.answer_type == "img" && (
                                    <img src={`http://localhost:8000/public/${selectedQuestion.answer_file}`} alt="" className='mx-auto rounded-lg max-w-[300px] max-h-[260px] object-cover' />
                                )
                            }
                            {
                                selectedQuestion?.answer_type == "music" && (
                                    <audio controls className='mx-auto'>
                                        <source src={`http://localhost:8000/public/${selectedQuestion.answer_file}`} />
                                    </audio>
                                )
                            }
                            {
                                selectedQuestion?.answer_type == "video" && (
                                    <video controls className='mx-auto'>
                                        <source src={`http://localhost:8000/public/${selectedQuestion.answer_file}`} />
                                    </video>
                                )
                            }
                            <button className="w-full p-2 bg-red-300 rounded-lg" onClick={closeQuestion}>Закрыть</button>
                        </div>
                    </div>
                )
            }

            <div className="w-full h-auto flex justify-between p-4">
                <h1 className="text-3xl font-bold">{game?.title}</h1>
                <button className='text-xl font-bold underline decoration-2' onClick={() => { setIsUser(!isUser) }}>Таблица</button>
            </div>
            <div className="w-full flex-auto flex flex-col justify-between p-4">
                {!isUser ?
                    game?.categories.map((topic: ITopic) => (
                        <div className="flex items-center" key={topic.title}>
                            <div className="w-64">
                                <h2 className='text-2xl font-bold'>{topic.title}</h2>
                            </div>
                            <div className="w-full flex justify-between">
                                {topic.questions.map((question: IQuestion) => {

                                    if (!question.isHidden) {
                                        return (
                                            <div onClick={() => { showQuestion(question) }} key={question.question} className="w-64 rounded-lg text-3xl bg-slate-300 py-5 cursor-pointer drop-shadow-2xl">
                                                <h2 className="text-center text-3xl font-bold">{question.points}</h2>
                                            </div>
                                        )
                                    }

                                    return (
                                        <div className="w-64 bg-slate-500 rounded-lg py-5 cursor-default drop-shadow-2xl invisible">
                                            <h2 className="text-center text-3xl font-bold">{question.points}</h2>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))
                    :
                    <div className="w-full flex flex-col items-center gap-y-3">
                        {// @ts-ignore
                            users && [...users]?.sort((a, b) => b.points - a.points).map((user) => (
                                <div key={user.username} className="w-[800px] bg-white drop-shadow-lg border-2 flex justify-between p-5 rounded-lg">
                                    <h2 className='text-2xl'>Имя: {user.username}</h2>
                                    <h2 className='text-2xl'>Очки: {user.points}</h2>
                                </div>
                            ))
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default Game