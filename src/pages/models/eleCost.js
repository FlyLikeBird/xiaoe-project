import { getTotalCost, getCurrentCost, getEnergyType, getAttrCost, getSceneInfo, getRank, getElectricCostAnalysis, getTotalCostAnalysis, fetchImg } from '../services/energyService';
import { getTodayWarning } from '../services/indexService';
import moment from 'moment';
let date = new Date();
const initialState = {
    //  时间维度，切换小时/日/月，默认以小时为单位
    chartInfo:{},
    // 定额信息
    quotaInfo:{},
    // 右上角当前时间段内的成本信息
    costInfo:[{ key:'day'}, { key:'month'}, { key:'year'}],
    costAnalysis:{},
    isLoading:true,
    chartLoading:true,
    // rateInfo:{},
    // 0 成本   1 能耗
    showType:'0',
    // 1:年  2:月  3:日
    timeType:'3',
    // 遮罩层状态
    maskVisible:false,
    // 属性相关成本状态
    attrCost:[{ key:'hour'}, { key:'day'}, { key:'month'}],
    currentDate:moment(date),
    warningLoading:true,
    warningList:[]
};

export default {
    namespace:'eleCost',
    state:initialState,
    effects:{
        *fetchInit(action, { call, put, all}){
            try {
                yield all([
                    put.resolve({ type:'fetchCost'}),
                    put.resolve({ type:'fetchAttrCost'}),
                    put.resolve({ type:'fetchCostByTime'}),
                    put.resolve({ type:'fetchTodayWarning'})
                ]);
            } catch(err){
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
        *fetchCost(action, { call, put, all, select }){
            try {
                let { resolve, reject } = action.payload || {};
                let { global:{ company_id }, fields:{ energyInfo }} = yield select(); 
                let [ currentCost, costAnalysis ] = yield all([
                    call(getCurrentCost, { company_id, type_id:energyInfo.type_id }),
                    call(
                        getElectricCostAnalysis,
                        // energyInfo.type_code === 'ele' ?
                        // getElectricCostAnalysis : 
                        // getTotalCostAnalysis,
                        { company_id }
                    )   
                ]);           
                if ( currentCost && currentCost.data.code === '0' && costAnalysis && costAnalysis.data.code === '0'){
                    let payload = { currentCost : currentCost.data.data,  costAnalysis : costAnalysis.data.data, energyType: energyInfo.type_id };
                    yield put({type:'get', payload});
                    if ( resolve && typeof resolve === 'function') resolve();
                }
            } catch (err){
                console.log(err);
            }
        },
        *fetchCostByTime(action, { call, put, select } ){
            try {
                let { global:{ company_id }, fields:{ energyInfo }, eleCost : { timeType }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                // timeType:
                let { data } = yield call(getTotalCost, { company_id, type_id:energyInfo.type_id, time_type:timeType })
                if ( data && data.code === '0'){
                    yield put({type:'getCostByTime', payload:{ data:data.data, timeType, energyType:energyInfo.type_id }});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                }
            } catch(err){
                console.log(err);
            }
        },
        // 请求属性相关成本接口
        *fetchAttrCost(action, { call, put, select, all }){
            try {
                let { global:{ company_id}, fields:{ energyInfo }, eleCost:{ currentDate }} = yield select();
                let temp = currentDate.format('YYYY-MM-DD').split('-');
                let year = temp[0], month = temp[1], day = temp[2];
                yield put({ type:'toggleChartLoading'});
                let [attrMonthData, attrDayData, attrHourData] = yield all([
                    call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:2, year, month, day }),
                    call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:3, year, month, day }),
                    call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:4, year, month, day }),
                ]);
                if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                    let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                    yield put({type:'getAttrCost', payload:obj});
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
        toggleMaskVisible(state, { payload }){
            return { ...state, maskVisible:payload };
        },
        get(state, { payload : { currentCost, costAnalysis }}){
            let costInfo=[];
            costInfo.push({ key:'day', ...currentCost['day']});
            costInfo.push({ key:'month',  ...currentCost['month']});
            costInfo.push({ key:'year', ...currentCost['year']});
            return { ...state, costInfo, costAnalysis, isLoading:false };
        },
        getCostByTime(state, { payload : { data, timeType, energyType }}){
            let chartInfo = data;
            chartInfo['valueData'] = { '0': data.cost, '1': data.energy };
            chartInfo['lastValueData'] = {'0': data.lastCost, '1':data.lastEnergy };
            chartInfo['sameValueData'] = { '0':data.sameCost, '1':data.sameEnergy };
            return { ...state, chartInfo };
        },
        getAttrCost(state, { payload:{ attrHourData, attrDayData, attrMonthData }}){
            let attrCost = [];
            attrHourData['key'] = 'hour';
            attrDayData['key'] = 'day';
            attrMonthData['key'] = 'month';
            attrCost.push(attrMonthData);
            attrCost.push(attrDayData);
            attrCost.push(attrHourData);
            return { ...state, attrCost, chartLoading:false };
        },
        getScene(state, { payload : { data }}){
            return { ...state, sceneInfo:data };
        },
        
        getWarning(state, { payload:{ data }}){
            return { ...state, warningList:data, warningLoading:false }
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        toggleEnergyType(state, { payload }){
            return { ...state, energyInfo:payload };
        },
        toggleShowType(state, { payload }){
            return { ...state, showType:payload };
        },
        setDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        toggleTimeType(state, { payload }){
            return { ...state, timeType:payload }
        },
        reset(state){
            return initialState;
        }
    }
}


