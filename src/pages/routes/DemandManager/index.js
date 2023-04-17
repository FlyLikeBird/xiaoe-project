import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Radio, Tree, message, Spin } from 'antd';
import DemandMonitor from './DemandMonitor';
import DemandAnalyz from './DemandAnalyz';
import ColumnCollapse from '../ColumnCollapse';
import { energyIcons } from '../../utils/energyIcons';

const { TabPane } = Tabs;

function DemandManager({ dispatch, demand, global }){
    const { energyList, energyInfo, machList, currentMach, referTime, treeLoading } = demand;
    const [activeKey, setActiveKey] = useState('1');
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'demand/fetchInit', payload:{ resolve, reject }});
        })
        .then(()=>{
            dispatch({ type:'demand/fetchDemand'});
        })
        return ()=>{
            dispatch({ type:'demand/resetDemand' });
        }
    },[]);
    const sidebar = (
        <div>
            <Card title="能耗类别" className='card-container'>
                <Radio.Group value={energyInfo.type_id} onChange={e=>{
                    let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                    if ( e.target.value === 0 || e.target.value === 1 ){
                        dispatch({type:'demand/toggleEnergyType', payload:e.target.value });
                        dispatch({type:'demand/fetchDemand'});
                    } else {
                        message.info(`还没有接入${currentEnergy.type_name}能源数据`);
                    }
                   
                }}>
                    {
                        energyList.map(item=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ energyIcons[item.type_code]} {item.type_name}</Radio.Button>
                        ))
                    }
                </Radio.Group>                                                        
            </Card>
            <Card title="统计对象" className='card-container' >              
                {
                    treeLoading
                    ?
                    <Spin />
                    :
                    <Tree
                        defaultExpandAll={true}
                        selectedKeys={[currentMach.key]}
                        treeData={machList}
                        onSelect={(selectedKeys, {node})=>{
                            dispatch({type:'demand/selectMach', payload:node });
                            if ( activeKey === '1') {
                                dispatch({ type:'demand/fetchDemand'});
                            }
                            if ( activeKey === '2') {
                                dispatch({ type:'demand/fetchAnalyze'});
                            }
                            
                        }}
                    />
                }                           
            </Card>
        </div>
    );
    const content = (
        <div>
            <Tabs activeKey={activeKey} tabBarStyle={{ paddingLeft:'20px', backgroundColor:'#fff', marginBottom:'0' }} onChange={activeKey=>{
                if ( activeKey === '1' && !Object.keys(demand.demandInfo).length ) {
                    dispatch({ type:'demand/fetchDemand'});
                } 
                if ( activeKey === '2' && !Object.keys(demand.analyzInfo).length ){
                    dispatch({ type:'demand/fetchAnalyze'});
                }
                setActiveKey(activeKey);
            }}>
                <TabPane tab='实时需量' key='1'>
                    <DemandMonitor demand={demand} dispatch={dispatch} activeKey={global.activeKey} innerActiveKey={activeKey} />
                </TabPane>
                <TabPane tab='需量分析' key='2'>
                    <DemandAnalyz demand={demand} dispatch={dispatch} activeKey={global.activeKey} innerActiveKey={activeKey} />
                </TabPane>
            </Tabs>
        </div>
    )
    return (
        <ColumnCollapse sidebar={sidebar} content={content} activeKey='demand_monitor' />
    )
}

export default React.memo(connect(({ demand, global })=>({ demand, global }))(DemandManager));