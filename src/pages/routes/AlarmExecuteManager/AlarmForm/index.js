import React, { useState } from 'react';
import { Tabs, Timeline } from 'antd';
import AlarmTimeline from '../AlarmTimeline';
import style from './AlarmForm.css';

const { TabPane } = Tabs;

function AlarmForm({ data, executeType, recordHistory, recordProgress, onDispatch }){
    console.log(data);
    const [actionInfo, setActionInfo] = useState({ visible:false, actionType:'1'});
    console.log(recordProgress);
    console.log(recordHistory);
    return (
        <div>
            <Tabs defaultActiveKey='1' onChange={activeKey=>{
                if ( activeKey ==='2' ) {
                    onDispatch({ type:'alarm/fetchProgressInfo', payload:data.record_id });
                } else if ( activeKey === '3') {
                    onDispatch({ type:'alarm/fetchRecordHistory', payload:data.mach_id });
                }
            }}>
                <TabPane key='1' tab='警报信息'>
                    <div className={style['container']}>
                        <div className={style['list']}>
                            <span>告警性质:</span>
                            <span className={style['data']}>{ data.type_name }</span>
                        </div>
                        <div className={style['list']}>
                            <span>标准范围:</span>
                            <span className={style['data']}>{ data.warning_info }</span>
                        </div>
                        <div className={style['list']}>
                            <span>实际值:</span>
                            <span className={style['data']}>{ data.warning_value }</span>
                        </div>
                        <div className={style['list']}>
                            <span>告警原因:</span>
                            <span className={style['data']}>{ data.rule_name }</span>
                        </div>
                    </div>
                    
                </TabPane>
                <TabPane key='2' tab='服务进度'>
                    <div>
                        <div>服务人员: { data.executor_name }</div>
                        <div>联系电话:12393933</div>
                    </div>
                    <Timeline mode='left'>
                        
                        <Timeline.Item label={data.first_warning_time}>
                            <div className={style['progress-container']}>
                                <div className={style['progress-title']}>开始处理...</div>
                            </div>
                        </Timeline.Item>
                        {
                            recordProgress && recordProgress.length
                            ?
                            recordProgress.map((item,index)=>(
                                <Timeline.Item label={item.log_date}>
                                    <div className={style['progress-container']}>
                                        <div className={style['progress-title']}>{ item.log_type_name }</div>
                                        <div className={style['progress-content']}>
                                            <div>{ item.log_desc }</div>
                                            {
                                                item.photo.length 
                                                ?
                                                <div className={style['img-container']}>
                                                    {
                                                        item.photo.map(img=>(
                                                            <div className={style['img-wrapper']} style={{ backgroundImage:`url(${img})`}}></div>
                                                        ))
                                                    }                                                    
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))
                            :
                            null
                        }
                    </Timeline>
                </TabPane>
                <TabPane key='3' tab='警报日志'>
                    <Timeline mode='left'>
                        {
                            recordProgress && recordProgress.length
                            ?
                            recordProgress.map((item,index)=>(
                                <Timeline.Item label={item.log_date}>
                                    <div className={style['progress-container']}>
                                        <div className={style['progress-title']}>{ item.log_type_name }</div>
                                        <div className={style['progress-content']}>
                                            <div>{ item.log_desc }</div>
                                            {
                                                item.photo.length 
                                                ?
                                                <div className={style['img-container']}>
                                                    {
                                                        item.photo.map(img=>(
                                                            <div className={style['img-wrapper']} style={{ backgroundImage:`url(${img})`}}></div>
                                                        ))
                                                    }                                                    
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))
                            :
                            null
                        }
                    </Timeline>
                </TabPane>
            </Tabs>
            {
                actionInfo.visible 
                ?
                <AlarmTimeline 
                    data={data} 
                    executeType={executeType}
                    actionType={actionInfo.actionType}
                    onClose={()=>setActionInfo({ visible:false, actionType:''})}
                    onDispatch={action=>onDispatch(action)}
                />
                :
                null
            }
            {
                !actionInfo.visible
                ?
                <div className={style['item-container']}>
                    {
                        +data.status === 4 || +data.status === 3
                        ?
                        null
                        :
                        <div className={style['item-wrapper']} onClick={()=>{
                            setActionInfo({ visible:true, actionType:'1'})
                        }}><div className={style['item']} style={{ backgroundColor:'#ffc000'}}>挂起</div></div>
                    }
                    {
                        +data.status === 3
                        ?
                        null
                        :
                        <div className={style['item-wrapper']} onClick={()=>{
                            setActionInfo({ visible:true, actionType:'2'})
    
                        }}><div className={style['item']} style={{ backgroundColor:'#4287f8'}}>添加进度</div></div>
                    }
                    {
                        +data.status === 3 
                        ?
                        null
                        :
                        <div className={style['item-wrapper']} onClick={()=>{
                            setActionInfo({ visible:true, actionType:'3'})
    
                        }}><div className={style['item']} style={{ backgroundColor:'#00b050'}}>结单</div></div>
                    }
                    
                    
                </div>
                :
                null
            }
            
        </div>
        
    )
}

export default AlarmForm;