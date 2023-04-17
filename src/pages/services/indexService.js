import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';


export function getTodaySumInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/home/index', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTodayWarning(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/home/todaywarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEnergyPercent(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/home/costdistri', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEnergyTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/home/energytrend', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFieldCost(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/home/getfieldcost', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

