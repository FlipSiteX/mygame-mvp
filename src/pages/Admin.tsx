import axios from 'axios';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IGame } from '../interface/IGame';

const Admin = () => {

    const navigate = useNavigate();
    const [games, setGames] = useState<IGame[]>([])
    const [selectedGame, setSelectedGame] = useState<IGame>({} as IGame)

    const createRootm = () => {

        localStorage.setItem("game", JSON.stringify(selectedGame))

        navigate(`/game`, {
            state: {
                username: "admin",
                role: "admin"
            },
        });
    }

    const handleGame = (id: any) => {
        
        console.log(id);
        const game = games?.find((el: any) => el.id == id)
        console.log(game);
        if (game) {
            setSelectedGame(() => game)
        }

        console.log(selectedGame)
        

    }

    const getAllGames = async () => {
        const response = await axios.get("http://localhost:8000/games")
        setGames([...response.data])
    }

    useEffect(() => {
        getAllGames()
    }, [])

    return (
        <div className='w-full h-screen flex justify-center items-center bg-slate-300'>
            <div className='bg-white rounded-lg p-4 flex flex-col gap-y-3'>
                <h2 className='text-center text-xl'>Своя игра</h2>
                <select name="" onChange={(e) => handleGame(e.target.value)} defaultValue={'#'} className='w-80 border-2 p-2 rounded-lg'>
                    <option value="#" disabled>Выберете игры</option>
                    {games?.map((game: IGame) => {
                        return (
                            <option key={game.id} value={game.id}>{game.title}</option>
                        )
                    })}
                </select>
                <button onClick={createRootm} className='w-80 bg-yellow-300 p-2 rounded-lg'>Создать игру</button>
            </div>
        </div>
    )
}

export default Admin;