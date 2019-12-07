# @apidog/longpoll
Мелкий хелпер для работы с LongPoll.

# Использование
Создать асинхронно объект LongPoll-а и подписаться на нужные события.
```ts
import getLongPoll from '@apidog/longpoll';

LongPoll.getInstance(process.env.token).then(longpoll => {

    // Подписка на новое сообщение
    longpoll.on('message', (event: ILongPollEvent<IVKMessage>) => {
        console.log(event);
    });

    // Стартуем longpoll
    longpoll.start();
});
```

# API
## `LongPoll.getInstance(auth: string | VKAPIClient, props?: ILongPollProps)`
Создает "сервис" для получения данных от LongPoll сервера. Возвращает `Promise` с объектом `LongPoll`.
`auth` принимается в двух видах:
* `string` - токен;
* инстанс объекта `VKAPIClient`.
Через `props` можно пробросить некоторые параметры подключения и настройки LongPoll (все они необязательные):
* `versionApi` - версия API, с которой будет получены данные о LongPoll сервере;
* `versionLongPoll` - версия LongPoll;
* `wait` - время (в секундах) ожидания ответа. Максимальное значение - 90;
* `mode` - дополнительные опции ответа. Сумма кодов опций из списка.
Подробную документацию о последних трёх параметрах можно найти [здесь](https://vk.com/dev/using_longpoll).

## `lp.start()`
Начинает пуллинг.

## `lp.isActive()`
Возвращает `true`, если пуллинг включен.

## `lp.stop()`
Останавливает пуллинг и обрывает текущее соединение.
