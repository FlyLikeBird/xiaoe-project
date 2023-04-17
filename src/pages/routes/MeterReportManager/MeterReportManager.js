import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import MeterReportTable from './MeterReportTable';
import Loading from '@/pages/components/Loading';
const { TabPane } = Tabs;

function MeterReportManager({ dispatch, global, meterReport, fields }) {
    const { reportInfo, isLoading, currentPage, loaded  } = meterReport;
    const { allFields, currentField, currentAttr, energyInfo, energyList, expandedKeys, treeLoading } = fields;
    const { currentCompany, timeType, startDate, endDate } = global;
    const [visible, toggleVisible] = useState(false);
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                new Promise((resolve, reject)=>{
                    dispatch({ type:'fields/init', payload:{ resolve, reject }});
                })
                .then(()=>{
                    dispatch({type:'meterReport/fetchMeterReport'});
                })
            }}>
                {
                    energyList.map((item,index)=>(
                        <TabPane key={item.type_id} tab={item.type_name}>
                            <Tabs  
                                className={style['custom-tabs']}
                                activeKey={currentField.field_id + ''}  
                                type='card'                      
                                onChange={fieldKey=>{
                                    let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                                    new Promise((resolve, reject)=>{
                                        dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                                    }).then(()=>{
                                        dispatch({type:'meterReport/fetchMeterReport'});
                                    })                                
                            }}>
                                {   
                                    fields.isLoading
                                    ?
                                    null
                                    :
                                    fieldList && fieldList.length
                                    ?                    
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
                                                    onSelect={(selectedKeys, { selected, node })=>{
                                                        if(!selected) return;
                                                        dispatch({type:'fields/toggleAttr', payload:node});
                                                        dispatch({type:'meterReport/fetchMeterReport'});
                                                    }}
                                                />
                                            }
                                        </TabPane>
                                    ))
                                    :
                                    <div className={style['text']} style={{ padding:'1rem' }}>
                                        <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                                        
                                    </div>
                                }
                            </Tabs>
                        </TabPane>
                    ))
                }
            </Tabs>  
        </div>
    );
    const content = (
        Object.keys(reportInfo).length
        ?
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'meterReport/fetchMeterReport'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>                
                    <MeterReportTable 
                        data={reportInfo} 
                        dispatch={dispatch} 
                        currentPage={currentPage}
                        isLoading={isLoading}
                        timeType={timeType}
                        energyInfo={energyInfo}
                        startDate={startDate}
                        endDate={endDate}
                        companyName={global.currentCompany.company_name}
                    />                  
                </div>
            </div>
        </div>
        :
        <Skeleton className={style['skeleton']} />   
      
    );
    useEffect(()=>{
        dispatch({ type:'meterReport/fetchInit'});      
        return ()=>{
            dispatch({ type:'meterReport/cancelAll'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});

        }
    },[]);
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ global, meterReport, fields})=>({ global, meterReport, fields }))(MeterReportManager);
