import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Button, Card, Radio, Select, DatePicker, message, TimePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../../../IndexPage.css';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;

function EnergySelector({ dispatch, costReport, forAnalyz }){
    let { timeType, dataType, startTime, endTime } = costReport;
    const dateRef = useRef();
    return (
            <div style={{ display:'flex', alignItems:'center' }}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'20px' }} value={timeType} onChange={e=>{
                    let value = e.target.value;
                    dispatch({ type:'costReport/toggleTimeType', payload:value });
                    if ( forAnalyz ){
                        dispatch({ type:'costReport/fetchCostAnalyze'});
                    } else {
                        dispatch({ type:'costReport/fetchCostReport'});
                    }
                }}>
                    <Radio.Button value='3'>日</Radio.Button>
                    <Radio.Button value='2'>月</Radio.Button>
                    <Radio.Button value='1'>年</Radio.Button>
                </Radio.Group>
                {
                    timeType === '3'
                    ?
                    <div style={{ display:'inline-flex'}}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let temp = moment(date).subtract(1,'days');
                            dispatch({ type:'costReport/setDate', payload:{ startTime:temp, endTime:temp }});
                            if ( forAnalyz ){
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            } else {
                                dispatch({ type:'costReport/fetchCostReport'});
                            }
                        }}><LeftOutlined /></div>
                        <DatePicker size='small' ref={dateRef} value={startTime} locale={zhCN} allowClear={false} onChange={value=>{
                            dispatch({ type:'costReport/setDate', payload:{ startTime:value, endTime:value }});
                            if ( forAnalyz ){
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            } else {
                                dispatch({ type:'costReport/fetchCostReport'});
                            }
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }} />
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let todayDate = new Date();
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            if ( date.getDate() >= todayDate.getDate()) {
                                message.info('请选择合适的日期');
                                return;
                            } else {
                                let temp = moment(date).add(1,'days');
                                dispatch({ type:'costReport/setDate', payload:{ startTime:temp, endTime:temp }});
                                if ( forAnalyz ){
                                    dispatch({ type:'costReport/fetchCostAnalyze'});
                                } else {
                                    dispatch({ type:'costReport/fetchCostReport'});
                                }
                            }
                        }}><RightOutlined /></div>
                    </div>
                    :
                    <div style={{ display:'inline-flex'}}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let start,end;
                            if ( timeType === '2'){
                                start = moment(date).subtract(1,'months').startOf('month');
                                end = moment(date).subtract(1,'months').endOf('month');
                            } else if ( timeType === '1'){
                                start = moment(date).subtract(1,'years').startOf('year');
                                end = moment(date).subtract(1,'years').endOf('year');
                            }
                            dispatch({ type:'costReport/setDate', payload:{ startTime:start, endTime:end }});
                            if ( forAnalyz ){
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            } else {
                                dispatch({ type:'costReport/fetchCostReport'});
                            }
                        }}><LeftOutlined /></div>
                        <RangePicker size='small' ref={dateRef} value={[startTime, endTime]} picker={ timeType === '2' ? 'date' : timeType === '1' ? 'month' : ''} locale={zhCN} allowClear={false} onChange={momentArr=>{
                            dispatch({type:'costReport/setDate', payload:{ startTime:momentArr[0], endTime:momentArr[1]}});
                            if ( forAnalyz ){
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            } else {
                                dispatch({ type:'costReport/fetchCostReport'});
                            }
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }}/>
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let start,end;
                            if ( timeType === '2'){
                                start = moment(date).add(1,'months').startOf('month');
                                end = moment(date).add(1,'months').endOf('month');
                            } else if ( timeType === '1'){
                                start = moment(date).add(1,'years').startOf('year');
                                end = moment(date).add(1,'years').endOf('year');
                            }
                            dispatch({ type:'costReport/setDate', payload:{ startTime:start, endTime:end }});
                            if ( forAnalyz ){
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            } else {
                                dispatch({ type:'costReport/fetchCostReport'});
                            }
                        }}><RightOutlined /></div>
                    </div>
                }
                {
                    forAnalyz
                    ?
                    null
                    :
                    <Radio.Group size='small' style={{ marginLeft:'20px' }} buttonStyle="solid" value={dataType} onChange={e=>{
                        dispatch({type:'costReport/toggleDataType', payload:e.target.value});
                        dispatch({type:'costReport/fetchCostReport'});
                    }}>
                        <Radio.Button value='1'>成本</Radio.Button>
                        <Radio.Button value='2'>能耗</Radio.Button>
                    </Radio.Group>
                }
            </div>
            
            
    )
};

EnergySelector.propTypes = {
};

export default connect(({ costReport})=>({ costReport }))(EnergySelector);