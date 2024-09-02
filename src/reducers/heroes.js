import { createReducer } from "@reduxjs/toolkit";

import {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} from "../actions"; /* (для удобства импортируем готовые действия и передаем их в редьюсер) */

const initialState = {
    heroes: [],
    heroesLoadingStatus: 'idle'
}

const heroes = createReducer(initialState, builder => { /* (при создании редьюсера передаем начальное состояние и функцию, которая примет и использует builder, с помощью которого вместо switch по цепочке подключаем действия(должны быть созданы с помощью функционала toolkit)) */
    builder 
        .addCase(heroesFetching, state => {
            state.heroesLoadingStatus = "loading"; /* (функцию по изменению состояния передаем обязательно в таком виде - без return и не в одну строку, иначе не будет автоматически обрабатывать) */
        })
        .addCase(heroesFetched, (state, action) => {
            state.heroesLoadingStatus = "idle";
            state.heroes = action.payload;
        })
        .addCase(heroesFetchingError, state => {
            state.heroesLoadingStatus = "error";
        })
        .addCase(heroCreated, (state, action) => { /* (передаем действие и функцию по изменению состояния(меняем напрямую, не сохраняя иммутабельность - обработает автоматически и ошибки не вызовет)) */
            state.heroes.push(action.payload);
        })
        .addCase(heroDeleted, (state, action) => {
            state.heroes = state.heroes.filter(item => item.id !== action.payload);
        })
        .addDefaultCase(() => {}); /* (дефолтный кейс - в д.с возвращаем состояние без изменений) */
        /* (в цепочку можно добавить addMatcher для фильтрации входящих действий - подробнее в документации) */
})
// -------------------------------------
    /* (без builder - передаем цепочку действий в виде обьекта) */
// const heroes = createReducer(initialState, { 
//     [heroesFetching]: state => {state.heroesLoadingStatus = "loading"},
//     [heroesFetched]: (state, action) => {
//                             state.heroesLoadingStatus = "idle";
//                             state.heroes = action.payload;
//                         },   
//     [heroesFetchingError]: state => {state.heroesLoadingStatus = "error"},
//     [heroCreated]: (state, action) => { 
//                             state.heroes.push(action.payload);
//                         },
//     [heroDeleted]: (state, action) => {
//                             state.heroes = state.heroes.filter(item => item.id !== action.payload);
//                         }},
//     [], /* (массив для функций фильтрации действий) */
//     state => state /* (дефолтное возвращение состояний) */
// )
// -------------------------------------
/* (без toolkit) */
// const heroes = (state = initialState, action) => {
//     switch (action.type) {
//         case 'HEROES_FETCHING':
//             return {
//                 ...state,
//                 heroesLoadingStatus: 'loading'
//             }
//         case 'HEROES_FETCHED':
//             return {
//                 ...state,
//                 heroes: action.payload,
//                 heroesLoadingStatus: 'idle'
//             }
//         case 'HEROES_FETCHING_ERROR':
//             return {
//                 ...state,
//                 heroesLoadingStatus: 'error'
//             }
//         case 'HERO_CREATED':  
//             return {
//                 ...state,
//                 heroes: [...state.heroes, action.payload]
//             }
//         case 'HERO_DELETED': 
//             return {
//                 ...state,
//                 heroes: state.heroes.filter(item => item.id !== action.payload)
//             }
//         default: return state
//     }
// }

export default heroes;