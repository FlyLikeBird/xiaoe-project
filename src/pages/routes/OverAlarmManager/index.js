import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '../ColumnCollapse';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import style from '../EleAlarmManager/attrAlarmManager.css';
import IndexStyle from '../IndexPage.css';
import InfoList from '../EleAlarmManager/components/InfoList';
import BarChart from '../EleAlarmManager/components/BarChart';
import RankBarChart from '../LinkAlarmManager/components/RankBarChart';

const { TabPane } = Tabs;
const { RangePicker }= DatePicker;

function OverAlarmManager({ dispatch, overAlarm, fields, global }){
    const { fieldList, currentField, fieldAttrs, currentAttr, treeLoading } = fields;
    const { warningInfo, regionAlarmInfo, timeType, beginDate, endDate, chartLoading } = overAlarm;
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
                    new Promise((resolve, reject)=>{
                        dispatch({type:'fields/fetchFieldAttrs', payload:{ resolve, reject } })
                    }).then(()=>{
                        dispatch({type:'overAlarm/fetchAllAlarm'}); 
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
                                            dispatch({type:'overAlarm/fetchAllAlarm'}); 
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
                            dispatch({ type:'overAlarm/toggleTimeType', payload:{ timeType:value }});
                            dispatch({ type:'overAlarm/fetchAllAlarm'});
                            
                        }}>
                            <Radio.Button value='1'>日</Radio.Button>
                            <Radio.Button value='2'>月</Radio.Button>
                            <Radio.Button value='3'>年</Radio.Button>
                        </Radio.Group>
                        {
                            timeType === '1'
                            ?
                            <div style={{ display:'inline-flex'}}>
                                <div className={IndexStyle['date-picker-button-left']}  onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let temp = moment(date).subtract(1,'days');
                                    dispatch({ type:'overAlarm/setDate', payload:{ beginDate:temp, endDate:temp }});
                                    dispatch({ type:'overAlarm/fetchAllAlarm'});
                                }}><LeftOutlined /></div>
                                <DatePicker size='small' ref={dateRef} value={beginDate} locale={zhCN} allowClear={false} onChange={value=>{
                                    dispatch({ type:'overAlarm/setDate', payload:{ beginDate:value, endDate:value }});
                                    dispatch({ type:'overAlarm/fetchAllAlarm'});
                                    if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                                }} />
                                <div className={IndexStyle['date-picker-button-right']}  onClick={()=>{
                                    let todayDate = new Date();
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    if ( date.getDate() >= todayDate.getDate()) {
                                        message.info('请选择合适的日期');
                                        return;
                                    } else {
                                        let temp = moment(date).add(1,'days');
                                        dispatch({ type:'overAlarm/setDate', payload:{ beginDate:temp, endDate:temp }});
                                        dispatch({ type:'overAlarm/fetchAllAlarm'});
                                    }
                                }}><RightOutlined /></div>
                            </div>
                            :
                            <div style={{ display:'inline-flex'}}>
                                <div className={IndexStyle['date-picker-button-left']}  onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( timeType === '2'){
                                        start = moment(date).subtract(1,'months').startOf('month');
                                        end = moment(date).subtract(1,'months').endOf('month');
                                    } else if ( timeType === '3'){
                                        start = moment(date).subtract(1,'years').startOf('year');
                                        end = moment(date).subtract(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'overAlarm/setDate', payload:{ beginDate:start, endDate:end }});
                                    dispatch({ type:'overAlarm/fetchAllAlarm'});
                                }}><LeftOutlined /></div>
                                <RangePicker size='small' ref={dateRef} value={[beginDate, endDate]} picker={ timeType === '2' ? 'date' : timeType === '3' ? 'month' : ''} locale={zhCN} allowClear={false} onChange={momentArr=>{
                                    dispatch({type:'overAlarm/setDate', payload:{ beginDate:momentArr[0], endDate:momentArr[1]}});
                                    dispatch({ type:'overAlarm/fetchAllAlarm'});
                                    if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                                }}/>
                                <div className={IndexStyle['date-picker-button-right']}  onClick={()=>{
                                    let date = new Date(beginDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( timeType === '2'){
                                        start = moment(date).add(1,'months').startOf('month');
                                        end = moment(date).add(1,'months').endOf('month');
                                    } else if ( timeType === '3'){
                                        start = moment(date).add(1,'years').startOf('year');
                                        end = moment(date).add(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'overAlarm/setDate', payload:{ beginDate:start, endDate:end }});
                                    dispatch({ type:'overAlarm/fetchAllAlarm'});
                                }}><RightOutlined /></div>
                            </div>
                        }
                    </div>
                    {/* 信息列表 */}
                    <InfoList data={warningInfo.typeTmp} typeCode='over'/>
                    <div className={style['card-container-wrapper']}>
                        <div className={style['block-container']}>
                            <BarChart 
                                data={warningInfo} 
                                timeType={timeType} 
                                typeCode='over' 
                                activeKey={global.activeKey} 
                                forOverAlarm={true} 
                                beginDate={beginDate}
                                endDate={endDate}
                                currentField={currentField}
                                currentAttr={currentAttr}
                            />
                        </div>
                    </div>
                    {
                        Object.keys(regionAlarmInfo).length
                        ?
                        <div className={style['card-container-wrapper']}>
                            <div className={style['block-container']}>
                                <RankBarChart 
                                    data={regionAlarmInfo} 
                                    typeCode='over' 
                                    activeKey={global.activeKey} 
                                    forOverAlarm={true} 
                                    currentField={currentField}
                                    currentAttr={currentAttr}
                                    timeType={timeType}
                                    beginDate={beginDate}
                                    endDate={endDate}
                                /></div>
                        </div>
                        :
                        <Skeleton className={style['skeleton']} active />
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
                dispatch({ type:'overAlarm/fetchAllAlarm' });
            })
        });

        return ()=>{
            dispatch({ type:'overAlarm/reset'});
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} activeKey='over_alarm' />
    )
};

export default React.memo(connect(({ fields, overAlarm, global })=>({ fields, overAlarm, global }))(OverAlarmManager));