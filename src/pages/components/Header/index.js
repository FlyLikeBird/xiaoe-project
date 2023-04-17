import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Button, Tag, Popover, Badge } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import style from './Header.css';
import logo from '../../../../public/logo.png';
import avatarImg from '../../../../public/avatar.png';
import { getToday } from '../../utils/parseDate';
import ScrollTable from './ScrollTable';
let timer;
let week = new Date().getDay();
let firstMsg = true;
let alarmTimer = null;

const weekObj = {
    0:'周日',
    1:'周一',
    2:'周二',
    3:'周三',
    4:'周四',
    5:'周五',
    6:'周六',
}

function Header({ dispatch, global }){
    // console.log('header render()...');
    const { userInfo, weatherInfo, msg, newThirdAgent, tabPaneList } = global;
    const [curTime, updateTime] = useState(getToday(2));
    useEffect(()=>{
        timer = setInterval(()=>{
            updateTime(getToday(2));
        },1000);
        return ()=>{
            firstMsg = true;
            clearInterval(timer);
        }
    },[]);
    // console.log(msg);
    // console.log(newThirdAgent);
    return (
        <div className={style['container']}>
            <img src={newThirdAgent.logo_path} style={{ height:'70%' }} />
            <div className={style['title']}>
            AIoT智慧能源云平台
            {/* 设备全生命周期管理云平台 */}
            </div>
            <div style={{ display:'inline-flex', alignItems:'center' }}>
                
                <span>{ curTime + '  '+ `(${weekObj[week]})` }</span>
                <span style={{ margin:'0 10px'}}>{ weatherInfo.city }</span>
                <span>{ weatherInfo.weather }</span>
                <span style={{ margin:'0 10px'}}>|</span>
                <AlertOutlined style={{ marginRight:'6px', fontSize:'1.2rem' }} />
                <Popover content={<ScrollTable data={ msg.detail || []}/>}>
                    <Badge count={msg.count} onClick={()=>{
                        if ( tabPaneList.filter(i=>i.key === 'warning_list' ).length ){
                            dispatch({ type:'global/setActiveKey', payload:{ activeKey:'warning_list', tabPaneList:null }})
                        } else {
                            dispatch({ type:'global/setActiveKey', payload:{ activeKey:'warning_list', tabPaneList:tabPaneList.concat({ key:'warning_list', title:'警报清单', closable:true })}});
                        }
                    }} />
                </Popover>
                <span style={{ margin:'0 10px'}}>|</span>
                <span>{ userInfo.user_name } </span>
                <span className={style['avatar']} onClick={()=>{
                    if ( tabPaneList.filter(i=>i.key === 'user_setting').length ){
                        dispatch({ type:'global/setActiveKey', payload:{ activeKey:'user_setting', tabPaneList:null }});
                    } else {
                        dispatch({ type:'global/setActiveKey', payload:{ activeKey:'user_setting', tabPaneList:tabPaneList.concat({ key:'user_setting', title:'用户设置', closable:true })}});
                    }
                }}><img src={avatarImg} style={{ height:'100%' }} /></span>
                <Tag color='#2db7f5' style={{ cursor:'pointer' }} onClick={()=>dispatch({ type:'global/loginOut'})}>退出</Tag>
            </div>
        </div>
    )
}

export default React.memo(connect(({ global })=>( { global }))(Header));