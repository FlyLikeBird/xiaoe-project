import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

// 告警趋势接口
export function getWarningTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Warningmonitor/warningtrend', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRuleList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRuleType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getruletype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/addrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function updateRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/updaterule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/delrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 安全监控功能模块相关接口
export function getSceneInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getsceneinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTodayInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/gettodayinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningChartInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getwarninginfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRegionChartInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/warningduty', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 获取告警详情数据

export function getWarningList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getwarninganalyze', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningDetail(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getwarningdetail', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 获取告警执行列表数据
export function getRecordList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getrecordlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getExecuteType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getlogtype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRecordDetail(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getrecorddetailinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function confirmRecord(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/operwarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getHistoryLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getmachhistorylog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getProgressLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getrecordlog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function uploadImg(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('token',token);
    return request('/upload/upload', { 
        method:'POST',
        body:formData
        }); 
}

export function setSceneInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/setanalogbg', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function fetchImg(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return requestImg('/index/getImage', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}





