import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getDeviceList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/getdevicelist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/getattrmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachRunEff(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/machruninfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/api'); 
}

export function setMachRefer(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/setmachrefer', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachRefer(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/getdeviceform', { 
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
    return request('/analyz/adddevice', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function copyDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/copydevice', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function getAddDeviceForm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/getdeviceform', { 
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
    return request('/analyz/deldevice', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 节省空间接口
export function getBaseSaveSpace(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/basesavespace', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMeterSaveSpace(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/metersavespace', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAdjustSaveSpace(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/adjustsave', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 运行报告相关接口
export function getReportInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/runtimereport', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRankAndGrade(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/diagnosis/evaluate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/eapp'); 
}

export function getEleHealth(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/diagnosis/eleindex', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'/eapp'); 
}

export function getSaveSpaceText(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/diagnosis/savespace', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}










