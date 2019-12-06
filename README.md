# @apidog/longpoll
Мелкий хелпер для работы с LongPoll.

# Использование
Создать асинхронно объект LongPoll-а и подписаться на нужные события.
```ts
import getLongPoll from '@apidog/longpoll';

getLongPoll({
    token: process.env.token // токен
}).then(longpoll => {

    // Подписка на новое сообщение
    longpoll.on('message', (event: ILongPollEvent<IVKMessage>) => {
        console.log(event);
    });

    // Стартуем longpoll
    longpoll.start();
});
```
