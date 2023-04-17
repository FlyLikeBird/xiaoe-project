import { getCostReport, getCostAnalyze, getEnergyType, getDocumentInfo, getAnalyzeReport, getCompanyFeeRate, exportReport, translateImgToBase64, createDocument, fetchImg } from '../services/costReportService';
import { flattern, getDeep } from '../utils/array';
import moment from 'moment';
let date = new Date();
const initialState = {
    // 计费报表--1:年周期   2:月周期  3:日周期
    // 成本透视 
    analyzeTimeType:'2',
    analyzeStartTime:moment(1,'DD'),
    analyzeEndTime:moment(date).endOf('month'),
    // 切换成本/能耗
    dataType:'1',
    isDeep:false,
    reportInfo:{},
    analyzeInfo:[],
    chartInfo:{},
    checkedKeys:[],
    isLoading:true,
    // 1:同比  2:环比
    curRatio:'1',
    // 生成报告相关数据
    documentInfo:{},
    feeRate:{},
    // 运行报告数据
    analyzeReport:{}
};

export default {
    namespace:'costReport',
    state:initialState,
    effects:{
        *fetchCostReport(action, { call, put, select}){
            let { global:{ company_id, timeType, startDate, endDate }, fields:{ energyInfo, currentAttr }, costReport:{ dataType, isDeep } } = yield select();
            yield put({type:'toggleLoading'});
            let time = timeType === '1' ? '3' : timeType === '3' ? '1' : '2';
            let { data } = yield call(getCostReport, { data_type:dataType, company_id, time_type:time, type_id:energyInfo.type_id, attr_id:currentAttr.key, is_show_detail:isDeep ? '1' : '0', begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') })
            if ( data && data.code === '0'){
                yield put({type:'get', payload:{ data:data.data }});
            }
        },
        *fetchCostAnalyze(action, { call, put, select }){
            let { global:{ company_id, timeType, startDate, endDate }, fields:{ energyInfo }, costReport:{ checkedKeys } } = yield select();
            timeType = timeType === '1' ? '3' : timeType === '3' ? '1' : '2';
            let { data } = yield call(getCostAnalyze, { company_id, time_type:timeType, type_id:energyInfo.type_id, attr_ids:checkedKeys, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') })
            if ( data && data.code === '0'){
                yield put({type:'getAnalyze', payload:{ data:data.data }});
            }
        },
        *fetchDocument(action, { call, put, select, all}){
            let { global:{ company_id, currentCompany }, fields : { currentAttr }} = yield select();
            let { tip_price, high_price, middle_price, bottom_price, year, month } = action.payload.data;
            let [ documentData, bgData ] = yield all([
                call(getDocumentInfo, { company_id, attr_id:currentAttr.key, tip_price, high_price, middle_price, bottom_price, year, month }),
                call(fetchImg, { path:currentCompany.logo_path })
            ]);
            if ( documentData && documentData.data.code === '0' && bgData ) {
                yield put({type:'getDocument', payload: { data:documentData.data.data, bgData }});
                if ( action.payload.resolve ) action.payload.resolve();
            }
        },
        *translateImg(action, { call, put, all}){
            let { resolve } = action.payload;
            let { data } = yield call(translateImgToBase64, { base64_img:action.payload.data });
            if ( data && data.code ==='0') {
                if ( resolve && typeof resolve === 'function') resolve(data.data);
            }
        },
        *fetchFeeRate(action, { select, call, put}){
            let { resolve, reject } = action.payload;
            let { global:{ company_id }} = yield select();
            let { data } = yield call(getCompanyFeeRate, { company_id });
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve === 'function' ) resolve(data.data);
            } else {
                if ( reject && typeof reject === 'function' ) reject(data.msg);
            }
        },
        *createDocument(action, { call, put}){
            let  { htmlStr, resolve, reject }  = action.payload;
            let finalStr = '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">'
                            + '<body>'
                            + '<div>'
                            + htmlStr
                            + '</div>'
                            + '</body></html>';
            // console.log(htmlStr);  
            let { data } = yield call(createDocument, { content:finalStr });
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve === 'function') resolve();
                window.location.href = data.data;
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
        },
        *export(action, { call, select }){
            let { global:{ company_id }, fields:{ currentAttr }, costReport:{ dataType, timeType, energyInfo, startTime, endTime } } = yield select();
            let begin_time = startTime.format('YYYY-MM-DD');
            let end_time = endTime.format('YYYY-MM-DD');
            let url = yield call(exportReport, { company_id, time_type:timeType, type_id:energyInfo.type_id, data_type:dataType, attr_id:currentAttr.key, begin_time, end_time });
            window.location.href = url;
        },
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        toggleDataType(state, { payload }){
            return { ...state, dataType:payload };
        },
        get(state, { payload : { data }}){
            return { ...state, reportInfo:data, isLoading:false };
        },
        getEnergyType(state, { payload:{ data }}){
            data.unshift({ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' });
            return { ...state, energyList:data };
        },
        getDocument(state, { payload : { data, bgData }}){
            data['bgData'] = bgData;
            return { ...state, documentInfo:data };
        },
        getAnalyze(state, { payload: { data }}){
            let analyzeInfo = [];
            analyzeInfo.push({text:'本期成本', unit:'元', data:Math.floor(data.analyze.current) });
            analyzeInfo.push({text:'同期成本', unit:'元', data:Math.floor(data.analyze.link)});
            analyzeInfo.push({text:'同比增长率', unit:'%', data:(+data.analyze.same_period).toFixed(1)});
            analyzeInfo.push({text:'环比增长率', unit:'%', data:(+data.analyze.link_period).toFixed(1)});
            return { ...state, chartInfo:data, analyzeInfo, chartLoading:false };
        },
        getAnalyzeReportResult(state, { payload:{ data }}){
            return { ...state, analyzeReport:data };
        },
        toggleTimeType(state, { payload }){
            let startTime, endTime;
            var date = new Date();
            if ( payload === '1'){
                // 切换为年维度
                startTime = moment(1,'MM');
                endTime = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                startTime = moment(1,'DD');
                endTime = moment(date).endOf('month');
            } else {
                // 切换为日维度
                startTime = moment(date.getDate(),'DD');
                endTime = moment(date.getDate(),'DD');
            }
            return { ...state, timeType:payload, startTime, endTime };
        },
        toggleAnalyzeTimeType(state, { payload }){
            let startTime, endTime;
            var date = new Date();
            if ( payload === '1'){
                // 切换为年维度
                startTime = moment(1,'MM');
                endTime = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                startTime = moment(1,'DD');
                endTime = moment(date).endOf('month');
            } else {
                // 切换为日维度
                startTime = moment(date.getDate(),'DD');
                endTime = moment(date.getDate(),'DD');
            }
            return { ...state, analyzeTimeType:payload, analyzeStartTime:startTime, analyzeEndTime:endTime };
        },
        toggleEnergyType(state, { payload }){
            let energyInfo = state.energyList.filter(i=>i.type_id === payload )[0];
            return { ...state, energyInfo };
        },
        changeStartEndTime(state, { payload }){
            let { startTime, endTime } = payload;
            return { ...state, startTime, endTime };
        },
        changeAnalyzeTime(state, { payload }){
            let { analyzeStartTime, analyzeEndTime } = payload;
            return { ...state, analyzeStartTime, analyzeEndTime };
        },
        select(state, { payload }){
            return { ...state, checkedKeys:payload };
        },
        setDeep(state, { payload }){
            return { ...state, isDeep:payload };
        },
        toggleRatio(state, { payload }){
            return { ...state, curRatio:payload };
        },
        reset(state){
            return initialState;
        },
        resetCostReport(state){
            let date = new Date();
            return { ...state, dataType:'1', timeType:'3', startTime:moment(date.getDate(),'DD'), endTime:moment(date.getDate(),'DD'), energyInfo:{ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' }, reportInfo:{}, documentInfo:{}, feeRate:{} };
        },
        resetCostAnalyze(state){
            let date = new Date();
            return { ...state, chartInfo:{}, analyzeInfo:[], checkedKeys:[], analyzeTimeType:'2', analyzeStartTime:moment(1,'DD'), analyzeEndTime:moment(date).endOf('month') };
        }
    }
}

