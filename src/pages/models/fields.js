import { getFields, deleteField, editField, getFieldType, addField, getFieldAttrs, addFieldAttr, deleteFieldAttr, editFieldAttr, getAttrDevice, getAllDevice, addAttrDevice, deleteAttrDevice } from '../services/fieldsService';

const initialState = {
    // 当前公司的维度列表
    fieldType:[],
    //  当前维度
    currentField:{},
    //  当前维度属性
    currentAttr:{},
    allFields:{},
    energyList:[
        { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'},
        { type_name:'水', type_code:'water', type_id:'2', unit:'m³'},
        { type_name:'气', type_code:'gas', type_id:'3', unit:'m³' },
        { type_name:'热', type_code:'hot', type_id:'4', unit:'GJ' }
    ],
    energyInfo:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' },
    expandedKeys:[],
    // 添加维度模态弹窗visible
    addModal:false,
    //  维度分组的visible
    setModal:false,
    //  维度属性的visible
    attrModal:false,
    //  判断是否是根属性节点
    isRootAttr:false,
    // 添加子级属性
    forSub:false,
    //  编辑属性
    editAttr:false,
    isLoading:false,
    //  属性树加载状态
    treeLoading:false
};

export default {
    namespace:'fields',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelField'});
            yield put({ type:'cancelFieldAttrs'} );
            yield put({ type:'reset'});
        },
        *init(action, { call, put, select }){
            let { needsUpdate, resolve, reject } = action.payload || {};
            yield put.resolve({ type:'fetchField', payload:{ needsUpdate }});
            yield put.resolve({ type:'fetchFieldAttrs', payload:{ needsUpdate }});
            if ( resolve && typeof resolve === 'function' ) {
                // 切换能源类型时，将更新后的当前节点状态传递给promise;
                let { fields:{ currentAttr }} = yield select();
                if ( resolve && typeof resolve === 'function' ) resolve(currentAttr);
            }
        },
        *fetchFieldType(action, { call, put}){
            let { data } = yield call(getFieldType);
            if ( data&& data.code ==0){
                yield put({type:'getFieldType', payload:{data:data.data}});
            }
        },
        *fetchField(action, { call, put, select}){
            yield put.resolve({ type:'cancelField'});
            yield put.resolve({ type:'cancelable', task:fetchFieldCancelable, action:'cancelField' });
            function* fetchFieldCancelable(){
                try {
                    let { global:{ company_id }, fields:{ energyInfo, allFields }} = yield select();
                    let { resolve, reject, needsUpdate } = action.payload || {};
                    console.log(energyInfo);
                    //  初始化维度列表
                    // needsUpdate字段是维度源数据变化时强制更新, 否则从缓存中读取维度属性和属性树状态不变
                    if ( !allFields[energyInfo.type_code] || needsUpdate ) {                 
                        yield put({type:'toggleLoading'}); 
                        let { data } = yield call(getFields, { company_id, energy_type:energyInfo.type_id });
                        if ( data && data.code == 0 ){
                            yield put({type:'getFields', payload:{ data:data.data, energyInfo }}); 
                            //  默认以第一个维度为当前维度
                            if ( resolve && typeof resolve === 'function') resolve();
                        } 
                    } else {
                        yield put({ type:'updateField'});
                    } 
                } catch(err){
                    console.log(err);
                }
            } 
        },     
        *fetchFieldAttrs(action, { call, put, select}){
            yield put.resolve({ type:'cancelFieldAttrs'});
            yield put.resolve({ type:'cancelable', task:fetchFieldAttrsCancelable, action:'cancelFieldAttrs' });
            function* fetchFieldAttrsCancelable(){
                try {
                    // console.log('a');
                    // resolve 用于定额管理 确保先获取fieldAttrs的异步控制
                    let { needsUpdate, resolve, reject, passField } = action;
                    let { fields: { currentField, allFields, energyInfo } } = yield select();
                    // 如果维度列表为空
                    let finalField = passField || currentField;
                    if ( !finalField.field_id ) {
                        if ( resolve && typeof resolve === 'function' ) resolve();
                        return ;
                    }
                    
                    if ( needsUpdate || !(allFields[energyInfo.type_code] && allFields[energyInfo.type_code]['fieldAttrs'] && allFields[energyInfo.type_code]['fieldAttrs'][finalField.field_name] )) {
                        yield put({type:'toggleTreeLoading'});
                        let { data } = yield call(getFieldAttrs, { field_id : finalField.field_id });           
                        if ( data && data.code == 0 ){
                            //  以维度属性树的第一个节点为当前属性节点 
                            yield put({type:'getFieldAttrs', payload:{ data:data.data, energyInfo, finalField }});         
                            // 如果是维度管理传递来的field，要同时更新fieldDevice里的selectedAttr;
                            if ( passField ) {
                                let { list } = data.data;
                                yield put({ type:'fieldDevice/toggleAttr', payload:list && list.length ? list[0] : {}});
                            }
                            if ( resolve ) resolve(data.data.list);
                        } else {
                            if ( reject ) reject(data.msg);
                        }
                    } else {
                        // 如果某个维度属性树已经存在，则当前节点更新为树的根节点
                        let fieldAttrs = allFields[energyInfo.type_code]['fieldAttrs'][finalField.field_name];
                        let attr = fieldAttrs && fieldAttrs.length ? fieldAttrs[0] : {}; 
                        let result = [];
                        yield put({ type:'toggleAttr', payload:attr });
                        getExpendKeys( fieldAttrs && fieldAttrs.length ? fieldAttrs : [], result);
                        yield put({ type:'setExpandedKeys', payload:result });
                        if ( passField ) {
                            yield put({ type:'fieldDevice/toggleAttr', payload:attr });
                        }
                        if ( resolve && typeof resolve === 'function') resolve(fieldAttrs);
                    } 

                } catch(err){
                    console.log(err);
                } 
            }           
        },
        *add(action, { call, put, select }){
            let { field_name, field_type } = action.payload || {}; 
            let { global:{ company_id }} = yield select();          
            let { data } = yield call(addField, { field_name, field_type, company_id });
            if ( data && data.code ==0 ) {
                yield put({type:'fetchField', payload:{}});
            }
        },
        *edit(action, { call, put, select }){
            let { field_name, field_id, field_type } = action.payload || {};
            let { global :{ company_id }} = yield select();
            let { data } = yield call(editField, { field_id, company_id, field_name, field_type });
            if ( data && data.code == 0 ){
                yield put({type:'fetchField', payload:{}});
            }
        },
        *delete(action, { call, put, select }){
            let { payload } = action;
            let { data } = yield call(deleteField,{field_id:payload});
            if (data && data.code ==0){
                yield put({type:'fetchField', payload:{}});
            }
        },
        *addAttr(action, { call, put, select }){
            let { field_attr } = action.payload || {};
            let { fields : { currentField, currentAttr, forSub } } = yield select();
            let parent_id;
            if (forSub){
                //  添加下级
                parent_id = currentAttr.key;
            } else {
                //  添加同级
                parent_id = currentAttr.parent_id;
            }
            let { data } = yield call(addFieldAttr, { attr_name:field_attr, field_id:currentField.field_id, parent_id});            
            if ( data && data.code == 0 ){               
                yield put({type:'fetchFieldAttrs', needFetchDevice:true });
                
            }
        },
        *editAttr(action, { call, put, select }){
            let { payload } = action;
            let { fields:{ currentField, currentAttr }} = yield select();
            let { data } = yield call(editFieldAttr, { attr_name:payload.field_attr, attr_id:currentAttr.key, field_id:currentField.field_id})
            if ( data && data.code == 0){
                yield put({type:'fetchFieldAttrs', needFetchDevice:true });
            }
        },
        *deleteAttr(action, { call, put, select }){
            let { fields: { currentAttr }} = yield select();
            let { data } = yield call(deleteFieldAttr, { attr_id:currentAttr.key});
            if ( data && data.code == 0 ){
                yield put({type:'fetchFieldAttrs', needFetchDevice:true });
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleTreeLoading(state){
            return { ...state, treeLoading:true }
        },
        getFields(state, { payload:{ data, energyInfo }} ){
            let { fields } = data;
            let allFields = state.allFields;
            allFields[energyInfo.type_code] = {
                fieldList:fields
            }  
            return { ...state, currentField:fields && fields.length ? fields[0] : {}, allFields, currentAttr:fields.length ? state.currentAttr : {}, isLoading:false };
        },
        updateField(state){
            let temp = state.allFields[state.energyInfo.type_code];
            let currentField = temp.fieldList && temp.fieldList.length ? temp.fieldList[0] : {};
            let currentAttr = temp.fieldAttrs && temp.fieldAttrs[currentField.field_name] ? temp.fieldAttrs[currentField.field_name][0] : {};
            // 当维度为空时，维度相关的属性树也为空
            let result = [];
            getExpendKeys( temp.fieldAttrs && temp.fieldAttrs[currentField.field_name] ? temp.fieldAttrs[currentField.field_name] : [], result); 
            return { ...state, currentField, currentAttr:Object.keys(currentField).length ? currentAttr : {}, expandedKeys:result };
        },
        getFieldType(state, { payload:{data} }){
            let { types } = data;
            return { ...state, fieldType:types };
        },
        getFieldAttrs(state, { payload:{ data, finalField, energyInfo }}){
            let { list } = data;
            let temp = state.allFields;
          
            temp[energyInfo.type_code] = { 
                fieldList:temp[energyInfo.type_code].fieldList, 
                fieldAttrs:temp[energyInfo.type_code].fieldAttrs ? { ...temp[energyInfo.type_code].fieldAttrs, [finalField.field_name]:list } : {[finalField.field_name]:list }
            };
            let result = [];
            getExpendKeys(list, result);            
            return { ...state, currentAttr:list && list.length ? list[0] : {}, allFields:temp, expandedKeys:result, attrModal:false, treeLoading:false };
        },
        toggleAddModal(state, { payload }){
            return { ...state, addModal:payload };
        },
        toggleField(state, { payload }){
            let { visible, field } = payload;
            return { ...state, setModal:visible, currentField:field };
        },
        toggleAttr(state, { payload }){
            let { parent_id } = payload;
            return { ...state, currentAttr:payload, isRootAttr:Boolean(parent_id) ? false : true };
        },
        toggleEnergyInfo(state, { payload }){
            return { ...state, energyInfo:payload };
        },
        setExpandedKeys(state, { payload }){
            return { ...state, expandedKeys:payload };
        },
        toggleAttrModal(state, { payload }){
            let { visible, forSub, editAttr } = payload;
            return { ...state, attrModal:visible, forSub, editAttr };
        },
        reset(){
            return { ...initialState, currentField:{}, currentAttr:{}, allFields:{}, expandedKeys:[] };
        }
    }
}

function getExpendKeys(data, result){
    data.forEach(item=>{
        if ( item.children && item.children.length ){
            result.push(item.key);
            getExpendKeys(item.children, result);
        }
    })
}
