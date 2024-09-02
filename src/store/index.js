/* import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import {thunk} from "redux-thunk"; (middleware для передачи функций в dispatch) */ 
import { configureStore } from '@reduxjs/toolkit';
import heroes from '../reducers/heroes';
import filters from '../reducers/filters';

const stringMiddleware = () => (next) => (action) => { 
    if (typeof action === 'string') { 
        return next({
            type: action
        })
    }
    return next(action)
}

// const store = createStore(
//                     combineReducers({heroes, filters}),
//                     compose( 
//                         applyMiddleware(thunk, stringMiddleware),
//                         window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
//                     ) 
//                 ); /* (без toolkit) */

const store = configureStore({ /* (создаем через функцию из toolkit - configureStore, кроме полей ниже можно подключать отдельно enchancers(усилители стора) и preloadedState(начальное состояние)) */
    reducer: {heroes, filters}, /* (подключаем редьюсеры - в виде обьекта) */
    // middleware: [thunk, stringMiddleware], /* (подключаем миддверы - в виде массива) */ 
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(stringMiddleware), /* (миддлверы подключаем через функцию для включения встроенных по умолчанию(serializability(проверка типов приходящих действий), immutability(проверка на мутации в сторе) и thunk(для передачи функций в dispatch), к которым присоединяем дополнительные через concat) */
    devTools: process.env.NODE_ENV !== "production", /* (подключаем инструменты разработчика - можно просто через true/false, но тогда останется и в продакшн-сборке) */ 
})

export default store;