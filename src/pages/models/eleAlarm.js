import { 
    getAttrWarning,
    getRealTimeWarning ,
    getLinkAlarmRank,
    getMachTypeRatio
} from '../services/attrAlarmService';
import moment from 'moment';
const date = new Date();
const initialState = {
    warningInfo:{},
    // 1=>日周期 2=>月周期 3=》年周期
    timeType:'2',
    beginDate:moment(date).startOf('month'),
    endDate:moment(date).endOf('month'),
    realTimeInfo:{},
    chartLoading:true,
    // TC：温度；IR：剩余电流；ele_exceed：电流；vol_exceed：电压；power_factor：功率因素；
    typeCode:'ele_exceed',
    dayTimeType:'4',
};

export default {
    namespace:'eleAlarm',
    state:initialState,
    effects:{
        *fetchAttrAlarm(action,{ select, call, put}){
            let { global:{ company_id }, eleAlarm:{ timeType, beginDate, endDate }, fields:{ currentAttr }} = yield select();
            if ( beginDate._isAMomentObject && endDate._isAMomentObject ){
                beginDate = beginDate.format('YYYY-MM-DD');
                endDate = endDate.format('YYYY-MM-DD');
            }
            let { data } = yield call(getAttrWarning, { company_id, cate_code:'1', time_type:timeType, begin_date:beginDate, end_date:endDate, attr_id:currentAttr.key })
            if ( data && data.code === '0'){
                yield put({ type:'getAttrWarning', payload:{ data:data.data }});
            }
        },
        *fetchRealTimeAlarm(action, { select, call, put}){
            try {
                let { global:{ company_id }, eleAlarm:{ typeCode, dayTimeType }, fields:{ currentAttr }} = yield select();
                let { nofresh } = action.payload || {};
                if ( !nofresh ) {
                    yield put({ type:'toggleChartLoading'});
                }
                let { data } = yield call(getRealTimeWarning, { company_id, type_code:typeCode, day_time_type:dayTimeType, attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({ type:'getRealTimeAlarm', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        init(state, { payload:{ cate_code }}){
            return { ...state, cateCode:cate_code };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getAttrWarning(state, { payload:{ data }}){
            return { ...state, warningInfo:data };
        },
        getRealTimeAlarm(state, { payload:{ data }}){
            return { ...state, realTimeInfo:data, chartLoading:false };
        },
        toggleTimeType(state, { payload:{ timeType }}){
            let beginDate, endDate;
            let date = new Date();
            if ( timeType === '1'){
                endDate = beginDate = moment(date);
            } else if ( timeType === '2'){
                beginDate = moment(date).startOf('month');
                endDate = moment(date).endOf('month');
            } else {
                beginDate = moment(date).startOf('year');
                endDate = moment(date).endOf('year');
            }
            return { ...state, timeType, beginDate, endDate };
        },
        setDate(state, { payload:{ beginDate, endDate }}){
            return { ...state, beginDate, endDate };
        },
        toggleDayTimeType(state, { payload:{ dayTimeType }}){
            return { ...state, dayTimeType }
        },
        toggleTypeCode(state, { payload:{ typeCode }}){
            return { ...state, typeCode };
        },
        reset(state){
            return initialState;
        }
        
        
    }
}


