import { getEnergyRate, setWaterRate, getBilling, addBilling, deleteBilling, editBilling, isActive, isUnActive, editRate } from '../services/billingService';

const initialState = {
    list:[],
    forEdit:false,
    visible:false,
    is_actived:false,
    prevItem:{},
    rateInfo:{},
    feeRate:{},
    isLoading:false
};

export default {
    namespace:'billing',
    state:initialState,
    effects:{
        *fetchBilling(action, { select, call, put}){
            let { pageNum } = action.payload || {};
            let { global:{ company_id }} = yield select();
            let { data } = yield call(getBilling, { company_id });
            if ( data && data.code === '0' ) {
                yield put({type:'get', payload:{ data:data.data }});
            } 
        },
        *fetchFeeRate(action, { select, call, put }){
            let { global:{ company_id }} = yield select();
            let { data } = yield call(getEnergyRate, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getFeeRate', payload:{ data:data.data }});
            }
        },
        *add(action, { call, put, select}){
            let { global:{ company_id }} = yield select();
            let { values, timedata, forEdit, resolve, reject } = action.payload || {};
            values['company_id'] = company_id;
            values.begin_month = values.begin_month.month() + 1;
            values.end_month = values.end_month.month() + 1;
            values.timedata = timedata.map(field=>{
                let obj = { ...field };
                obj.begin_time = obj.begin_time.substring(0,obj.begin_time.length-1);
                obj.end_time = obj.end_time.substring(0,obj.end_time.length-1);
                return obj;
            });            
            if ( forEdit ) {
                let { billing : { prevItem }} = yield select();
                values['quarter_id'] = prevItem['quarter_id'];
                let { data } = yield call(editBilling, values);
                if ( data && data.code === '0' ){
                    yield put({type:'fetchBilling', payload:{}});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } else {
                let { data } = yield call(addBilling, values);
                if ( data && data.code === '0' ){
                    yield put({type:'fetchBilling', payload:{}});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            }
        },
        *delete(action, { call, put}){
            let { payload } = action;
            let { data } = yield call(deleteBilling, { quarter_id: payload });
            if ( data && data.code === '0' ) {
                yield put({type:'fetchBilling', payload:{}});
            }
        },
        *active(action, { call, put, select}){
            let { resolve, reject } = action.payload;
            let { global:{ company_id }, billing : { is_actived }} = yield select();
            if ( is_actived ) {
                // 取消激活
                let { data } = yield call(isUnActive, { company_id });
                if ( data && data.code === '0'){
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } else {
                // 激活
                let { data } = yield call(isActive, { company_id });
                if ( data && data.code === '0') {
                    if ( resolve ) resolve();
                } else {
                    if (reject) reject(data.msg);
                }
            }
        },
        *editRate(action, { call, put }){
            let { data } = yield call(editRate, action.payload.values);
            if ( data && data.code === '0'){
                yield put({type:'fetchBilling' });
            }
        },
        *setFeeRate(action, { select, call, put }){
            let { global:{ company_id }} = yield select();
            let { resolve, reject, water_rate } = action.payload || {};
            let { data } = yield call(setWaterRate, { company_id, water_rate });
            if ( data && data.code === '0'){
                yield put({ type:'fetchFeeRate'});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function' ) reject(data.msg);
            }
        }
    },
    reducers:{
        get(state, { payload : {data} }){
            let { quarterList, rate } = data;
            let is_actived = rate.is_actived === 0 ? false : true;
            return { ...state, list:quarterList, is_actived, rateInfo:rate };
        },
        getFeeRate(state, { payload:{ data }}){
            return { ...state, feeRate:data };
        },
        toggleVisible(state, { payload}){
            let { visible, forEdit, prevItem } = payload;
            return { ...state, visible, forEdit, prevItem : prevItem ? prevItem : {} };
        },
        toggleActive(state){
            return { ...state, is_actived:!state.is_actived};
        },
        reset(){
            return initialState;
        }
    }
}
