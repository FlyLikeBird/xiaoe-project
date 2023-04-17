import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '@/pages/routes/IndexPage.css';
import InfoList from '../EleAlarmManager/components/InfoList';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import RankBarChart from './components/RankBarChart';

const { TabPane } = Tabs;

function LinkAlarmManager({ dispatch, linkAlarm, fields, global }){
    let { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let { timeType, startDate, endDate } = global;
    let { warningInfo, machAlarmInfo, machOfflineInfo, chartLoading } = linkAlarm;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const dateRef = useRef();
    const sidebar = (
        <div>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'linkAlarm/fetchAllAlarm'}); 
                    })
                }}>
                    {                       
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}                                                 
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        className={style['custom-tree']}
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}                              
                                        onSelect={(selectedKeys, { selected, node})=>{
                                            if ( !selected ) return;
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'linkAlarm/fetchAllAlarm'}); 
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs> 
        </div>
    );
    const content = (
        
        Object.keys(warningInfo).length 
        ?
        <div>
            {/* 日期控制器 */}
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'linkAlarm/fetchAllAlarm'}); 
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                {/* 信息列表 */}
                <InfoList data={machAlarmInfo} typeCode='link'/>
                <div style={{ height:'44%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'35%' }}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(machAlarmInfo).length
                                ?
                                <PieChart data={machAlarmInfo} timeType={timeType} />
                                :
                                <Skeleton active />
                            }
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'65%', paddingRight:'0' }}>
                        <div className={style['card-container']}>
                            <BarChart 
                                data={warningInfo} 
                                timeType={timeType} 
                                typeCode='link' 

                            />
                        </div>
                    </div>
                </div>
                <div style={{ height:'44%' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(machOfflineInfo).length
                            ?                               
                            <RankBarChart 
                                data={machOfflineInfo} 
                                typeCode='link' 
                            
                            />                              
                            :
                            <Skeleton className={style['skeleton']} active />
                        }
                    </div>
                </div>         
            </div>
        </div>
        :
        <Skeleton className={style['skeleton']} active /> 
    );
    useEffect(()=>{
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' }});
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }})
        })
        .then(()=>{          
            dispatch({ type:'linkAlarm/fetchAllAlarm' });         
        });
        return ()=>{
            dispatch({ type:'linkAlarm/reset'});
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} activeKey='link_alarm' />
    )
};

export default connect(({ fields, linkAlarm, global })=>({ fields, linkAlarm, global }))(LinkAlarmManager);