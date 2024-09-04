import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from "@reduxjs/toolkit";
/* (createSlice позволяет обьединить создание редьюсера и действий в одну функцию, createAsyncThunk - для работы с асинхронными действиями) */
import { useHttp } from "../../hooks/http.hook";

const heroesAdapter = createEntityAdapter(); /* (создаем адаптер, как аргументы можно передать функции по донастройке - в документации приведены как примеры функция с добавлением id и функция сортировки) */

// const initialState = {
//     heroes: [],
//     heroesLoadingStatus: 'idle'
// }
const initialState = heroesAdapter.getInitialState({ /* (cоздаем начальные состояния с помощью встроенной функции адаптера(имеет две встроенных сущности - entity(в нее автоматически пойдет полученынй массив из запроса - heroes) и ids(для id))) */
    heroesLoadingStatus: "idle" /* (передаем дополнительные состояния) */
}); /* (для изменения состояний имеет набор встроенных функций(СRUD, наподобие addOne или deleteAll, список в документации, функции следят за нормализацией данных - не перезаписывают одинаковые и следят за иммутабельностью) - их вызываем в редьюсере при изменении состояний) */

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
        // heroesFetching: state => {state.heroesLoadingStatus = "loading"},
        // heroesFetched: (state, action) => {
        //                     state.heroesLoadingStatus = "idle";
        //                     state.heroes = action.payload;
        //                 },   /* (можно подключать вторую функцию по предварительной подготовке payload - например, если нужно добавить id(в документации)) */
        // heroesFetchingError: state => {state.heroesLoadingStatus = "error"},
        heroCreated: (state, action) => { 
                            // state.heroes.push(action.payload);
                            heroesAdapter.addOne(state, action.payload);
                        },
        heroDeleted: (state, action) => {
                            // state.heroes = state.heroes.filter(item => item.id !== action.payload);
                            heroesAdapter.removeOne(state, action.payload);
                        }
    },
    /* (если при работе нужен функционал из других редьюсеров, их подключают последним полем(extraReducers), подробнее в документации) */
    extraReducers: (builder) => { /* (подключаем сторонние редьюсеры через цепочку builder) */
        builder
            /* (функция запроса подключается как отдельный редьюсер, возвращает 3 дейтвия - pending, fullfield и error - как в обычных промисах, обрабатываем их) */
            .addCase(fetchHeroes.pending, state => {state.heroesLoadingStatus = "loading"})
            .addCase(fetchHeroes.fulfilled, (state, action) => {
                        state.heroesLoadingStatus = "idle";
                        // state.heroes = action.payload;
                        heroesAdapter.setAll(state, action.payload); /* (при работе с адаптером встроенная функция setAll полностью заменит в state полученные данные(action.payload - массив с героями), для получения этих состояний из store прописываем дополнительный экспорт(внизу документа)) */
                    })
            .addCase(fetchHeroes.rejected, state => {
                        state.heroesLoadingStatus = "error";
                    })  
            .addDefaultCase(() => {}) /* (по умолчанию вернет состояния без изменений) */
    }
});

const {actions, reducer} = heroesSlice; /* (деструктурируем обьект) */

export default reducer; /* (по дефолту экспортируем редьюсер, в state подключаем по полю name из редьюсера) */

export const {selectAll} = heroesAdapter.getSelectors(state => state.heroes); /* (при работе с createEmptityAdapter экспортируем встроенный обьект selectAll(остальные смотреть в документации) - с помощью метода getSelectors получит указанные состояния(heroes)) */

export const filteredHeroesSelector = createSelector( 
    (state) => state.filters.activeFilter,
    // (state) => state.heroes.heroes,
    selectAll,
    (filter, heroes) => { 
        if (filter === "all") {
            return heroes;
        } else {
            return heroes.filter(item => item.element === filter)
        }
    }
) 

export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    heroDeleted
} = actions;