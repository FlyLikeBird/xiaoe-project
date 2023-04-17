import { 
    getAttrWarning,
    getRealTimeWarning ,
    getLinkAlarmRank,
    getMachTypeRatio,
} from '../services/attrAlarmService';
import moment from 'moment';
const date = new Date();
const initialState = {
    warningInfo:{},
    // 1=>日周期 2=>月周期 3=》年周期
    timeType:'2',
    beginDate:moment(date).startOf('month'),
    endDate:moment(date).endOf('month'),
    chartLoading:true,
    regionAlarmInfo:{},
};

export default {
    namespace:'overAlarm',
    state:initialState,
    effects:{
        *fetchAllAlarm(action,{ select, call, put}){
            let { global:{ company_id }, overAlarm:{ timeType, beginDate, endDate }, fields:{ currentAttr }} = yield select();
            if ( beginDate._isAMomentObject && endDate._isAMomentObject ){
                beginDate = beginDate.format('YYYY-MM-DD');
                endDate = endDate.format('YYYY-MM-DD');
            }
            let params = { company_id, cate_code:'2', time_type:timeType, begin_date:beginDate, end_date:endDate, attr_id:currentAttr.key };
            yield put({ type:'fetchAttrAlarm', payload:params });
            yield put({ type:'fetchMachOffline', payload:params });
        },
        *fetchAttrAlarm(action,{ select, call, put}){
            let { data } = yield call(getAttrWarning, action.payload );
            if ( data && data.code === '0'){
                yield put({ type:'getAttrWarning', payload:{ data:data.data }});
            }
        },
        *fetchMachOffline(action, { call, put}){
            let { data } = yield call(getLinkAlarmRank, action.payload);
            if ( data && data.code === '0'){
                yield put({ type:'getMachOfflineInfo', payload:{ data:data.data }});
            }
        }
    },
    reducers:{
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getAttrWarning(state, { payload:{ data }}){
            return { ...state, warningInfo:data };
        },
        getMachOfflineInfo(state, { payload:{ data }}){
            return { ...state, regionAlarmInfo:data }
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
        reset(state){
            return initialState;
        }
    }
}


