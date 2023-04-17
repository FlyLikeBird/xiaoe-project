import { getMeterReport, getEnergyType, exportReport } from '../services/meterReportService';
import moment from 'moment';
let date = new Date();
const initialState = {
    // 1：日周期  2：月周期 3：年周期
    reportInfo:[],
    currentPage:1,
    isLoading:true,
    loaded:false
};

export default {
    namespace:'meterReport',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action,{ put }){
            yield put({ type:'cancelMeterReport'});
            yield put({ type:'reset'});
        },
        *fetchInit(action, { select, call, put}){
            try{
                let { resolve, reject } = action.payload || {};
                yield put.resolve({ type:'fields/init'});
                yield put.resolve({ type:'fetchMeterReport'});
                if ( resolve && typeof resolve === 'function') resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeterReport(action, { call, put, select}){
            yield put({ type:'cancelMeterReport'});
            yield put.resolve({ type:'cancelable', task:fetchMeterReportCancelable, action:'cancelMeterReport' });
            function* fetchMeterReportCancelable(){
                try {
                    let { global:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr, energyInfo }} = yield select();
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getMeterReport, { company_id, type_id:energyInfo.type_id, attr_id:currentAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') })
                    if ( data && data.code === '0'){
                        yield put({type:'getMeterReport', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        } 
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getMeterReport(state, { payload:{ data }}){
            return { ...state, reportInfo:data, isLoading:false, currentPage:1, loaded:true };
        },
        setPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(state){
            return initialState;
        }
    }
}

