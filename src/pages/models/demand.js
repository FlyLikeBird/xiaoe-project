import { getMachs, getAttrsTree, getDemandInfo, getDemandAnalyz, getDemandCost, getUselessInfo, getMachEfficiency, setMachPower, getLineLoss, getEnergyPhase } from '../services/demandService';
import { getEnergyType } from '../services/energyService';
import moment from 'moment';
moment.suppressDeprecationWarnings = true;
let date = new Date();

const initialState = {
    machList:[],
    currentMach:{},
    demandInfo:{},
    analyzInfo:{},
    costInfo:{},
    uselessInfo:{},
    // 可选时间区间：过去一周，过去一个月，过去三个月
    demandTimeType:'1',
    demandLoading:true,
    beginTime:moment(date),
    endTime:moment(date),
    treeLoading:true,
    loaded:false,
    referTime:moment(date).subtract(1,'days'),
    uselessTime:moment(date),
    // 设备运行效率
    startDate:moment(date).subtract(7,'days'),
    endDate:moment(date),
    machEffInfo:{},
    machRatioList:[],
    machLoading:true,
    // 线损
    lineLossInfo:{},
    mainLineList:[],
    currentMainLine:{},
    lineLossList:[],
    lineLossLoading:true,
    rated_power:0,
    // 视在功率 = 有功功率 + 无功功率,
    // 视在功率等级 ： 按达到额定功率的百分比计算 视在功率 等级
    // 能源三相数据监控字段
    phaseStartDate:moment(date),
    phaseEndDate:moment(date),
    // 时间周期（1：日周期；2：月周期；3：年周期）
    phaseTimeType:'1',
    // （仅日周期时）时间格式类型(1:按小时分组；2：按30分钟分组；3：按15分钟分组；4：按5分钟分组；5：按1分钟分组)
    phaseDayTimeType:'1',
    // 参数类型(1：有功电量；2：无功电量；3：有功功率；4：无功功率；5：功率因素；6：最大需量；7：电流；8：电压：9：四象限无功电能)
    phaseOptionType:'1',
    phaseInfo:{},
    phaseValueList:[],
    phaseLoading:true
};

export default {
    namespace:'demand',
    state:initialState,
    effects:{
        *fetchInit(action, { call, put, select, all}){
            let { global : { company_id }} = yield select();  
            let { fetchAttrs, resolve, reject } = action.payload || {}; 
            let energyData, machData;
            if ( fetchAttrs ) {
                yield put({ type:'fetchEnergy'});
                yield put.resolve({ type:'fields/fetchField'});
                yield put.resolve({ type:'fields/fetchFieldAttrs'});
                if ( resolve && typeof resolve === 'function') resolve();
            } else {
                let [energyData, machData] = yield all([
                    call(getEnergyType),
                    call(getMachs, { company_id })
                ]);
                if ( energyData && energyData.data.code === '0' && machData && machData.data.code === '0'){
                    yield put({type:'getInit', payload:{ energyData:energyData.data.data, machData:machData.data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject();
                }
            }   
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
        *fetchDemand(action, { call, put, select }){
            let { global:{ company_id }, demand:{ currentMach, referTime }} = yield select();
            let refer_time = referTime.format('YYYY-MM-DD');
            let { data } = yield call(getDemandInfo, { company_id, mach_id:currentMach.key, refer_time });
            if ( data && data.code === '0'){
                yield put({type:'getDemand', payload:{ data:data.data }});
            }
        },
        *fetchAnalyze(action, { call, put, select }){
            let { global:{ company_id }, demand:{ currentMach, beginTime, endTime }} = yield select();
            yield put({ type:'toggleDemandLoading'});
            let { data } = yield call(getDemandAnalyz, { company_id, mach_id:currentMach.key, begin_time, end_time });
            if ( data && data.code === '0'){
                yield put({type:'getAnalyz', payload:{ data:data.data }});

            }
        },
        *fetchUseless(action, { call, select, put}){
            let { global:{ company_id, startDate, endDate }, fields:{ currentAttr }} = yield select();
            let { data } = yield call(getUselessInfo, { company_id, attr_id:currentAttr.key, time_date:startDate.format('YYYY-MM-DD'), end_time_date:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === '0'){
                yield put({type:'getUseless', payload:{ data:data.data }});
            }
        },
        *fetchMachEfficiency(action, { call, put, select }){
            try {
                let { global:{ company_id }, fields:{ currentAttr}, demand : { startDate, endDate }} = yield select();
                let begin_date = startDate.format('YYYY-MM-DD');
                let end_date = endDate.format('YYYY-MM-DD');
                yield put({ type:'toggleMachLoading'});
                let { data } = yield call(getMachEfficiency, { company_id, begin_date, end_date, attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachEfficiency', payload: { data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setMachPower(action, { call, put, select}){
            try {
                let { demand : { currentMach }} = yield select();
                let { rated_power, resolve, reject } = action.payload;
                let { data } = yield call(setMachPower, { rated_power, mach_id:currentMach.key });
                if ( data && data.code === '0') {
                    resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEnergyPhase(action, { call, put, select}){
            try {
                let { global:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }, demand : {  phaseDayTimeType, phaseOptionType }} = yield select();
                yield put({ type:'togglePhaseLoading'});
                let { data } = yield call(getEnergyPhase, { company_id, attr_id:currentAttr.key, time_type:timeType, option_type:phaseOptionType, day_time_type:phaseDayTimeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code ==='0'){
                    yield put({type:'getPhase', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
    },
    reducers:{
        getInit(state, { payload:{ energyData, machData }}){
            let currentMach = machData && machData.length ? machData[0] : {};
            return { ...state, energyList:energyData, machList:machData,  currentMach, treeLoading:false, loaded:true };
        },
        getEnergyList(state, { payload:{ data }}){
            return { ...state, energyList:data };
        },
        toggleMachLoading(state){
            return { ...state, machLoading:true };
        },
        togglePhaseLoading(state){
            return { ...state, phaseLoading:true };
        },
        toggleDemandLoading(state){
            return { ...state, demandLoading:true };
        },
        toggleLineLossLoading(state, { payload }){
            return { ...state, lineLossLoading:payload }
        },
        getDemand(state, { payload : { data }}){
            return { ...state, demandInfo:data };
        },
        getAnalyz(state, { payload: { data }}){
            return { ...state, analyzInfo:data, demandLoading:false };
        },
        toggleDemandTimeType(state, { payload }){
            let beginTime,endTime;
            let date = new Date();
            if ( payload === '1'){
                endTime = beginTime = moment(date);
            } else if ( payload === '2'){
                beginTime = moment(date).startOf('month');
                endTime = moment(date).endOf('month');
            }
            return { ...state, demandTimeType:payload, beginTime, endTime };
        },
        setDemandDate(state, { payload }){
            let { beginTime, endTime } = payload;
            return { ...state, beginTime, endTime };
        },
        getCost(state, { payload : { data }}){
            return { ...state, costInfo:data };
        },
        getUseless(state, { payload : { data }}){
            return { ...state, uselessInfo : data };
        },
        getMachEfficiency(state, { payload : { data }}){
            let machRatioList = [];
            machRatioList.push({ text:'当前负荷率', unit:'%', value:data.ratio, lastValue:0 });
            machRatioList.push({ text:'当前视在功率', unit:'kw', value:data.viewpower, lastValue:0});
            machRatioList.push({ text:'当前有功功率', unit:'kw', value:data.usepower, lastValue:0});
            machRatioList.push({ text:'当前无功功率', unit:'kw', value:data.uselesspower, lastValue:0});
            return { ...state, machEffInfo:data, machRatioList, machLoading:false };
        },
        getLineLoss(state, { payload : { data }}){
            let lineLossList = [];
            lineLossList.push({ text:'线损率', unit:'%', value:data.loseRate, lastValue:data.loseRateCont });
            lineLossList.push({ text:'输入总电量', unit:'kwh', value:data.in, lastValue:data.inCont});
            lineLossList.push({ text:'输出电量', unit:'kwh', value:data.out, lastValue:data.outCont });
            lineLossList.push({ text:'线损', unit:'kwh', value:data.lose, lastValue:data.loseCont });
            return { ...state, lineLossInfo:data, lineLossList, lineLossLoading:false };
        },
        getPhase(state, { payload:{ data }}){
            let phaseValueList = [];
            let isFactor = state.phaseOptionType === '5' ? true : false;
            phaseValueList.push({ text:'最大值', value: (+data.max).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'最小值', value:(+data.min).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'谷峰差', value:(+data.different).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'平均负荷', value:(+data.avgLoad).toFixed( isFactor ? 2 : 0), unit:data.unit });
            phaseValueList.push({ text:'负荷系数', value:(+data.avgLoadRatio * 100).toFixed(1), unit:'%'});
            phaseValueList.push({ text:'最小负荷率', value:(+data.minLoadRatio * 100).toFixed(1), unit:'%'});
            return { ...state, phaseInfo:data, phaseValueList, phaseLoading:false };
        },
        selectMach(state, { payload }){
            return { ...state, currentMach:payload ? payload:{} };
        },
        setDate(state, { payload }){
            return { ...state, referTime:payload };
        },
        setUselessDate(state, { payload }){
            return { ...state, uselessTime:payload };
        },
        setMachAndLineDate(state, { payload: { startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        // 能源三相数据
        setPhaseOptionType(state, { payload }){
            return { ...state, phaseOptionType:payload };
        },
        togglePhaseTimeType(state, { payload }){
            let phaseStartDate, phaseEndDate;
            let date = new Date();
            if ( payload === '1') {
                // 年时间维度下
                phaseStartDate = phaseEndDate = moment(date);
            } else if ( payload === '2'){
                phaseStartDate = moment(date).startOf('month');
                phaseEndDate = moment(date).endOf('month');
            } else if ( payload === '3'){
                phaseStartDate = moment(date).startOf('year');
                phaseEndDate = moment(date).endOf('year');
            }
            return { ...state, phaseTimeType:payload, phaseStartDate, phaseEndDate };
        },
        togglePhaseDayTimeType(state, { payload }){
            return { ...state, phaseDayTimeType:payload };
        },
        setPhaseDate(state, { payload:{ phaseStartDate, phaseEndDate }}){
            return { ...state, phaseStartDate, phaseEndDate };
        },
        setMachDate(state, { payload:{ startDate, endDate}}){
            return { ...state, startDate, endDate };
        },
        getMain(state, { payload:{ data }}){
            let currentMainLine = data && data.length ? data[0] : {};
            return { ...state, mainLineList:data, currentMainLine };
        },
        setMainLine(state, { payload }){
            return { ...state, currentMainLine:payload };
        },
        reset(state){
            return initialState;
        },
        resetDemand(state){
            let date = new Date();
            return { ...state, machList:[], currentMach:{}, demandInfo:{}, analyzeInfo:{}, referTime:moment(date).subtract(1,'days'), demandTimeType:'1', beginTime:moment(date), endTime:moment(date), demandLoading:true };
        },
        resetEnergyPhase(state){
            let date = new Date();
            return { ...state, phaseTimeType:'1', phaseDayTimeType:'1', phaseStartDate:moment(date), phaseEndDate:moment(date), phaseOptionType:'1',  phaseInfo:{}, phaseValueList:[], phaseLoading:true };
        }
        
    }
}


