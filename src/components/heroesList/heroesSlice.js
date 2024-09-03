import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
/* (createSlice позволяет обьединить создание редьюсера и действий в одну функцию, createAsyncThunk - для работы с асинхронными действиями) */
import { useHttp } from "../../hooks/http.hook";

const initialState = {
    heroes: [],
    heroesLoadingStatus: 'idle'
}

export const fetchHeroes = createAsyncThunk(
    'heroes/fetchHeroes', /* (рабочее имя - heroes из редьюсера + имя асинхронной функции) */
    async () => { /* (асинхронная функция-запрос, аргументами может получать данные из вызова из dispatch(например id или request) и опции самой функции(подробнее в документации), в д.с можно без async/await, так как request уже идет со встроенными) */
        const {request} = useHttp();
        return await request("http://localhost:3001/heroes");
    }
); /* (возвращает 3 actioncreaters - pending, fullfield и error - как в обычных промисах, обрабатываем их в редьюсере, саму функцию используем в HeroesList.js) */

const heroesSlice = createSlice({ /* (создаем редьюсер) */
    name: "heroes", /* (имя редьюсера - ниже экспортируем как reducer, но в store подключаем по имени, соответственно при изменении состояний в действиях тоже обращаемся к состояниям через это имя) */
    initialState, /* (начальные состояния) */
    reducers: { /* (сам обьект редьюсера) */
        /* (без свитча - название действия и функция по изменению состояния(об иммутабельности не заботимся - работает автоматически(но не пишем return и подключаем миддлверы по умолчанию при создании store))) */
        heroesFetching: state => {state.heroesLoadingStatus = "loading"},
        heroesFetched: (state, action) => {
                            state.heroesLoadingStatus = "idle";
                            state.heroes = action.payload;
                        },   /* (можно подключать вторую функцию по предварительной подготовке payload - например, если нужно добавить id(в документации)) */
        heroesFetchingError: state => {state.heroesLoadingStatus = "error"},
        heroCreated: (state, action) => { 
                            state.heroes.push(action.payload);
                        },
        heroDeleted: (state, action) => {
                            state.heroes = state.heroes.filter(item => item.id !== action.payload);
                        }
    },
    /* (если при работе нужен функционал из других редьюсеров, их подключают последним полем(extraReducers), подробнее в документации) */
    extraReducers: (builder) => { /* (подключаем сторонние редьюсеры через цепочку builder) */
        builder
            /* (функция запроса подключается как отдельный редьюсер, возвращает 3 дейтвия - pending, fullfield и error - как в обычных промисах, обрабатываем их) */
            .addCase(fetchHeroes.pending, state => {state.heroesLoadingStatus = "loading"})
            .addCase(fetchHeroes.fulfilled, (state, action) => {
                        state.heroesLoadingStatus = "idle";
                        state.heroes = action.payload;
                    })
            .addCase(fetchHeroes.rejected, state => {
                        state.heroesLoadingStatus = "error";
                    })  
            .addDefaultCase(() => {}) /* (по умолчанию вернет состояния без изменений) */
    }
});

const {actions, reducer} = heroesSlice; /* (деструктурируем обьект) */

export default reducer; /* (по дефолту экспортируем редьюсер, в state подключаем по полю name из редьюсера) */

export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} = actions;