import { 
    getRuleList, 
    getMachs, 
    getRuleType, 
    getWarningTrend,
    addRule, updateRule, deleteRule, getSceneInfo, getTodayInfo, getWarningChartInfo, getRegionChartInfo, getWarningDetail, getWarningList, getRecordList, getRecordDetail, getExecuteType, executeRecord, confirmRecord, getHistoryLog, getProgressLog, setSceneInfo, uploadImg, fetchImg } from '../services/alarmService';
import moment from 'moment';

const warningType = {
    '1':'电气安全',
    '2':'指标越限',
    '3':'通讯异常'
};
let date = new Date();
// auth_type 用户权限（0：普通用户；1：区域维护人员；2：区域负责人）
const initialState = {
    ruleList:[],
    ruleType:[],
    sceneInfo:{},
    alarmInfo:[],
    ruleMachs:[],
    sumInfo:{},
    sumList:[],
    detailInfo:{},
    detailList:[],
    startTime:moment(1, 'DD'),
    endTime:moment(new Date().getDate(),'DD'),
    // 告警列表执行----相关状态
    recordListInfo:{},
    executeType:[],
    recordHistory:[],
    recordProgress:[],
    isLoading:false,
    pageNum:1,
    // 告警趋势状态
    attrIds:[],
    alarmTrendInfo:{},
    // 1 日周期  2 月周期
    
};

export default {
    namespace:'alarm',
    state:initialState,
    effects:{
        // 安全设置相关code
        *fetchRule(action, { select, call, put }){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getRuleList, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getRule', payload:{ data:data.data }});
                }
            } catch(err) {  
                console.log(err);
            }
        },
        *fetchMachs(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getMachs, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachs', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        // 告警趋势接口数据
        *fetchWarningTrend(action, { call, select, put}){
            try{
                // 时间类型（1：本月；2：本年）
                let { global:{ company_id, timeType, startDate, endDate }, alarm:{ attrIds }} = yield select();
                let trendTimeType = timeType === '2' ? '1' : timeType === '3' ? '2' : '1';
                let { data } = yield call(getWarningTrend, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_ids:attrIds, time_type:trendTimeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getWarningTrend', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchRuleType(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getRuleType, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getRuleType', payload: { data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *addRule(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { values, resolve, reject } = action.payload;
                values.company_id = company_id;
                values.level = values.level == 1 ? 3 : values.level == 3 ? 1 : 2;
                let { data } = yield call(addRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *updateRule(action, { call, put}){
            try {
                let { values, resolve, reject } = action.payload;
                values.level = values.level == 1 ? 3 : values.level == 3 ? 1 : 2;
                let { data } = yield call(updateRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteRule(action , { call, put}){
            try {
                let rule_id = action.payload;
                let { data } = yield call(deleteRule, { rule_id });
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMonitorInfo(action, { all, call, put, select}){
            try {
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({type:'fetchAlarmInfo'}),
                    put.resolve({type:'fetchChartInfo'})
                ]);
                if ( resolve && typeof resolve === 'function') resolve();    
            } catch(err){
                console.log(err);
            }
        },
        // 安全监控相关code
        *fetchSceneInfo(action, { select, call, put }){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getSceneInfo, { company_id });
                let imgURL = '';
                if ( data.data.scene && data.data.scene.bg_image_path ){
                    imgURL = yield call(fetchImg, { path:data.data.scene.bg_image_path} );
                }
                if ( data && data.code === '0' ){
                    if(imgURL){
                        data.data.scene.bg_image_path = imgURL;
                    }
                    yield put({type:'getScene', payload:{ data:data.data }});
                }
            } catch (err){
                console.log(err);
            }  
        },
        *fetchAlarmInfo(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getTodayInfo, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getAlarmInfo', payload: { data:data.data }});
                }
            } catch (err) {
                console.log(err);
            }
        },
        // 告警详情页
        *fetchSumInfo(action, { call, put, select, all }){
            try {
                let { resolve, reject } = action.payload || {};
                let { global:{ company_id }, alarm : { startTime, endTime }} = yield select();
                let begin_date = startTime.format('YYYY-MM-DD');
                let end_date = endTime.format('YYYY-MM-DD');
                let [ sumData, detailData ] = yield all([
                    call(getWarningList, { company_id, begin_date, end_date }),
                    call(getWarningDetail, { company_id, begin_date, end_date })
                ]);
                if ( sumData && sumData.data.code === '0' && detailData && detailData.data.code === '0' ){
                    yield put({type:'getSumInfo', payload:{ sumInfo:sumData.data.data, detailInfo:detailData.data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();    
                } else {
                    if ( reject && typeof reject === 'function') reject();    
                }       
            } catch(err){
                console.log(err);
            }
        },
        // 告警列表页
        *fetchRecordList(action , { select, call, put}){
            try {
                let { global:{ company_id }, alarm:{ pageNum }} = yield select();
                let { pagesize, cate_code, keywords } = action.payload;
                pagesize = pagesize ? pagesize : 10;
                cate_code = cate_code ? cate_code : 1;
                let params = { company_id, page:pageNum, pagesize, cate_code };
                if ( keywords ){
                    params['keywords'] = keywords;
                }
                yield put({type:'toggleLoading'});
                let { data } = yield call(getRecordList, params);
                if ( data && data.code === '0'){
                    yield put({type:'getRecord', payload:{ list:data.data, count:data.count }});
                }
            } catch(err){
                console.log(err);
                
            }
        },
        *fetchRecordDetail(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getRecordDetail, { company_id, record_id: action.payload });
            } catch(err){
                console.log(err);
            }
        },
        *fetchExecuteType(action, { call, put }){
            try {
                let { data } = yield call(getExecuteType);
                if ( data && data.code ==='0'){
                    yield put({type:'getExecuteType', payload:{ data: data.data }});
                }
            } catch(err){
                console.log(err);
            } 
        },
        *fetchRecordHistory(action, { call, put}){
            try {
                let { data } = yield call(getHistoryLog, { mach_id: action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'getRecordHistory', payload:{ data:data.data }});
                }
                console.log(data);
            } catch(err){
                console.log(err);
            }
        },
        *fetchProgressInfo(action, { call, put}){
            try {
                let { data } = yield call(getProgressLog, { record_id:action.payload });
                if ( data && data.code ){
                    yield put({type:'getProgress', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *confirmRecord(action, { select, call, put, all }){
            try {
                let { global:{ company_id }} = yield select();
                let { record_id, oper_code, execute_type, execute_info, photos, resolve, reject } = action.payload;
                // photos字段是上传到upload接口返回的路径
                let uploadPaths;
                if ( photos && photos.length ) {
                    let imagePaths = yield all([
                        ...photos.map(file=>call(uploadImg, { file }))
                    ]);
                    uploadPaths = imagePaths.map(i=>i.data.data.filePath);
                } 
                let { data } = yield call(confirmRecord, { company_id, record_id, photos:uploadPaths, log_desc:execute_info, oper_code, type_id:execute_type });                 
                if ( data && data.code === '0'){
                    resolve();
                    yield put({type:'fetchProgressInfo', payload:record_id });
                    yield put({type:'fetchRecordList', payload:{} });
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *setSceneInfo(action, { select, call, put }){
            try{
                let { global:{ company_id }} = yield select();
                let { file, resolve, reject } = action.payload || {};
                let { data } = yield call(uploadImg, { file });
                if ( data && data.code === '0'){
                    let imgPath = data.data.filePath;
                    let sceneData = yield call(setSceneInfo, { company_id, image_path:imgPath });
                    if ( sceneData && sceneData.data.code === '0'){
                        yield put({ type:'fetchSceneInfo'});
                        if ( resolve && typeof resolve === 'function') resolve();
                    } else {
                        if ( reject && typeof reject === 'function') reject(sceneData.data.msg);
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
        getRule(state, { payload : { data }}){
            return { ...state, ruleList:data };
        },
        getRuleType(state, { payload:{data}}){
            return { ...state, ruleType:data };
        },
        getScene(state, { payload: { data }}){
            return { ...state, sceneInfo:data };
        },
        getAlarmInfo(state, { payload : { data }}){
            let alarmInfo = []; 
            data['1'].warning_type = warningType['1'];
            data['2'].warning_type = warningType['2'];
            data['3'].warning_type = warningType['3'];

            alarmInfo.push(data['1']);
            alarmInfo.push(data['2']);
            alarmInfo.push(data['3']);
            return { ...state, alarmInfo };
        },
        getMachs(state, { payload:{ data }}){
            return { ...state, ruleMachs:data };
        },
        getSumInfo(state, { payload : { sumInfo, detailInfo }}){
            let sumList = [], detailList = [];
            sumList.push({ type:'total', text:'告警次数', count:sumInfo.codeCountArr.total || 0 });
            sumList.push({ type:'ele', text:'电气安全告警', count:sumInfo.codeCountArr.ele || 0 });
            sumList.push({ type:'limit', text:'指标越限告警', count:sumInfo.codeCountArr.quotaLimit || 0 });
            sumList.push({ type:'link', text:'通讯告警', count:sumInfo.codeCountArr.link || 0 });
            detailList.push(detailInfo.detail);
            detailList.push(detailInfo.view.ele);
            detailList.push(detailInfo.view.limit);
            detailList.push(detailInfo.view.link);
            return { ...state, sumInfo, detailInfo, sumList, detailList };
        },
        getWarningTrend(state, { payload:{ data }}){
            let alarmInfoList = [];
            alarmInfoList.push({ type:'safe', text:'安全告警事件', total:+data.safeCnt, finish:+data.safeFinishCnt, ratio:data.safeRate });
            alarmInfoList.push({ type:'over', text:'越限告警事件', total:+data.limitCnt, finish:+data.limitFinishCnt, ratio:data.limitRate });
            alarmInfoList.push({ type:'link', text:'通讯告警事件', total:+data.linkCnt, finish:+data.linkFinishCnt, ratio:data.linkRate });
            data['alarmInfoList'] = alarmInfoList;
            return { ...state, alarmTrendInfo:data };
        },
        
        selectAttrIds(state, { payload }){
            return { ...state, attrIds:payload };
        },
        setDate(state, { payload : { moment } }){
            return { ...state, startTime:moment[0], endTime:moment[1] };
        },
        getRecord(state, { payload: { list, count }}){
            return { ...state, recordListInfo:{ list, count }, isLoading:false };
        },
        getExecuteType(state, { payload:{ data }}){
            return { ...state, executeType:data };
        },
        getRecordHistory(state, { payload: { data }}){
            return { ...state, recordHistory:data }
        },
        getProgress(state, { payload:{ data }}){
            return { ...state, recordProgress:data };
        },
        setPageNum(state, { payload }){
            return { ...state, pageNum:payload };
        },
        reset(state){
            return initialState;
        },
        resetAlarmExecute(state){
            return { ...state, recordListInfo:{}, isLoading:false, pageNum:1 }
        },
        resetAlarmSetting(state){
            return { ...state, ruleList:[], ruleType:[], ruleMachs:[] };
        },
        resetAlarmTrend(state){
            let date = new Date();
            return { ...state, attrIds:[], alarmTrendInfo:{}, trendTimeType:'1', trendStartDate:moment(date).startOf('month'), trendEndDate:moment(date).endOf('month')  };
        }
    }
}


