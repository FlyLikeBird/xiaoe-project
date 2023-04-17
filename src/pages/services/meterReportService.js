import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';
import config from '../../../config';

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

export function getMeterReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/costreport/checkcodereport', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function exportReport(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://${config.apiHost}/api/costreport/checkcodereportexcel?${str}`;
    return url;
}


export function translateImgToBase64(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcostreport/imgbase64tofile', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

