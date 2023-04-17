import { getMachs, getAttrsTree, getUselessInfo } from '../services/demandService';
import { getEnergyType } from '../services/energyService';
import moment from 'moment';
moment.suppressDeprecationWarnings = true;
let date = new Date();

const initialState = {
    energyInfo:{},
    energyList:[],
    machList:[],
    currentMach:{},
    uselessInfo:{},    
    uselessTime:moment(date),
    isLoading:true
};

export default {
    namespace:'useless',
    state:initialState,
    effects:{
        *fetchInit(action, { call, put, select, all}){
            let { resolve, reject } = action.payload || {}; 
            yield put({ type:'fetchEnergy'});
            yield put.resolve({ type:'fetchMachs'});
            if ( resolve && typeof resolve === 'function') resolve();
        },
        *fetchEnergy(action, { call, put }){
            try {
                let { data } = yield call(getEnergyType);
                if ( data && data.code === '0'){
                    yield put({type:'getEnergyList', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachs(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getMachs, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachs', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchUseless(action, { call, select, put}){
            let { global:{ company_id }, useless:{ currentMach, uselessTime }} = yield select();
            let time_date = uselessTime.format('YYYY-MM-DD');
            yield put({ type:'toggleLoading'});
            let { data } = yield call(getUselessInfo, { company_id, mach_id:currentMach.key, time_date });
            if ( data && data.code === '0'){
                yield put({type:'getUseless', payload:{ data:data.data }});
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getEnergyList(state, { payload:{ data }}){
            return { ...state, energyList:data, energyInfo:data[0] || {} };
        },
        getMachs(state, { payload:{ data }}){
            return { ...state, machList:data, currentMach:data[0] || {} };
        },
        getUseless(state, { payload : { data }}){
            return { ...state, uselessInfo : data, isLoading:false };
        },
        selectMach(state, { payload }){
            return { ...state, currentMach:payload ? payload:{} };
        },
        toggleEnergyType(state, { payload }){
            let energyInfo = state.energyList.filter(i=>i.type_id === payload )[0];
            return { ...state, energyInfo };
        },
        setDate(state, { payload }){
            return { ...state, referTime:payload };
        },
        setUselessDate(state, { payload }){
            return { ...state, uselessTime:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


