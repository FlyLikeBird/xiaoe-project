import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '../ColumnCollapse';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import style from './attrAlarmManager.css';
import IndexStyle from '../IndexPage.css';
import InfoList from './components/InfoList';
import BarChart from './components/BarChart';
import RealTimeChart from './components/RealTimeChart';

const { TabPane } = Tabs;
const { RangePicker }= DatePicker;

function EleAlarmManager({ dispatch, eleAlarm, fields, global }){
    const { fieldList, currentField, fieldAttrs, currentAttr, treeLoading } = fields;
    const { warningInfo, timeType, beginDate, endDate, realTimeInfo, typeCode, dayTimeType, chartLoading } = eleAlarm;
    const dateRef = useRef();
    const sidebar = (
        <div>
            <Card style={{ padding:'0' }} bodyStyle={{ padding:'0'}} headStyle={{ padding:'0px 0 6px 20px' }} title={
                <div className='card-title' style={{ justifyContent:'flex-start'}}>
                    <div>统计对象</div>
                </div>
            }>                
                <Tabs  tabBarStyle={{ padding:'0 10px'}} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', payload:{ resolve } })
                    }).then(()=>{
                        dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                        dispatch({type:'eleAlarm/fetchRealTimeAlarm'}); 
                    })
                }}>
                    {                       
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}
                                activeKey={currentField.field_id}                        
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        defaultExpandAll={true}
                                        defaultSelectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                            dispatch({type:'eleAlarm/fetchRealTimeAlarm'}); 
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>                                     
            </Card>           
        </div>
    );
    const content = (
        <div>
            {
                Object.keys(warningInfo).length 
                ?
                <div className={style['container']}>
                    {/* 日期控制器 */}
                    <div className={style['select-container']}>
                        <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'20px' }} value={timeType} onChange={e=>{
                            let value = e.target.value;
                            dispatch({ type:'eleAlarm/toggleTimeType', payload:{ timeType:value }});
                            dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                        }}>
                            <Radio.Button value='1'>日</Radio.Button>
                            <Radio.Button value='2'>月</Radio.Button>
                            <Radio.Button value='3'>年</Radio.Button>
                        </Radio.Group>
                        {
                            timeType === '1'
                            ?
                            <div style={{ display:'inline-flex'}}>
                                <div className={IndexStyle['date-picker-button-left']} onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let temp = moment(date).subtract(1,'days');
                                    dispatch({ type:'eleAlarm/setDate', payload:{ beginDate:temp, endDate:temp }});
                                    dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                }}><LeftOutlined /></div>
                                <DatePicker size='small' ref={dateRef} value={beginDate} locale={zhCN} allowClear={false} onChange={value=>{
                                    dispatch({ type:'eleAlarm/setDate', payload:{ beginDate:value, endDate:value }});
                                    dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                    if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                                }} />
                                <div className={IndexStyle['date-picker-button-right']} onClick={()=>{
                                    let todayDate = new Date();
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    if ( date.getDate() >= todayDate.getDate()) {
                                        message.info('请选择合适的日期');
                                        return;
                                    } else {
                                        let temp = moment(date).add(1,'days');
                                        dispatch({ type:'eleAlarm/setDate', payload:{ beginDate:temp, endDate:temp }});
                                        dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                    }
                                }}><RightOutlined /></div>
                            </div>
                            :
                            <div style={{ display:'inline-flex'}}>
                                <div className={IndexStyle['date-picker-button-left']} onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( timeType === '2'){
                                        start = moment(date).subtract(1,'months').startOf('month');
                                        end = moment(date).subtract(1,'months').endOf('month');
                                    } else if ( timeType === '3'){
                                        start = moment(date).subtract(1,'years').startOf('year');
                                        end = moment(date).subtract(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'eleAlarm/setDate', payload:{ beginDate:start, endDate:end }});
                                    dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                }}><LeftOutlined /></div>
                                <RangePicker size='small' ref={dateRef} value={[beginDate, endDate]} picker={ timeType === '2' ? 'date' : timeType === '3' ? 'month' : ''} locale={zhCN} allowClear={false} onChange={momentArr=>{
                                    dispatch({type:'eleAlarm/setDate', payload:{ beginDate:momentArr[0], endDate:momentArr[1]}});
                                    dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                    if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                                }}/>
                                <div className={IndexStyle['date-picker-button-right']} onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( timeType === '2'){
                                        start = moment(date).add(1,'months').startOf('month');
                                        end = moment(date).add(1,'months').endOf('month');
                                    } else if ( timeType === '3'){
                                        start = moment(date).add(1,'years').startOf('year');
                                        end = moment(date).add(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'eleAlarm/setDate', payload:{ beginDate:start, endDate:end }});
                                    dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                                }}><RightOutlined /></div>
                            </div>
                        }
                    </div>
                    {/* 信息列表 */}
                    <InfoList data={warningInfo.typeTmp} typeCode='ele' />
                    <div className={style['card-container-wrapper']}>
                        <div className={style['block-container']}>
                            <BarChart 
                                data={warningInfo} 
                                typeCode='ele' 
                                timeType={timeType} 
                                activeKey={global.activeKey} 
                                beginDate={beginDate}
                                endDate={endDate}
                                currentField={currentField}
                                currentAttr={currentAttr}
                            />
                            </div>
                    </div>
                    {
                        chartLoading
                        ?
                        <Skeleton className={style['skeleton']} active />
                        :
                        <div className={style['card-container-wrapper']}>
                            <div className={style['block-container']}>
                                <RealTimeChart
                                    data={realTimeInfo} 
                                    dispatch={dispatch} 
                                    typeCode={typeCode}
                                    dayTimeType={dayTimeType}
                                    activeKey={global.activeKey}
                                    currentField={currentField}
                                    currentAttr={currentAttr}
                                />
                            </div>
                        </div>
                    }
                </div>
                :
                <Skeleton className={style['skeleton']} active />
            }   
        </div>
    );
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/fetchField', payload:{ resolve, reject }})
        })
        .then(()=>{
            new Promise((resolve,reject)=>{
                dispatch({type:'fields/fetchFieldAttrs', payload:{ resolve, reject }});
            })
            .then(attrs=>{
                dispatch({ type:'eleAlarm/fetchAttrAlarm' });
                dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});
            })
        });
        return ()=>{
            dispatch({ type:'eleAlarm/reset'})
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} activeKey='ele_alarm' />
    )
};

export default React.memo(connect(({ fields, eleAlarm, global })=>({ fields, eleAlarm, global }))(EleAlarmManager));