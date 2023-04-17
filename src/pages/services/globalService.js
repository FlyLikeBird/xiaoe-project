import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { authToken, apiToken } from '../utils/encryption';
import config from '../../../config';

export function userAuth(data = {}){
    let token = authToken();
    data.token = token;
    let str = translateObj(data);
    return request('/login/getuser', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function agentUserAuth(data = {}){
    let token = authToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agent/getcompanymenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function getNewThirdAgent(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/login/checkthirdagent', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getVCode(data = {}){
    let token = authToken();
    data.token = token;
    let str = translateObj(data);
    return fetch('http://api.h1dt.com/xeapi/sms/sendSms', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function registerUser(data = {}){
    let token = authToken();
    data.token = token;
    let str = translateObj(data);
    return request('/login/register', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWeather(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/getweather', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function updateUser(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/updateuserpw', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function login(data = {}){
    let timestamp = parseInt(new Date().getTime()/1000);
    let token = authToken(timestamp);
    data.token = token;
    let str = translateObj(data);
    return request('/login/login', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 通用的导出excel接口
export function createExcel(col, row){
    let config = window.g;
    let token = apiToken();
    let url = `http://${config.apiHost}/api/export/createexcel?col=${JSON.stringify(col)}&row=${JSON.stringify(row)}&token=${token}`;
    window.location.href = url;

}

// 第三方地图geoJson数据的请求接口
export function getGeoJson(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/geojson', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
