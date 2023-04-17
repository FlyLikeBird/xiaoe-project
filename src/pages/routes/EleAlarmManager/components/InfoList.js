import React from 'react';
import style from '../attrAlarmManager.css';
import eleIcons from '../../../../../public/ele-alarm-icon.png';
import overIcons from '../../../../../public/over-alarm-icon.png';
import linkIcons from '../../../../../public/link-alarm-icon.png';

const eleIconsMap = {
    '剩余电流':0,
    '温度越限':2,
    '电压超标':3,
    '电流超标':4,
    '相不平衡':5,
    '缺相':6
};
const overIconsMap = {
    '产值比越限':0,
    '人效越限':1,
    '坪效越限':2,
    '台当能效':3,
    '基本电费越限':4,
    '力调电费越限':5,
    '功率因素过低':6,
}

const linkIconsMap = {
    '1':0,
    '2':2,
    '3':1,
    '4':4
}

const linkKeyMap = {
    '1':'电表',
    '2':'水表',
    '3':'气表',
    '4':'传感器'
};

function InfoList({ data, typeCode }){
    let icons = typeCode === 'ele' ? eleIcons : typeCode === 'over' ? overIcons : linkIcons;
    let iconsMap = typeCode === 'ele' ? eleIconsMap : typeCode === 'over' ? overIconsMap : linkIconsMap;

    return (
        <div className={style['flex-container']} style={{ height:'12%', paddingBottom:'1rem' }}>
            {
                Object.keys(data).map(key=>(
                    <div key={key} className={style['flex-item-wrapper']} style={{ height:'100%' }}>
                        <div className={style['flex-item']}>
                            <div style={{ width:'30%'}}>
                                <div className={style['flex-icon']} style={{ 
                                    backgroundImage:`url(${icons})`,
                                    backgroundPosition:`${-iconsMap[key] * 40}px 0px`
                                }}></div>
                            </div>            
                            <div className={style['flex-info']}>
                                <div className={style['data']}>{ data[key] }</div>
                                <div>{ typeCode === 'link' ? linkKeyMap[key] + '通讯异常' : key }</div>
                            </div>
                            <div className={style['mask']}></div>
                        </div>
                    </div>
                ))
            }
        </div>
        
    )
}

export default InfoList;