import { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
const Login = () => {

    const navigate = useNavigate();

    const [username, setUsername] = useState("")

    const joinRoom = () => {

        if (!username) {
            toast.error('Напишите username');
            return;
        }


        navigate(`/game`, {
            state: {
                username,
                role: "user",
                points: 0
            },
        });
    };

    return (
        <div className='w-full h-screen flex-col justify-center items-center bg-cover bg-background-img'>
            <div className='w-full h-1/2 flex justify-center lg:justify-between  items-center px-16'>
                <h2 className='text-7xl font-bold text-center'>БИТВА <br /> РАЗУМОВ</h2>
                <img className='w-128 none hidden lg:block' src="/public/logo-3.png" alt="" />
            </div>
            <div className='h-1/2 bg-white p-4 flex flex-col items-center justify-center gap-y-3 rounded-t-[76px]'>
                <input onChange={(event) => { setUsername(event.target.value) }} value={username} className='w-96 border-2 p-4 text-lg rounded-lg' type="text" placeholder='Название команды' />
                <button onClick={joinRoom} className='w-96 bg-[#85EEAB] text-2xl font-bold p-4 hover:text-white rounded-lg hover:bg-[#437856] ease-out'>Войти</button>
            </div>
        </div>
    )
}

export default Login