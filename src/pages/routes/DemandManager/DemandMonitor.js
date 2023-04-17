import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '../ColumnCollapse';
import DemandLineChart from './components/DemandLineChart';
import DemandGauge from './components/DemandGauge';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { TabPane } = Tabs;
function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function DemandMonitor({ dispatch, demand, activeKey, innerActiveKey }) {
    const { energyList, energyInfo, machList, currentMach, demandInfo, referTime } = demand;
    const infoData = demandInfo.info ? demandInfo.info : { };
    
    return ( 
        <div style={{ height:'100%' }}>
            {
                Object.keys(demandInfo).length
                ?  
                <div style={{ height:'26%', paddingBottom:'14px' }}>
                <div className={style['flex-container']}>
                    {/* 当前需量 */}
                    <div className={style['flex-item-wrapper']} >
                        <div className={style['flex-item']} >
                            {/* <div className={style['item-title']} style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:'8%', padding:'0' }}>当前需量</div> */}
                            {
                                demandInfo.info && <DemandGauge data={demandInfo.info} activeKey={activeKey} innerActiveKey={innerActiveKey} />
                            }
                            
                        </div>
                    </div>
                    {/* 今日概况 */}
                    <div className={style['flex-item-wrapper']} >
                        <div className={style['flex-item']} style={{ justifyContent:'center', textAlign:'center' }}>
                            <div className={style['data']}>今日概况</div>
                            <div style={{ display:'flex', justifyContent:'space-around'}}>
                                    <div className={style['sub-item']}>
                                        <div className={style['sub-title']}>本日最小需量</div>
                                        <div className={style['data']} style={{ color:'#1890ff'}}>
                                        {
                                            infoData.today_min && infoData.today_min.demand
                                            ?
                                            Math.floor(infoData.today_min.demand) + 'kw'
                                            :
                                            <span>-- --</span>
                                        }
                                        </div>
                                        <div className={style['tag']}>
                                        {
                                            infoData.today_min && infoData.today_min.record_date
                                            ?
                                            <span>{ format(infoData.today_min.record_date) }</span>
                                            :
                                            null
                                        }  
                                        </div>
                                    </div>
                                    <div className={style['sub-item']}>
                                        <div className={style['sub-title']}>本日最大需量</div>
                                        <div className={style['data']} style={{ color:'#1890ff'}}>
                                        {
                                            infoData.today_max && infoData.today_max.demand
                                            ?
                                            Math.floor(infoData.today_max.demand) + 'kw'
                                            :
                                            <span onClick={()=>alert('lalala')}>-- --</span>
                                        }
                                        </div>
                                        <div className={style['tag']}>
                                        {
                                            infoData.today_max && infoData.today_max.record_date
                                            ?
                                            <span>{ format(infoData.today_max.record_date) }</span>
                                            :
                                            null
                                        }  
                                        </div>
                                    </div>                            
                            </div>
                        </div>
                    </div>
                    {/* 本月概况 */}
                    <div className={style['flex-item-wrapper']} style={{ flex:'2', paddingRight:'0' }}>
                        <div className={style['flex-item']} style={{ justifyContent:'center', textAlign:'center' }}>
                            <div className={style['data']}>本月概况</div>
                            <div style={{ display:'flex', justifyContent:'space-around'}}>
                                <div className={style['sub-item']}>
                                    <div className={style['sub-title']}>本月最大需量</div>
                                    <div className={style['data']} style={{ color:'#1890ff'}}>
                                    {
                                        infoData.month_max_demand 
                                        ?
                                        Math.floor(infoData.month_max_demand) + 'kw'
                                        :
                                        <span onClick={()=>alert('lalala')}>-- --</span>
                                    }
                                    </div>
                                    <div className={style['tag']}>
                                    {
                                        infoData.month_max_demand 
                                        ?
                                        <span>{ format(infoData.month_max_demand_date) }</span>
                                        :
                                        null
                                    } 
                                    </div>
                                </div>
                               
                                <div className={style['sub-item']}>
                                    <div className={style['sub-title']}>参考曲线</div>
                                    <div style={{ display:'flex' }}>
                                        <div className={style['date-picker-button-left']} onClick={()=>{
                                            let date = new Date(referTime.format('YYYY-MM-DD'));
                                            let temp = moment(date).subtract(1,'days');
                                            dispatch({ type:'demand/setDate', payload:temp });
                                            dispatch({ type:'demand/fetchDemand'});
                                        }}><LeftOutlined /></div>
                                        <DatePicker size='small' locale={zhCN} value={referTime} allowClear={false} onChange={moment=>{
                                            dispatch({type:'demand/setDate', payload:moment });
                                            dispatch({type:'demand/fetchDemand'});
                                        }} />
                                        <div className={style['date-picker-button-right']} onClick={()=>{
                                            let todayDate = new Date();
                                            let date = new Date(referTime.format('YYYY-MM-DD'));
                                            if ( date.getDate() >= todayDate.getDate() ) {
                                                message.info('请选择合适的日期');
                                            } else {
                                                let temp = moment(date).add(1,'days');
                                                dispatch({ type:'demand/setDate', payload:temp });
                                                dispatch({ type:'demand/fetchDemand'});
                                            }
                                        }}><RightOutlined /></div>
                                    </div>
                                    <div className={style['tag']} style={{ opacity:'0' }}>8-25 18:52</div>
                                </div>
                                <div className={style['sub-item']}>
                                    <div className={style['sub-title']}>变压器容量</div>
                                    <div className={style['data']} style={{ color:'#1890ff'}}>
                                    {
                                        infoData.kva_value
                                        ?
                                        Math.floor(infoData.kva_value) + 'kva'
                                        :
                                        <span onClick={()=>alert('lalala')}>-- --</span>
                                    }
                                    </div>
                                    <div className={style['tag']} style={{ opacity:'0' }}>8-25 18:52</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                :
                <Skeleton active className={style['skeleton']} />
            }
            {
                Object.keys(demandInfo).length
                ?
                <div style={{ height:'74%' }}>
                    <div className={style['block-container']}><DemandLineChart data={demandInfo} currentMach={currentMach} referTime={referTime} activeKey={activeKey} innerActiveKey={innerActiveKey} /></div>
                </div>     
                :
                <Skeleton active className={style['skeleton']} />
            }        
        </div> 
    );
}

export default DemandMonitor;
