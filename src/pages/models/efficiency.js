import { getEnergyFlow, getRank, getFields, getOutputCompare, getEnergyCostInfo, getOutputRatio, getAttrOutput, getRegionOutput } from '../services/efficiencyService';
import moment from 'moment';

const date = new Date();
const initialDate = {
    year:date.getFullYear(),
    month:date.getMonth() + 1,
    day:date.getDate()
};

const initialState = {
    energyInfo:{ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' },
    energyList:[],
    // 能流图数据
    chartInfo:{},
    // 能流图维度切换
    currentField:{},
    rankInfo:{},
    fieldList:[],
    ratioInfo:[],
    outputInfo:[],
    costChart:{},
    allCostChart:{},
    attrData:[],
    regionData:[],
    loaded:false,
    maskVisible:false,
    chartLoading:true,
    ...initialDate
};

export default {
    namespace:'efficiency',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *fetchFlowInit(action, { select, call, put, all }){
            try{
                let { global:{ company_id }} = yield select();
                let [rankData, fieldData] = yield all([
                    put.resolve({ type:'fetchRank'}),
                    put.resolve({ type:'fetchFlowChart'})
                ]);
            } catch(err){
                console.log(err);
            }
        },
        *fetchRank(action, { select, call, put }){
            let { global:{ company_id }} = yield select();
            let { data } = yield call(getRank, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getRank', payload:{ data:data.data }});
            }
        },
        *fetchFlowChart(action, { select, call, put, all }){
            yield put.resolve({ type:'cancelFlowChart'});
            yield put.resolve({ type:'cancelable', task:fetchFlowChartCancelable, action:'cancelFlowChart' });
            function* fetchFlowChartCancelable(){
                try {
                    let { global:{ company_id, startDate, endDate }, fields:{ currentAttr, energyInfo }, efficiency:{ chartInfo } } = yield select();
                    // yield put({ type:'toggleChartLoading', payload:true });
                    let { clickNode } = action.payload || {};
                    let finalAttr = clickNode || currentAttr;
                    // console.log(clickNode);
                    let { data } = yield call(getEnergyFlow, { company_id, attr_id:finalAttr.key, type_id:energyInfo.type_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        if ( data.data.children && data.data.children.length && data.data.cost ) {
                            yield put({ type:'getChart', payload:{ data:data.data, parentChart:chartInfo, clickNode }});
                        } else {
                            if ( clickNode ){
                                message.info('没有下一级节点');
                            } else {
                                yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                            }
                        }
                    } else {
                        yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchAttrRatio(action, { call, put, select, all }){
            let { user:{ company_id }, efficiency : { energyInfo, year, month, day }} = yield select();
            let { resolve, reject } = action.payload ? action.payload : {};
            let [attrMonthData, attrDayData, attrHourData] = yield all([
                call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:2, year, month, day }),
                call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:3, year, month, day }),
                call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:4, year, month, day }),
            ]);
            if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                yield put({type:'getAttrRatio', payload:obj});
                if ( resolve && typeof resolve === 'function') resolve();
            }
        },
        *fetchRegionRatio(action, { select, call, put}){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getRegionOutput, { company_id });
            if ( data && data.code === '0'){
                yield put({type:'getRegionRatio', payload:{ data:data.data }});
            }
        },
    },
    reducers:{
        toggleLoaded(state){
            return { ...state, loaded:true };
        },
        toggleChartLoading(state, { payload }){
            return { ...state, chartLoading:payload };
        },
        getRank(state, { payload:{ data }}){
            return { ...state, rankInfo:data }
        },
        getChart(state, { payload: { data, parentChart, clickNode }}){
            let temp = data;
            if ( clickNode ){
                addNewNode(parentChart, clickNode, data);
                temp = { ...parentChart };
            }
            // console.log(data);
            console.log(temp);
            
            return { ...state, chartInfo:temp, chartLoading:false };
        },
        getCost(state, { payload : { data }}){
            return { ...state, costChart:data, allCostChart:data };
        },
        getType(state, { payload : { data } }){
            data.unshift({ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' });
            return { ...state, energyList:data, energyInfo: data.length && data[0] };
        },
        setDate(state, { payload : { year, month, day } }){
            return { ...state, year:year ? year : state.year, month : month ? month : state.month, day : day ? day : state.day  };
        },
        toggleMaskVisible(state, { payload }){
            return { ...state, maskVisible:payload }
        },
        
        reset(state){
            return initialState;
        }
    }
}


function addNewNode(node, checkNode, newNode, deep = 0){
    let isExist = { value:false };
    checkIsExist(node, checkNode, isExist);
    // console.log(node.attr_name + ':' + isExist.value);
    if ( deep !== 0 && isExist.value ) {
        // 点击节点的所有祖先节点都保留children
        if ( deep === checkNode.depth ){
            node.children = newNode.children;
            return ;
        } 
    } else {
        // 点击节点祖先节点以外的其他节点都清空children
        if ( deep !== 0 ){
            node.children = null;
        }
    } 
    if ( node.children && node.children.length ){
        node.children.forEach((item)=>{
            let temp = deep;
            ++temp;
            addNewNode(item, checkNode, newNode, temp);
        })
        
    }
}

function checkIsExist(tree, checkNode, isExist){
    if ( tree.attr_name === checkNode.title ) {
        isExist.value = true;
        return ;
    }
    if ( tree.children && tree.children.length ){
        tree.children.map(item=>{
            checkIsExist(item, checkNode, isExist);
        })
    }
}


