import { getReportInfo, getDeviceList, getMachList, getMachRunEff, getMachRefer, setMachRefer, addDevice, copyDevice, deleteDevice, getBaseSaveSpace, getMeterSaveSpace, getAdjustSaveSpace, getRankAndGrade, getEleHealth, getSaveSpaceText } from '../services/analyzeMachService';
import moment from 'moment';

let date = new Date();
const initialState = {
    machInfoList:[],
    deviceList:[],
    // 功率值是一个小时的累加平均值
    runEffInfo:{},
    machEffLoading:true,
    // startDate:moment(date.getDate(),'DD').subtract(1,'months'),
    // endDate:moment(date.getDate(),'DD'),
    currentDate:moment(date.getDate(),'DD'),
    currentMach:{},
    machList:[], 
    // 节省空间
    baseSaveSpace:{},
    meterSaveSpace:{},
    adjustSaveSpace:{},
    // 运行报告
    reportInfo:{},
    rankAndGrade:{},
    eleHealth:{}
};

export default {
    namespace:'analyze',
    state:initialState,
    effects:{
        *fetchMachList(action, { select, call, put}){
            try {
                let { global:{ company_id }, fields :{ currentAttr }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                // console.log(currentAttr);               
                let { data } = yield call(getMachList, { company_id, attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({type:'getMachResult', payload:{ data:data.data }});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchDeviceList(action, { call, put}){
            try {
                let { data } = yield call(getDeviceList);
                if ( data && data.code === '0'){
                    yield put({ type:'getDeviceList', payload:{ data:data.data}});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachRunEff(action, { call, put, select }){
            try {
                let { mach } = action.payload || {}; 
                if ( !mach ){
                    yield put.resolve({ type:'fetchMachList'});
                }
                let { global:{ company_id, startDate, endDate }, analyze : { currentMach }} = yield select();
                yield put({ type:'toggleMachEffLoading'});
                let time = startDate.format('YYYY-MM-DD');
                let { data } = yield call(getMachRunEff, { company_id, begin_date:time, end_date:time, mach_id:currentMach.mach_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachRunEff', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);   
            }
        },
        *setMachRunEff(action, { call, put, select }){
            try {
                let { global:{ company_id }, analyze:{ currentMach }} = yield select(); 
                let { off_power, empty_power, over_power } = action.payload.values;
                let { data } = yield call(setMachRefer, { company_id, mach_id:currentMach.mach_id, off_power, empty_power, over_power } );
                if ( data && data.code === '0'){
                    yield put({type:'fetchMachRunEff'});
                }   
            } catch(err){
                console.log(err);
            }
        },
        *fetchDevice(action, { call, put}){
            try {
                let { data } = yield call(getDeviceList);
                if ( data && data.code === '0'){
                    yield put ({type:'getDeviceList', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *addDevice(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { resolve, reject } = action.payload;
                let { data } = yield call(addDevice, { company_id, ...action.payload.values });
                if ( data && data.code === '0'){
                    yield put({type:'fetchDevice'});
                    if (resolve) resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *copyDevice(action, { call, put, select}){
            try {
                let { global:{ company_id }, analyze:{ currentMach }} = yield select();
                let { data } = yield call(copyDevice, { company_id, mach_id:currentMach.mach_id, device_id:action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'fetchMachRunEff'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteDevice(action, { select, call, put}){
            try {
                let { global:{ company_id }} = yield select();
                let { data } = yield call(deleteDevice, { company_id, device_id: action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'fetchDevice'});
                }
            } catch(err){
                console.log(err);
            }
        },
        // 节省空间接口
        *fetchBaseSaveSpace(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { resolve, reject } = action.payload || {};
                let { data } = yield call(getBaseSaveSpace, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'baseSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeterSaveSpace(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { resolve, reject } = action.payload || {};
                let { data } = yield call(getMeterSaveSpace, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'meterSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchAdjustSaveSpace(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { resolve, reject } = action.payload || {};
                let { data } = yield call(getAdjustSaveSpace, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'adjustSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
       
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleMachEffLoading(state){
            return { ...state, machEffLoading:true };
        },
        getMachResult(state, { payload:{ data }}){
            let currentMach = data && data.length ? data[0] : {};
            return { ...state, machList:data, currentMach };
        },
        getDeviceList(state, { payload:{ data }}){
            return { ...state, deviceList:data };
        },
        getMachRunEff(state, { payload:{ data }}){
            let machInfoList = [];
            machInfoList.push({ title:'开机', subInfo:[{ title:'持续时长', unit:'h', value:data.normalTime},{ title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.normalTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            // console.log(JSON.stringify(data));
            machInfoList.push({ title:'关机', subInfo:[{ title:'持续时长', unit:'h', value:data.offTime},{ title:'时间占比', unit:'%', value:data.totalTime ? Math.round(data.offTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'空载', subInfo:[{ title:'持续时长', unit:'h', value:data.emptyTime}, { title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.emptyTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'重载', subInfo:[{ title:'持续时长', unit:'h', value:data.overTime}, { title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.overTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'功率', subInfo:[{ title:'额定功率', unit:'kw', value:+data.rated_power }, { title:'平均功率', unit:'kw', value:+data.avg_power }]})
            return { ...state, runEffInfo:data, machInfoList, machEffLoading:false };
        },
        selectMach(state, { payload:{ data }}){
            return { ...state, currentMach:data }
        },
        setCurrentMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        baseSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月最大需量', value:Math.floor(data.maxDemand), unit:'kw' });
            infoList.push({ text:'需量环比', value:(+data.same).toFixed(1), unit:'%' });
            infoList.push({ text:'需量同比', value:(+data.adjust).toFixed(1), unit:'%' });
            infoList.push({ text:'需量节能潜力', value:Math.floor(data.save_space), unit:'kw' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, baseSaveSpace:data };
        },
        meterSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月有功用量', value:Math.floor(data.energy), unit:'kwh' });
            infoList.push({ text:'尖时段用量', value:Math.floor(data.tip), unit:'kwh' });
            infoList.push({ text:'峰时段用量', value:Math.floor(data.top), unit:'kwh' });
            infoList.push({ text:'平时段用量', value:Math.floor(data.middle), unit:'kwh' });
            infoList.push({ text:'谷时段用量', value:Math.floor(data.bottom), unit:'kwh' });
            infoList.push({ text:'有功用量环比', value:(+data.adjust).toFixed(1), unit:'%' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, meterSaveSpace:data };
        },
        adjustSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月功率因素', value:(+data.factor).toFixed(2), unit:'COSΦ' });
            infoList.push({ text:'功率因素环比', value:(+data.adjust).toFixed(2), unit:'%' });
            infoList.push({ text:'功率因素同比', value:(+data.same).toFixed(2), unit:'%' });
            infoList.push({ text:'无功节能潜力', value:Math.floor(data.useless), unit:'kVarh' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, adjustSaveSpace:data };
        },
        getReportResult(state, { payload:{ data }}){
            console.log(data);
            return { ...state, reportInfo:data }
        },
        getRankResult(state, { payload:{ data }}){
            return { ...state, rankAndGrade:data }
        },
        getHealthResult(state, { payload:{ data }}){
            return { ...state, eleHealth:data }
        },
        reset(state){
            return initialState;
        }
    }
}


