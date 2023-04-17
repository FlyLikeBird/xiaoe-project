import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getEnergyType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getenergytype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTotalCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/gettotalcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}


export function getCurrentCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getcostinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getElectricCostAnalysis(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getmonthcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getTotalCostAnalysis(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/energyquotadata', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getSceneInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getsceneinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
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


export function getAttrCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getattrcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getAttrQuota(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getfieldquota', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEnergyQuota(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/energyquotadata', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getBaseCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/basecost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function setMachKva(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Energycost/setmeterkva', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getAdjustCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/adjustcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getMeasureCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/meteringcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getAnalyzeReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/report', { 
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