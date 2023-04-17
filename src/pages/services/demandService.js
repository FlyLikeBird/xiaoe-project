import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getDemandInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/demand/index', { 
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
    return request('/demand/getmachs', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAttrsTree(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfieldattrtree', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getDemandAnalyz(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/demand/demandanalyz', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getDemandCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/demand/demandenergy', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getUselessInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/reactivepower/reactivemonitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

// 设备运行效率接口
export function getMachEfficiency(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/machefficiency', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function setMachPower(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/setratedpower', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 线损接口
export function getLineLoss(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/linelose', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 能源三相监控接口
export function getEnergyPhase(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/monitor/energymonitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


