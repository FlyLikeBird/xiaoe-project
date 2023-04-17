import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getAttrWarning(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);

    return request('/Warningmonitor/getattrwarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRealTimeWarning(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Warningmonitor/monitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getLinkAlarmRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Warningmonitor/warningrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachTypeRatio(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Warningmonitor/exceptionratio', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


