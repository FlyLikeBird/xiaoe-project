import { getEnergyType, getBaseCost, setMachKva, getAdjustCost, getMeasureCost } from '../services/energyService';
import moment from 'moment';
import { message } from 'antd';
let date = new Date();


const initialState = {
    // 基本电费
    baseCostInfo:{},
    // 力调电费
    adjustCostInfo:{},
    measureCostInfo:{},
    measureInfoList:[],
    measureReferList:[],
    // 1:按月  2：按年
    measureTimeType:'1',
    
    treeLoading:true,
    isLoading:true
};

export default {
    namespace:'baseCost',
    state:initialState,
    effects:{
        // 电费成本入口(基本电费、计量电费、力调电费)
        *fetchEleCost(action, { call, put, select }){
            let { eleCostType } = action.payload ? action.payload : {};
            eleCostType = eleCostType || 'measure';
            yield put({ type:'toggleLoading'});
            if ( eleCostType === 'measure') {
                yield put( { type:'fetchMeasureCost'});
            } else if ( eleCostType === 'basecost') {
                yield put({ type:'fetchBaseCost'})
            } else if ( eleCostType === 'adjust') {
                yield put({ type:'fetchAdjustCost'})
            }
        },
        // 此接口提供给分析报告调用
        *fetchEleAnalyze(action, { call, put, all}){
            let { resolve, reject } = action.payload || {};
            yield put.resolve({ type:'fields/fetchField'});
            yield put.resolve({ type:'fields/fetchFieldAttrs'});
            yield all([
                put.resolve({ type:'fetchMeasureCost'}),
                put.resolve({ type:'fetchBaseCost'}),
                put.resolve({ type:'fetchAdjustCost'})
            ]);
            if ( resolve && typeof resolve === 'function') resolve();
        },
        *fetchBaseCost(action, { call, put, select}){
            try {
                let { global:{ company_id, startDate, endDate }, fields:{ currentAttr }} = yield select();
                let { data } = yield call(getBaseCost, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0'){
                    yield put({type:'getBaseInfo', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setMachKva(action, { call, put, select}){
            try {
                let { baseCost : { currentMach }} = yield select();
                let { total_kva, resolve, reject } = action.payload;
                let { data } = yield call(setMachKva, { total_kva, mach_id:currentMach.key });
                if ( data && data.code === '0'){
                    resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchAdjustCost(action, { call, put, select }){
            try {
                let { global:{ company_id }, fields : { currentAttr }} = yield select();
                let { data } = yield call(getAdjustCost, { company_id, attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({type:'getAdjustInfo', payload:{ data:data.data }});
                } else {
                    message.info(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeasureCost(action, { call, put, select }){
            try {
                let { global:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                let measureTimeType = timeType === '2' ? '1' : timeType === '3' ? '2' : '1';       
                let { data } = yield call(getMeasureCost, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:measureTimeType });
                if ( data && data.code === '0') {
                    yield put({ type:'getMeasureInfo', payload:{ data:data.data }});
                }   
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getBaseInfo(state, { payload: { data }}){
            return { ...state, baseCostInfo:data, isLoading:false };
        },
        getAdjustInfo(state, { payload:{ data }}){
            return { ...state, adjustCostInfo:data, isLoading:false };
        },
        getMeasureInfo(state, { payload:{ data }}){
            let measureInfoList, measureReferList;
            // 将尖时段信息设为数组第一项
            let temp = data.base.detail.pop(), temp2 = data.referInfo.refer.pop();
            data.base.detail.unshift(temp);
            data.referInfo.refer.unshift(temp2);
            measureInfoList = data.base.detail;
            measureReferList = data.referInfo.refer;
            return { ...state, measureCostInfo:data, measureInfoList, measureReferList, isLoading:false };
        },
       
        selectMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        
        reset(state){
            return initialState;
        }
        
    }
}



