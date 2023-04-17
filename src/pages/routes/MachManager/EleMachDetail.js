import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Spin, DatePicker, Button, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import style from './MachManager.css';
import IndexStyle from '../IndexPage.css';
import moment from 'moment';
import LineChart from './LineChart';
import PieChart from './PieChart';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import ReactEcharts from 'echarts-for-react';

function getRandomData(arr){
    let result = [];
    for(var i=0;i<arr.length;i++){
        result.push(Math.random()*100 + 50 );
    }
    return result;
}

const styleObj = {
    display:'inline-block',
    whiteSpace:'nowrap',
    textOverflow:'ellipsis',
    overflow:'hidden',
    fontSize:'0.8rem', 
    color:'#3e8fff', 
    marginLeft:'4px',
};

function MachDetail({ dispatch, machDetail, machLoading, currentMach }){
    const [date, setDate] = useState(moment(new Date()));
    const inputRef = useRef();
    let isPhaseU = machDetail.real_time && +machDetail.real_time.Uavg > 0 ? true : false;
    useEffect(()=>{
        dispatch({ type:'terminalMach/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:date }});
        return ()=>{
            dispatch({ type:'terminalMach/clearMachDetail'});
        } 
    },[])
    return (
        Object.keys(machDetail).length 
        ?
        <div style={{ width:'100%', height:'100%' }}>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']} style={{ display:'block', backgroundColor:'#fff' }}>
                    {/* 日期筛选和返回button */}
                    <div style={{ position:'absolute', right:'0', top:'0', zIndex:'10'}}>
                        <div style={{ display:'inline-flex'}}>
                            <div className={IndexStyle['date-picker-button-left']} onClick={()=>{
                                let nowDate = new Date(date.format('YYYY-MM-DD'));
                                let temp = moment(nowDate).subtract(1,'days'); 
                                dispatch({ type:'terminalMach/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:temp }});
                                setDate(temp);
                            }}><LeftOutlined /></div>
                            <DatePicker size='small' ref={inputRef} locale={zhCN} allowClear={false} value={date} onChange={value=>{
                                dispatch({ type:'terminalMach/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:value }});
                                setDate(value);
                                if(inputRef.current && inputRef.current.blur) inputRef.current.blur();                    
                            }} />
                            <div className={IndexStyle['date-picker-button-right']} onClick={()=>{
                                let todayDate = new Date();
                                let nowDate = new Date(date.format('YYYY-MM-DD'));
                                if ( nowDate.getDate() >= todayDate.getDate() ) {
                                    message.info('请选择合理的日期');
                                    return;
                                } else {
                                    let temp = moment(nowDate).add(1,'days');
                                    dispatch({ type:'terminalMach/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:temp }});
                                    setDate(temp);
                                }
                            }}><RightOutlined /></div>
                        </div>
                    </div>
                    <div style={{ position:'absolute', left:'0', top:'0', fontWeight:'bold', color:'#5d5d5d' }}>
                        <span>{ machDetail.mach ? machDetail.mach.model_desc : '' }</span>
                    </div>
                    <div style={{ height:'70%', display:'flex', alignItems:'center' }}>
                        <img src={machDetail.img_path} style={{ width:'50%'}}/>
                        <div style={{ whiteSpace:'nowrap' }}>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)', verticalAlign:'top' }}>编号:</span>
                                <span style={{ ...styleObj, verticalAlign:'top' }}>{ machDetail.mach ? machDetail.mach.register_code : '' }</span>
                            </div>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)', verticalAlign:'top' }}>支路:</span>
                                <span style={{ ...styleObj, verticalAlign:'top' }}>{ machDetail.branch }</span>
                            </div>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)', verticalAlign:'top' }}>区域:</span>
                                <span style={{ ...styleObj, verticalAlign:'top' }}>{ machDetail.region }</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height:'30%', backgroundColor:'#699ff4', padding:'20px 20px 0 20px', borderRadius:'6px', color:'#fff' }}>
                        {
                            machDetail.infoList && machDetail.infoList.length 
                            ?
                            machDetail.infoList.map((item,index)=>(
                                <div key={index} className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'33.3%', whiteSpace:'nowrap' }}>
                                    <div className={style['inline-item-container']} style={{ backgroundColor:'#699ff4' }}>
                                        <span className={style['sub-text']} style={{ color:'#cbddfc' }}>{ item.title }:</span>
                                        <span style={{ marginLeft:'4px', fontWeight:'bold' }}>{ item.value }{ item.value === '-- --' ? '' : item.unit }</span>
                                    </div>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view.P} title='功率/KW' />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view.I1} y2Data={machDetail.view.I2} y3Data={machDetail.view.I3} title='相电流/A' multi={true} />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']} style={{ justifyContent:'center' }}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <PieChart data={machDetail.warning_info} />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view.U1} y2Data={machDetail.view.U2} y3Data={machDetail.view.U3} title='相电压/V' multi={true} />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view.factor} title='功率因素/cosΦ' />
                    }
                </div>
            </div>
        </div>
        :
        <Spin size='large' className={style['spin']} />
    )
}

export default MachDetail;