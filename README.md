# Своя игра

### Для работы необходим сервер

Ссылка - [MyGame-Backend](https://github.com/Palldanerar/MyGame-Backend)

### Стек технологий

- React
- TypeScript
- tailwindCSS
- react-router-dom
- react-hot-toast
- socket.io-client

### Пример данных для игры

``` javascript
{
    // название общей темы игры
    title: "Россия",
    // Массив тем
    categoties: [
        {
            // Название полонки
            title: "География",
            // Массив вопросов
            questions: [
                {
                    // Вопрос
                    question: "Какой город является столицей России?",
                    // Файл
                    question_file: null,
                    // Ответ
                    answer: "Москва",
                    // Количество очков
                    points: 100,
                    // Делает вопрос недоступным если он уже использовался
                    isHidden: false,
                },
                {
                    question: "Как называется самый высокий действующий вулкан в РФ?",
                    question_file: "game.png",
                    answer: "Ключевская сопка",
                    points: 200,
                    isHidden: false,
                },
            ]
        }
    ]
}
```
