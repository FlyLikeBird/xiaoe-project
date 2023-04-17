import { getLoginLog, getActionLog } from '../services/systemLogService';

const initialState = {
    loginLog:{},
    actionLog:{},
    logType:'',
    loginPageNum:1,
    actionPageNum:1,
    loginTotal:1,
    actionTotal:1,
    isLoading:false,  
};

export default {
    namespace:'log',
    state:initialState,
    effects:{
        *fetchLog(action, {call, select, all, put}){ 
            try {
                let { global:{ company_id }} = yield select();
                let { page, pagesize, logType } = action.payload || {};
                page = page || 1;
                pagesize = pagesize || 10;
                logType = logType || 'login'
                yield put({type:'toggleLoading'});
                let { data } = yield call(
                    logType === 'login' ? getLoginLog : getActionLog,
                    { company_id, page, pagesize } 
                );
                if ( data && data.code === '0'){
                    let logData = {
                        count:data.count,
                        logs:data.data.logs,
                        pageNum:data.data.page
                    };
                    if ( logType === 'login') {
                        yield put({type:'getLoginLog', payload:{ data: logData }});
                    } else {
                        yield put({type:'getActionLog', payload:{ data: logData }});
                    }
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
        getLoginLog(state, { payload:{ data }}){
            return { ...state, loginLog:data, isLoading:false };
        },
        getActionLog(state, { payload:{ data }}){
            return { ...state, actionLog:data, isLoading:false };
        },
        reset(){
            return initialState;
        }
    }
}
