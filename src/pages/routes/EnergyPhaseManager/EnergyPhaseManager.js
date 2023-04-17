import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Menu, Button, Modal, Tabs, Select, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined, RightCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import PhaseLineChart from './PhaseLineChart';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { Option } = Select;

const optionTypes = {
    '1':'有功电量',
    '2':'无功电量',
    '3':'有功功率',
    '4':'无功功率',
    '5':'功率因素',
    '6':'最大需量',
    '7':'相电流',
    '8':'相电压',
    '9':'四象限无功电能',
    '10':'线电压'
};
const dayTimeTypes = {
    '1':'小时',
    '2':'30分钟',
    '3':'15分钟',
    // '4':'5分钟',
};

let optionList = [], dayTimeList=[];
for(let i=1;i<=10;i++){
    optionList.push(i+'');
}

for(let i=1;i<5;i++){
    dayTimeList.push({
        text:dayTimeTypes[i],
        value:i+''
    });
}

function EnergyPhaseManager({ dispatch, global, fields, demand }) {
    const { timeType, startDate, endDate, theme } = global;
    const { phaseInfo, phaseValueList, phaseLoading, phaseDayTimeType,  phaseOptionType } = demand ;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const inputRef = useRef();
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }})
        })
        .then(()=>{
            dispatch({type:'demand/fetchEnergyPhase'});                   
        })
        return ()=>{
            dispatch({ type:'demand/reset'});
        }
    },[]);
    const sidebar = (
        <div>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'demand/fetchEnergyPhase'});                   
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
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'demand/fetchEnergyPhase'});
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
        Object.keys(phaseInfo).length 
        ?
        <div>
            <div style={{ height:'40px', display:'flex' }}>
                <Select size='small' className={style['custom-select']} style={{ width:'140px', marginRight:'1rem' }} value={phaseOptionType} onChange={(value)=>{
                    dispatch({type:'demand/setPhaseOptionType', payload:value });
                    dispatch({type:'demand/fetchEnergyPhase'});
                }}>
                    {
                        optionList.map((item)=>(
                            <Option value={item}>{ optionTypes[item] }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'demand/fetchEnergyPhase'});
                }} />
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-title']}>
                    <div>{`能源趋势图--${optionTypes[phaseOptionType]}`}</div>
                    {
                        Object.keys(phaseInfo).length && timeType === '1'
                        ?
                        <Menu style={{ backgroundColor:'transparent', color:theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.65)', height:'2.4rem', lineHeight:'2.4rem', marginLeft:'40px', borderBottom:'none' }} selectedKeys={[phaseDayTimeType]} mode="horizontal" onClick={e=>{
                            dispatch({type:'demand/togglePhaseDayTimeType', payload:e.key});
                            dispatch({type:'demand/fetchEnergyPhase'});
                        }}>
                            {
                                dayTimeList.map(item=>(
                                    <Menu.Item key={item.value}>
                                        { item.text }
                                    </Menu.Item>
                                ))
                            }
                        </Menu>
                        :
                        null
                    }
                </div>
                <div className={style['card-content']}>
                    <div className={style['flex-container']} style={{ height:'14%'}}>
                        {
                            phaseValueList.map((item,index)=>(
                                <div key={index} className={style['flex-item']} style={{ borderRight:index === phaseValueList.length - 1 ? 'none' : theme === 'dark' ? '1px solid #22264b' : '1px solid #f0f0f0'}}>
                                    <div>{ item.text }</div>
                                    <div className={style['data']}>{ `${item.value} ${item.unit}`}</div>
                                </div>
                            ))
                        }
                    </div>
                    <div style={{ height:'86%'}}>
                        {
                            phaseLoading 
                            ?
                            <Skeleton active className={style['skeleton']} />                
                            :
                            <PhaseLineChart data={phaseInfo} optionText={optionTypes[phaseOptionType]} optionUnit={phaseInfo.unit} timeType={timeType} currentAttr={currentAttr} theme={theme} />
                        }
                    </div>
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
        
            
    );
    return (   
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ global, fields, demand })=>({ global, fields, demand }))(EnergyPhaseManager);
