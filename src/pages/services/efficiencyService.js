import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getEnergyFlow(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Eleroommonitor/energyflow', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/getrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFields(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfields', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getOutputRatio(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/getoutputratio', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEnergyCostInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/getoutputinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getOutputCompare(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/energytargetcompare', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAttrOutput(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/getattroutputratio', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRegionOutput(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/getfieldtarget', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 能耗定额相关接口
export function getEfficiencyQuota(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyquota/attrenergydetail', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEfficiencyTree(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyquota/getenergyquotatree', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

