import { routerRedux } from 'dva/router';
import { login, userAuth, agentUserAuth, getWeather, getNewThirdAgent, getVCode, registerUser, updateUser } from '../services/globalService';
import { message } from 'antd';
import config from '../../../config';
import { md5 } from '../utils/encryption';
import moment from 'moment';
let date = new Date();
const companyReg =  /\?pid\=0\.\d+&&userId=(\d+)&&companyId=(\d+)/;
const agentReg2 = /e-(.*)/;
// 初始化socket对象，并且添加监听事件
function createWebSocket(url, data, companyId, fromAgent, dispatch){
    let ws = new WebSocket(url);
    // console.log(data);
    ws.onopen = function(){
        if ( data.agent_id && !fromAgent ){
            ws.send(`agent:${data.agent_id}`);
        } else {
            ws.send(`com:${companyId}`);
        }
    };
    // ws.onclose = function(){
    //     console.log('socket close...');
    //     reconnect(url, data, companyId, dispatch);
    // };
    ws.onerror = function(){
        console.log('socket error...');
        reconnect(url, data, companyId, dispatch);
    };
    ws.onmessage = (e)=>{
        if ( dispatch ) {   
            let data = JSON.parse(e.data); 
            // console.log(data);
            if ( data.type === 'company'){
                dispatch({ type:'setMsg', payload:{ data }});
            } else if ( data.type === 'agent'){
                dispatch({ type:'setAgentMsg', payload:{ data }})
            }                       
        }
    }
    return ws;
}
function reconnect(url, data, companyId, dispatch){
    if(reconnect.lock) return;
    reconnect.lock = true;
    setTimeout(()=>{
        createWebSocket(url, data, companyId, dispatch);
        reconnect.lock = false;
    },2000)
}
let socket = null;
let apiHost = '120.25.168.203';     

const initialState = {
    userInfo:{},
    userMenu:[],
    companyList:[],
    currentProject:'',
    // 全局的公司id
    company_id:'',
    currentCompany:{},
    currentMenu:{},
    tabPaneList:[{ title:'监控首页', key:'home', closable:false }],
    activeKey:'',
    // 配置动态路由
    routePath:[],
    routeConfig:{},
    // 全局告警消息
    msg:{},
    agentMsg:{},
    authorized:false,
    newThirdAgent:{},
    //  当前页面的location
    currentPath:'',
    weatherInfo:'',
    // 页面总宽度
    containerWidth:0,
    // 折叠内容区宽度
    contentWidth:0,
    collapsed:false,
    // 终端设备规格 max-width:1440px
    deviceWidth:0,
    startDate:moment(date),
    endDate:moment(date),
    timeType:'1'
};

export default {
    namespace:'global',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen((location)=>{
                let pathname = location.pathname;
                if ( location.pathname === '/login' ) {
                    let str = window.location.host.split('.');
                    let matchResult = agentReg2.exec(str[0]);
                    let temp = matchResult ? matchResult[1] : '';
                    dispatch({ type:'fetchNewThirdAgent', payload:temp });
                    return ;
                }
                if ( location.pathname !== '/login') {
                    new Promise((resolve, reject)=>{
                        dispatch({type:'userAuth', payload: { dispatch, query:location.search, resolve, reject }})
                    })
                    
                }
            })
        }
    },
    effects:{
        *userAuth(action, {call, select, put, all}){ 
            try {
                let { global: { authorized, socket, newThirdAgent, activeKey }} = yield select();
                let { dispatch, query, resolve, reject } = action.payload || {};
                if ( !authorized ){
                    let apiHost = '120.25.168.203';    
                    let matchResult = companyReg.exec(query);
                    let company_id = matchResult ? matchResult[2] : null; 
                    let user_id = matchResult ? matchResult[1] : null;
                    if ( user_id ){
                        localStorage.setItem('user_id', user_id);
                    }
                    let { data } = yield call( matchResult ? agentUserAuth : userAuth, matchResult ? { app_type:100, company_id } : { app_type:100 } );
                    if ( data && data.code === '0' ){
                        if ( !Object.keys(newThirdAgent).length ) {
                            let str = window.location.host.split('.');
                            let matchResult = agentReg2.exec(str[0]);
                            let temp = matchResult ? matchResult[1] : '';
                            yield put({ type:'fetchNewThirdAgent', payload:temp });
                        }
                        company_id = company_id ? company_id : data.data.companys.length ? data.data.companys[0].company_id : null ;
                        let obj ={ data:data.data, company_id };
                        yield put({type:'setUserInfo', payload:obj });
                        yield put({type:'weather'});
                        let currentKey = localStorage.getItem('activeKey') || 'home';
                        yield put({ type:'setActiveKey', payload:{ activeKey:currentKey, tabPaneList: localStorage.getItem('tabPaneList') ? JSON.parse(localStorage.getItem('tabPaneList')) : null }})
                        if ( resolve && typeof resolve === 'function') resolve();
                        // websocket 相关逻辑
                        if ( !WebSocket ) {
                            window.alert('浏览器不支持websocket,推荐使用chrome浏览器');
                            return ;
                        }
                        let config = window.g;
                        socket = createWebSocket(`ws://${config.socketHost}:${config.socketPort}`, data.data, company_id, matchResult ? true : false, dispatch);

                    } else {
                        // 登录状态过期，跳转到登录页重新登录
                        yield put({type:'clearUserInfo'});
                        yield put(routerRedux.push('/login')); 
                    }
                } 
            } catch(err){
                console.log(err);
            }
        },
        *fetchVCode(action, { call, put, select }){
            try{
                yield call(getVCode, { phone:action.payload });
            } catch(err){
                console.log(err);
            }
        },
        *register(action, { call, put, select}){
            try{
                let { values, resolve, reject } = action.payload;
                let { data } = yield call(registerUser, values);
                if ( data && data.code === '0'){
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *updateUser(action, { call, put }){
            let { values, resolve, reject } = action.payload || {};
            let { data } = yield call(updateUser, values);
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve ==='function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *login(action,{ call, put, select }){
            try {
                let { values, resolve, reject } = action.payload;
                if ( localStorage.getItem('user_id')){
                    message.info('已有登录用户，如要登录新用户请先退出再登录')
                    return;
                }
                var { data }  = yield call(login, values );
                if ( data && data.code === '0'){   
                    let { user_id, companys } = data.data;
                    let timestamp = parseInt(new Date().getTime()/1000);
                    //  保存登录的时间戳,用户id,公司id 
                    localStorage.setItem('timestamp', timestamp);
                    localStorage.setItem('phone', values.phone );
                    localStorage.setItem('user_id', user_id);
                    //  登录后跳转到默认页面
                    yield put(routerRedux.push('/'));
                } else {
                    if ( reject && typeof reject === 'function' ) reject( data.msg );
                }
            } catch(err){
                console.log(err);
            }
        },
        *weather(action,{call, put}){
            let { data } = yield call(getWeather);
            if ( data && data.code === '0' ) {
                yield put({type:'getWeather', payload:{data:data.data}});
            }
        },
        *loginOut(action, { call, put }){
            if ( socket && socket.close ){
                socket.close();
                socket = null;
            }
            yield put({type:'clearUserInfo'});
            yield put({ type:'fields/cancelAll'});
            yield put(routerRedux.push('/login'));
        },
        *fetchNewThirdAgent(action, { put, select, call}){
            let { data } = yield call(getNewThirdAgent, { agent_code:action.payload });
            if ( data && data.code === '0'){
                yield put({ type:'getNewThirdAgent', payload:{ data:data.data }});
            } else {

            }
        },
    },
    reducers:{
        setUserInfo(state, { payload:{ data, company_id }}){
            let { menuData, companys } = data;
            let currentCompany = data.companys.filter(i=>i.company_id == company_id)[0];
            let currentMenu = menuData[0];
            let currentKey = localStorage.getItem('activeKey');
            if ( currentKey ) {
                menuData.forEach((item,index)=>{
                    if ( item.child && item.child.length ){
                        if ( item.child.map(i=>i.menu_code).includes(currentKey) ) {
                            currentMenu = item;
                        }
                    }
                })
            } 
            return { ...state, userInfo:data, userMenu:menuData, currentMenu, companyList:companys || [], company_id, currentCompany:currentCompany || {}, authorized:true };
        },
        setRoutePath(state, { payload}){
            let routes = payload.split('/').filter(i=>i);
            let { routeConfig } = state;  
            let currentMenu;
            // currentProject标识当前所在项目，默认进入能源管理项目;
            let currentProject = routes[0] || 'energy';
            if ( payload === '/') {
                currentMenu = routeConfig['global_monitor'];
            }
            if ( payload.includes('/energy')) {
                // 能源管理项目
                if ( payload === '/energy' || payload === '/energy/global_monitor'){
                    //  如果是首页(默认以监控页为首页)
                    currentMenu = routeConfig['global_monitor'];
                }  else if ( payload.includes('/energy/info_manage_menu/manual_input')){
                    // 如果是手工填报页多层级路由 ， 直接定位到手工填报的菜单项
                    currentMenu = routeConfig['manual_input'];
                } else if ( payload.includes('/energy/global_monitor/power_room')) {
                    currentMenu = routeConfig['power_room'];
                } else { 
                    //  根据当前url获取对应的菜单项
                    currentMenu = routeConfig[routes[routes.length-1]] ? routeConfig[routes[routes.length-1]] : {} ;
                    
                }
            } 
            routes.unshift('home');
            routes = routes.map(route=>{
                return routeConfig[route]
            });
            return { ...state, routePath:routes, currentPath:payload, currentMenu, currentProject, deviceWidth:window.innerWidth };
        },
        getWeather(state, { payload :{data}}){
            return { ...state, weatherInfo:data }
        },
        getSocket(state, { payload }){
            return { ...state, socket:payload };
        },
        setMsg(state, { payload : { data } }){
            // 根据count 字段判断是否需要更新告警信息
            if ( state.msg.count !== data.count ){
                return { ...state, msg:data };
            } else {
                return state;
            }
        },
        setAgentMsg(state, { payload:{ data }}){
            return { ...state, agentMsg:data.detail };
        },
        setContentWidth(state, { payload:{ contentWidth, containerWidth } }){
            return { ...state, contentWidth, containerWidth };
        },
        toggleTimeType(state, { payload }){
            let start, end;
            var date = new Date();
            if ( payload === '3'){
                // 切换为年维度
                start = moment(date).startOf('year');
                end = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                start = moment(date).startOf('month');
                end = moment(date).endOf('month');
            } else {
                // 切换为日维度
                start = end = moment(date);
            }
            return { ...state, timeType:payload, startDate:start,  endDate:end };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        toggleCollapsed(state){
            return { ...state, collapsed:!state.collapsed };
        },
        getNewThirdAgent(state, { payload:{ data }}){
            return { ...state, newThirdAgent:data };
        },
        setActiveKey(state, { payload:{ activeKey, tabPaneList }}){
            let currentMenu; 
            localStorage.setItem('activeKey', activeKey);
            state.userMenu.forEach((item,index)=>{
                if ( item.menu_code === activeKey ) {
                    currentMenu = item;
                    return;
                }
                if ( item.child && item.child.length ){
                    if ( item.child.map(i=>i.menu_code).includes(activeKey) ) {
                        currentMenu = item;
                    }
                }
            })
            if ( tabPaneList ){
                // 新增标签页，返回新的tabPaneList
                localStorage.setItem('tabPaneList',JSON.stringify(tabPaneList));
                return { ...state, activeKey, tabPaneList, currentMenu };
            } else {
                // 没有新增标签页，只切换当前标签页
                return { ...state, activeKey, currentMenu };
            }
        },
        clearUserInfo(state){
            localStorage.clear();
            return initialState;
        }
    }
}

function delay(ms){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        },ms)
    })
}
