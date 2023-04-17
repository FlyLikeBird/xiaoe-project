import { getTodaySumInfo, getTodayWarning, getEnergyPercent, getFieldCost, getEnergyTrend } from '../services/indexService';
import moment from 'moment';

const initialState = {
    energyData:{},
    warningList:[],
    warningLoading:true,
    energyPercent:{},
    timeType:'1',
    dataType:'1',
    chartInfo:{},
    attrChartInfo:[],
    attrChartLoading:true
};

export default {
    namespace:'home',
    state:initialState,
    effects:{
        *init(action, { put }){
            yield put({ type:'fetchSumInfo'});
            yield put({ type:'fetchTodayWarning'});
            yield put({ type:'fetchEnergyPercent'});
            yield put({ type:'fetchEnergyTrend'});
            yield put({ type:'fetchFieldCost'});
        },
        *fetchSumInfo(action, { select, call, put }){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getTodaySumInfo, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getInfoList', payload:{ data:data.data }});
                }
            } catch(err) {  
                console.log(err);
            }
        },
        *fetchTodayWarning(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getTodayWarning, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getWarning', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEnergyPercent(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getEnergyPercent, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getEnergyPercent', payload:{ data:data.data }})
                }
            }catch(err){
                console.log(err);
            }
        },
        *fetchEnergyTrend(action, { select, call, put}){
            let { global:{ company_id }, fields:{ energyInfo }, home:{ dataType, timeType }} = yield select();
            let { data } = yield call(getEnergyTrend, { company_id, energy_type:energyInfo.type_id, time_type:timeType, data_type:dataType });
            if ( data && data.code === '0'){
                yield put({ type:'getEnergyTrend', payload:{ data:data.data }})
            }
        },
        *fetchFieldCost(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getFieldCost, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getFieldCost', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        getInfoList(state, { payload:{ data }}){
            return { ...state, energyData:data };
        },
        getWarning(state, { payload:{ data }}){
            return { ...state, warningList:data, warningLoading:false }
        },
        getEnergyPercent(state, { payload:{ data }}){
            return { ...state, energyPercent:data };
        },
        getEnergyTrend(state, { payload:{ data }}){
            return { ...state, chartInfo:data };
        },
        getFieldCost(state, { payload:{ data }}){
            let attrChartInfo = data.sort((a,b)=>{
                let aCost = a.ele_cost + a.water_cost + a.gas_cost + a.hot_cost;
                let bCost = b.ele_cost + b.water_cost + b.gas_cost + b.hot_cost;
                return bCost - aCost;
            });
            return { ...state, attrChartInfo, attrChartLoading:false };
        },
        toggleTimeType(state, { payload }){
            return { ...state, timeType:payload };
        },
        toggleDataType(state, { payload }){
            return { ...state, dataType:payload };
        },
        reset(){
            return initialState;
        }
    }
}


