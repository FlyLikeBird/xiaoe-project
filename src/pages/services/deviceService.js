import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/getmeterlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAddForm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/getaddmeterform', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEditForm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/geteditmeterform', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/addmeter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/editmeter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/delmeter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}