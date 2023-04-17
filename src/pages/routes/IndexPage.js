import React, { useEffect, useMemo, useRef } from 'react';
import { connect } from 'dva';
import dynamic from 'dva/dynamic';
import { Tabs } from 'antd';
import style from './IndexPage.css';
import Header from '../components/Header';
import Menu from '../components/Menu';
import IndexManager from './IndexManager';
import TerminalMach from './MachManager';
import EleCostManager from './EleCostManager';
import WaterCostManager from './WaterCostManager';
import EleMonitorManager from './EleMonitorManager';

import FlowChartManager from './FlowChartManager';
import UselessManager from './UselessManager';

import MeterReportManager from './MeterReportManager';
import CostReportManager from './CostReportManager';
import TimeEnergyReport from './TimeEnergyReport';
import CostAnalyzeManager from './CostAnalyzeManager';
import MachRunEffManager from './MachRunEffManager';
import AlarmTrendManager from './AlarmTrendManager';
import AlarmExecuteManager from './AlarmExecuteManager';
import AlarmSettingManager from './AlarmSettingManager';
import LinkAlarmManager from './LinkAlarmManager';
import EnergyPhaseManager from './EnergyPhaseManager';
import UserSettingManager from './UserSettingManager';
import SystemLogManager from './SystemLogManager';
import BillManager from './BillManager';
// import IndexManager from './IndexManager';
// import Mach1 from './Mach1';
// import Mach2 from './Mach2';
// const componentsMap = {
//     'main_page':<IndexManager/>,
//     'mach1':<Mach1 />,
//     'mach2':<Mach2 />
// };
const { TabPane } = Tabs;

let sidebarWidth = 190;
let componentsMap = {};
function IndexPage({ dispatch, global }) {
    const { tabPaneList, activeKey, authorized, contentWidth } = global;
    const containerRef = useRef();
    useMemo(()=>{
        componentsMap = {
            'home':<IndexManager/>,
            'meter_monitor':<TerminalMach />,
            'ele_cost':<EleCostManager />,
            'water_cost':<WaterCostManager />,
            'water_cost':<WaterCostManager />,
            'cost_report':<CostReportManager />,
            'code_report':<MeterReportManager />,
            'time_report':<TimeEnergyReport />,
            'ele_cost_monitor':<EleMonitorManager />,
            'energy_trend':<FlowChartManager />,
            'useless_power_monitor':<UselessManager />,
            // 'demand_monitor':<DemandManager />,
            'noload':<MachRunEffManager />,
            'ele_energy_monitor':<EnergyPhaseManager />,
            'energy_contrast':<CostAnalyzeManager />,
            'warning_trend':<AlarmTrendManager />,
            'warning_list':<AlarmExecuteManager />,
            'warning_setting':<AlarmSettingManager />,
            // 'ele_alarm':<EleAlarmManager />,
            // 'over_alarm':<OverAlarmManager />,
            'link_alarm':<LinkAlarmManager />,
            'user_setting':<UserSettingManager />,
            'system_log':<SystemLogManager />,
            'fee_setting':<BillManager />,
            // 'meter_setting':<MeterMachManager />
        };
    },[]);
    // console.log('index render')
    useEffect(()=>{
        let container = containerRef.current;
        if ( container ){
            dispatch({ type:'global/setContentWidth', payload:{ contentWidth: containerRef.current.offsetWidth - sidebarWidth, containerWidth:containerRef.current.offsetWidth }});
        }
        return ()=>{
            componentsMap = {};
        }
    },[]);
    return (  
        
        <div className={style['container']} ref={containerRef}>
            <Header />
            <div className={style['main-content']}>
                <div className={style['sidebar-container']} style={{ width:sidebarWidth + 'px' }}><Menu /></div>
                <div className={style['content-container']} style={{ width:`calc( 100% - ${sidebarWidth}px)` }}>
                    <Tabs 
                        type='editable-card'
                        hideAdd
                        className={style['tabs-container']}
                        activeKey={activeKey}
                        onChange={activeKey=>{
                            
                            dispatch({ type:'global/setActiveKey', payload:{ activeKey, tabPaneList:null }})
                        }}
                        onEdit={(targetKey, action)=>{
                            if ( action === 'remove' ){
                                let temp = [], index;
                                for(let i=0;i<tabPaneList.length;i++){
                                    if ( tabPaneList[i].key === targetKey ) {
                                        index = i;
                                    } else {
                                        temp.push(tabPaneList[i]);
                                    }
                                }
                                dispatch({ type:'global/setActiveKey', payload:{ activeKey: targetKey === activeKey ? tabPaneList[index-1].key : activeKey, tabPaneList:temp }})
                            }
                        }}
                    >
                        {
                            tabPaneList.map((tabPane)=>(
                                <TabPane tab={tabPane.title} key={tabPane.key} closable={tabPane.closable} >
                                    { activeKey === tabPane.key && componentsMap[activeKey] }
                                </TabPane>
                            ))
                        }
                    </Tabs>
                </div>   
            </div>
        </div>
         
    );
}

IndexPage.propTypes = {
};

export default connect(({ global })=>({ global }))(IndexPage);
