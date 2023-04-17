import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, Select, message, Skeleton, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '../ColumnCollapse';
import AnalyzLineChart from './components/AnalyzLineChart';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { energyIcons } from '../../utils/energyIcons';

const { Option } = Select;
const { RangePicker } = DatePicker;

function DemandAnalyz({ dispatch, demand, activeKey, innerActiveKey }) {
    const { energyList, energyInfo, machList, currentMach, analyzInfo, demandTimeType, beginTime, endTime, demandLoading } = demand;    
    return (  
        <div style={{ height:'100%'}}>
            <div style={{ position:'absolute', right:'20px', top:'6px'}}>
                <div className='select-container' style={{ margin:'0' }}>
                    <span>下月需量预测</span>
                    {
                        analyzInfo.maxPredDemand 
                        ?
                        <span style={{ fontSize:'1.6rem', color:'#1890ff', fontWeight:'bold', marginLeft:'10px'}}>{ Math.floor(analyzInfo.maxPredDemand) + 'kw' } </span>
                        :
                        <span style={{ fontSize:'1.6rem', color:'#1890ff', marginLeft:'10px'}}>-- --</span>
                    }
                </div>           
            </div>
                <div style={{ height:'26%', paddingBottom:'14px'}}>
                <div className={style['flex-container']} style={{ backgroundColor:'#fff', alignItems:'center', justifyContent:'space-around' }}>
                    <div>
                        <Radio.Group value={demandTimeType} style={{ marginRight:'10px' }} onChange={e=>{
                            dispatch({ type:'demand/toggleDemandTimeType', payload:e.target.value });
                            dispatch({ type:'demand/fetchAnalyze'});
                        }}>
                            <Radio.Button value='1'>日</Radio.Button>
                            <Radio.Button value='2'>月</Radio.Button>
                        </Radio.Group>
                        <div style={{ display:'inline-flex', alignItems:'center' }}>
                            <div className={style['date-picker-button-left']} style={{ height:'32px', lineHeight:'32px' }} onClick={()=>{
                                let date = new Date(beginTime.format('YYYY-MM-DD'));
                                let start,end;
                                if ( demandTimeType === '1') {
                                    end = start = moment(date).subtract(1,'days');
                                } else if ( demandTimeType === '2' ){
                                    start = moment(date).subtract(1,'months').startOf('month');
                                    end = moment(date).subtract(1,'months').endOf('month');
                                }
                                dispatch({ type:'demand/setDemandDate', payload:{ beginTime:start, endTime:end }});
                                dispatch({ type:'demand/fetchAnalyze'});
                            }}><LeftOutlined /></div>
                            {
                                demandTimeType === '1' 
                                ?
                                <DatePicker locale={zhCN} value={beginTime} allowClear={false} onChange={value=>{
                                    dispatch({ type:'demand/setDemandDate', payload:{ beginTime:value, endTime:value }});
                                    dispatch({ type:'demand/fetchAnalyze'});
                                }} />
                                :
                                <RangePicker locale={zhCN} value={[beginTime, endTime]} allowClear={false} onChange={momentArr=>{
                                    dispatch({ type:'setDemandDate', payload:{ beginTime:momentArr[0], endTime:momentArr[1] }});
                                    dispatch({ type:'demand/fetchAnalyze'});
                                }} />
                            }
                            <div className={style['date-picker-button-right']} style={{ height:'32px', lineHeight:'32px' }} onClick={()=>{
                                let date = new Date(beginTime.format('YYYY-MM-DD'));
                                let start,end;
                                if ( demandTimeType === '1') {
                                    end = start = moment(date).add(1,'days');
                                } else if ( demandTimeType === '2' ){
                                    start = moment(date).add(1,'months').startOf('month');
                                    end = moment(date).add(1,'months').endOf('month');
                                }
                                dispatch({ type:'demand/setDemandDate', payload:{ beginTime:start, endTime:end }});
                                dispatch({ type:'demand/fetchAnalyze'});
                            }}><RightOutlined /></div>
                        </div>
                    </div>
                    <div>
                        <div className={style['info-title']}>平均需量</div>
                        <div className={style['data']} style={{ color:'#1890ff'}}>
                            {
                                analyzInfo.avgDemand 
                                ?
                                Math.round(analyzInfo.avgDemand) + 'kw'
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                    </div>
                    <div>
                        <div className={style['info-title']}>最大需量</div>
                        <div className={style['data']} style={{ color:'#1890ff'}}>
                            {
                                analyzInfo.maxDemand && analyzInfo.maxDemand.demand
                                ?
                                Math.round(analyzInfo.maxDemand.demand) + 'kw'
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                        {                               
                            analyzInfo.maxDemand && analyzInfo.maxDemand.record_date 
                            ?
                            <div className={style['time-tag']}>{ analyzInfo.maxDemand.record_date }</div>
                            :
                            null                                    
                        }
                    </div>
                    <div>
                        <div className={style['info-title']}>需量电费效率</div>
                        <div className={style['data']} style={{ color:'#1890ff'}}>
                            {
                                analyzInfo.effRatio 
                                ?
                                (+analyzInfo.effRatio).toFixed(1) + '%'
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                    </div>   
                </div>                
            </div>
           
            {/*  用户需量图表 */}
            {
                !demandLoading
                ?
                <div style={{ height:'74%' }}>
                    <div className={style['block-container']}>
                        <AnalyzLineChart 
                            data={analyzInfo} 
                            activeKey={activeKey} 
                            innerActiveKey={innerActiveKey} 
                            currentMach={currentMach}
                            timeType={demandTimeType}
                            beginTime={beginTime}
                            endTime={endTime}
                        /></div>
                </div>
                :
                <Skeleton active className={style['skeleton']} />
            }
        </div>
    );
}

export default DemandAnalyz;
