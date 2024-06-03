import axios from 'axios';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IGame } from '../interface/IGame';
import classNames from 'classnames';
import toast from 'react-hot-toast';

const Admin = () => {

    const navigate = useNavigate();
    const [games, setGames] = useState<IGame[]>([]);
    const [selectedGame, setSelectedGame] = useState<IGame>({} as IGame);
    const [isGameSelected, setIsGameSelected] = useState(true);

    const createRoom = () => {
        if (!Object.keys(selectedGame).length) {
            setIsGameSelected(false);
            toast.error("Выберите игру");
            return;
        };
        localStorage.setItem("game", JSON.stringify(selectedGame))

        navigate(`/game`, {
            state: {
                username: "admin",
                role: "admin",
                gameId: selectedGame.id
            },
        });
    }

    const handleGame = (id: any) => {
        setIsGameSelected(true);
        const game = games?.find((el: any) => el.id == id);
        console.log(game);
        if (game) {
            setSelectedGame(() => game);
        }
        
    }

    const getAllGames = async () => {
        const response = await axios.get("http://192.168.1.33:8000/games")
        setGames([...response.data])
    }

    useEffect(() => {
        getAllGames()
    }, [])

    return (
        <div className='w-full h-screen flex justify-center items-center bg-slate-300'>
            <div className='bg-white rounded-lg p-4 flex flex-col gap-y-3'>
                <h2 className='text-center text-xl'>Своя игра</h2>
                <select name="" onChange={(e) => handleGame(e.target.value)} defaultValue={'#'} className={classNames(isGameSelected ? '' : 'border-red-400', 'w-80 border-2 p-2 rounded-lg')}>
                    <option value="#" disabled>Выберите игры</option>
                    {games?.map((game: IGame) => {
                        return (
                            <option key={game.id} value={game.id}>{game.title}</option>
                        )
                    })}
                </select>
                <button onClick={createRoom} className='w-80 bg-yellow-300 p-2 rounded-lg'>Создать игру</button>
            </div>
        </div>
    )
}

export default Admin;