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
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'100%'}}>
                <div className={style['inline-item-container-wrapper']} style={{ height:'50%', paddingRight:'0' }}>
                    <div className={style['inline-item-container']} style={{ display:'block', backgroundColor:'#fff' }}>
                        {/* 日期筛选和返回button */}
                        <div style={{ position:'absolute', right:'0', top:'0', zIndex:'10'}}>
                            <div style={{ display:'inline-flex'}}>
                                <div className={IndexStyle['date-picker-button-left']} onClick={()=>{
                                    let nowDate = new Date(date.format('YYYY-MM-DD'));
                                    let temp = moment(nowDate).subtract(1,'months'); 
                                    dispatch({ type:'terminalMach/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:temp }});
                                    setDate(temp);
                                }}><LeftOutlined /></div>
                                <DatePicker size='small' ref={inputRef} picker='month' locale={zhCN} allowClear={false} value={date} onChange={value=>{
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
                                        let temp = moment(nowDate).add(1,'months');
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
                                    <span style={{ ...styleObj, verticalAlign:'top' }}>{ machDetail.branch || '-- --' }</span>
                                </div>
                                <div>
                                    <span className={style['sub-text']} style={{ color:'rgb(152 154 156)', verticalAlign:'top' }}>区域:</span>
                                    <span style={{ ...styleObj, verticalAlign:'top' }}>{ machDetail.region || '-- --'}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ height:'30%', display:'flex', justifyContent:'space-around', alignItems:'center', backgroundColor:'#699ff4', borderRadius:'6px', color:'#fff' }}>
                            <div>
                                <span className={style['sub-text']} style={{ color:'#cbddfc' }}>电池状态:</span>
                                <span style={{ marginLeft:'4px', fontWeight:'bold' }}>{ machDetail.view.battery === 0 ? '低电量' : '正常' }</span>
                            </div>
                            <div>
                                <span className={style['sub-text']} style={{ color:'#cbddfc' }}>闸门状态:</span>
                                <span style={{ marginLeft:'4px', fontWeight:'bold' }}>{ machDetail.view.tap === 0 ? '无' : machDetail.view.tap === 1 ? '开' : machDetail.view.tap === 2 ? '关' : '半开' }</span>
                            </div>                                                         
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-container-wrapper']} style={{ width:'100%', height:'50%', paddingRight:'0', paddingBottom:'0' }}>
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
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'66.6%', height:'100%' }}>
                <div className={style['inline-item-container']}>
                    <ReactEcharts 
                        notMerge={true}
                        style={{ width:'100%', height:'100%'}}
                        option={{
                            tooltip:{
                                trigger:'axis'
                            },
                            title:{
                                text:`用水量(m³)`,
                                textStyle:{
                                    fontSize:14
                                },
                                left:20,
                                top:10
                            },
                            legend:{
                                data:['用水量'],
                                top:10,
                                left:'right'
                            },
                            grid:{
                                left:20,
                                right:20,
                                top:60,
                                bottom:20,
                                containLabel:true
                            },
                            xAxis:{
                                type:'category',
                                axisTick:{ show:false },
                                axisLine:{
                                    lineStyle:{
                                        color:'#e8e8e8'
                                    }
                                },
                                axisLabel:{
                                    color:'#676767'
                                },
                                data:machDetail.view.date
                            },
                            yAxis:{
                                type:'value',
                                axisLine:{ show:false },
                                axisTick:{ show:false },
                                splitLine:{
                                    lineStyle:{
                                        color:'#e8e8e8'
                                    }
                                },
                                
                            },
                            series:[{
                                type:'line',
                                data:machDetail.view.value,
                                symbol:'none',
                                smooth:true,
                                itemStyle:{
                                    color:'#3a7adf'
                                },
                                name:'用水量',
                                areaStyle:{
                                    color:{
                                        type:'linear',
                                        x:0,
                                        y:0,
                                        x2:0,
                                        y2:1,
                                        colorStops: [{
                                            offset: 0, color:'rgba(91, 150, 243, 0.2)' // 0% 处的颜色
                                        }, {
                                            offset: 0.8, color: 'transparent' // 100% 处的颜色
                                        }]
                                    }
                                } 
                            }]
                        }}
                    />
                </div>
            </div>        
        </div>         
        :
        <Spin size='large' className={style['spin']} />
    )
}

export default MachDetail;