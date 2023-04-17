import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import EnergyTable from './components/EnergyTable';
import ReportDocument from './components/ReportDocument';
import style from '../IndexPage.css';

const { TabPane } = Tabs;

function CostReportManager({ dispatch, global, costReport, fields }) {
    const { reportInfo, dataType, isLoading } = costReport;
    const { energyList, energyInfo, allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { currentCompany, timeType, startDate, endDate } = global;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject } });
                    })
                    .then(()=>{
                        dispatch({type:'costReport/fetchCostReport'});
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
                                            dispatch({type:'costReport/fetchCostReport'});
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
                                                            dispatch({type:'costReport/fetchCostReport'}); 
                                                        }}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem'}}>
                                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                                            {/* <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                                            }} >设置维度</Button></div> */}
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
                <div style={{ height:'40px', display:'flex'}}>
                    <Radio.Group size='small' buttonStyle='solid' className={style['custom-radio']} style={{ marginRight:'20px' }} value={dataType} onChange={e=>{
                        dispatch({ type:'costReport/toggleDataType', payload:e.target.value });
                        dispatch({ type:'costReport/fetchCostReport'});
                    }}>
                        <Radio.Button value='1'>成本</Radio.Button>
                        <Radio.Button value='2'>能耗</Radio.Button>
                    </Radio.Group>
                    <CustomDatePicker onDispatch={()=>{
                        dispatch({ type:'costReport/fetchCostReport'});
                    }} />
               
                </div>
                <div style={{ height:'calc( 100% - 40px)'}}>
                    <div className={style['card-container']}>                      
                        <EnergyTable
                            data={reportInfo}
                            dataType={dataType}
                            companyName={currentCompany.company_name}
                            timeType={timeType}
                            dispatch={dispatch}
                            pagesize={10}
                            energyInfo={energyInfo}
                        />
                    </div>
                </div>
            </div>
            :
            <Skeleton className={style['skeleton']} />   
    );
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }})
        })
        .then(()=>{
            dispatch({ type:'costReport/fetchCostReport'});
        })
        return ()=>{
            dispatch({ type:'costReport/cancelAll'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});

        }
    },[])
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ global, costReport, fields})=>({ global, costReport, fields }))(CostReportManager);
