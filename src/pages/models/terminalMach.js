import { getEleLines, getMachTypes, getMachList, getMachDetail } from '../services/powerRoomService';
import moment from 'moment';

const initialState = {
    monitorInfo:{},
    machTypes:[],
    currentType:{},
    machListInfo:{},
    machData:{},
    machDetail:{},
    total:0,
    currentPage:1,
    machScenes:{},
    machLoading:true
};

export default {
    namespace:'terminalMach',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *init(action, { put } ){
            yield put.resolve({ type:'fetchMachTypes'});
            yield put.resolve({ type:'fetchMachList'});
        },
        *fetchMachTypes(action, { select, call, put}){
            try{
                let { global:{ company_id }} = yield select();
                let { data } = yield call(getMachTypes, { company_id });
                if ( data && data.code === '0') {
                    yield put({ type:'getMachTypes', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachList(action, { call, put, select }){
            try{
                let { terminalMach :{ currentPage, currentType }} = yield select();
                let { keyword, pagesize } = action.payload || {};
                pagesize = pagesize || 16;
                keyword = keyword || '1';
                let { data } = yield call(getMachList, { page:currentPage, pagesize, type:currentType.key, keyword });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachList', payload:{ data:data.data, total:data.count }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachDetail(action, { select, call, put}){
            yield put({ type:'cancelMachDetail'});
            yield put.resolve({ type:'cancelable', task:fetchMachDetailCancelable, action:'cancelMachDetail' });
            function* fetchMachDetailCancelable(params){
                try{
                    let { mach_id, date_time } = action.payload ;                                                     
                    yield put({ type:'toggleMachLoading'});
                    let { data } = yield call(getMachDetail, { mach_id, date_time:date_time.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        yield put({ type:'getMachDetail', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
            
        },
        *fetchEleLines(action, { select, put, call}){
            try{
                let { resolve, reject } = action.payload || {};
                let { data } = yield call(getEleLines);
                if ( data && data.code === '0'){
                    yield put({ type:'getEleLines', payload:{ data:data.data }});
                    // console.log(data.data);
                    if ( resolve && typeof resolve === 'function' ) resolve(data.data);
                }
            } catch(err){   
                console.log(err);
            }
        }
    },
    reducers:{
        toggleMachLoading(state){
            return { ...state, machLoading:true };
        },
        getMachTypes(state, { payload:{ data }}){
            let currentType = data && data.length ? data.filter(i=>i.key === 'all')[0] : {};
            return { ...state, machTypes:data, currentType };
        },
        getMachList(state, { payload:{ data, total }}){
            let infoList = [];
            infoList.push({ key:'1', title:'总设备数', value:data.total_meter });
            infoList.push({ key:'2', title:'在线设备数', value:Math.floor(data.total_meter - data.outline_meter) });
            infoList.push({ key:'3', title:'离线设备数', value:data.outline_meter});
            infoList.push({ key:'4', title:'告警设备数', value:data.warning_count });
            infoList.push({ key:'5', title:'未处理设备数', value:data.warning_unfinish });
            data.infoList = infoList;
            return { ...state, machListInfo:data, total };
        },
        getMachDetail(state, { payload:{ data }}){
            let infoList = [];
            let real_time = data.real_time;   
            
            infoList.push({ title:'电流', value: real_time && real_time.Iavb ? Math.floor(real_time.Iavb) : '-- --', unit:'A'});
            infoList.push({ title:'线电压', value: real_time && real_time.Ullavg ? Math.floor(real_time.Ullavg) : '-- --', unit:'V'});
            infoList.push({ title:'相电压', value: real_time && real_time.Uavg ? Math.floor(real_time.Uavg) : '-- --', unit:'V'});
            infoList.push({ title:'功率因素', value: real_time && real_time.factor ? (+real_time.factor).toFixed(2) : '-- --', unit:'COSΦ'});
            infoList.push({ title:'有功功率', value: real_time && real_time.P ? Math.floor(real_time.P) : '-- --', unit:'kw'});
            // infoList.push({ title:'状态', value:, unit:''})
            infoList.push({ title:'状态', value:data['is_outline'] ? '离线' : '在线' });
            data.infoList = infoList;
            return { ...state, machDetail:data, machLoading:false };
        },
        getMachScenes(state, { payload:{ data }}){
            let temp = {};
            temp.data = data;
            return { ...state, machScenes:temp };
        },
        toggleMachType(state, { payload }){
            return { ...state, currentType:payload };
        },
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        resetPage(state){
            return { ...state, currentPage:1 };
        },
        clearMachDetail(state){
            return { ...state, machDetail:{}};
        },
        reset(state){
            return initialState;
        }

    }
}

