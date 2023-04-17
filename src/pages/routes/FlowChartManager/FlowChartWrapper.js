import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Spin, Skeleton, Tooltip, DatePicker, Button, Select, message } from 'antd';
import { LeftOutlined, RightOutlined, RedoOutlined   } from '@ant-design/icons';
import FlowChart from './FlowChart';
import style from '../IndexPage.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

function FlowChartWrapper({ data, rankInfo, dispatch, energyInfo, chartLoading, mode, theme, forReport }){   
    return (
        <div style={{ width:'100%', height:'100%', position:'relative'}}>
            <div style={{ position:'absolute', fontSize:'1rem', color: theme === 'dark' ? '#fff' : '#000', left:'6px', top:'6px' }}>
                能源流向图
                <span style={{ marginLeft:'10px', color:'#1545ff'}}>能源成本竞争力第{ rankInfo ? rankInfo.rank : '' }位</span>
            </div>
           
            {
                chartLoading
                ?
                <div style={{ position:'absolute', left:'0', top:'0', width:'100%', height:'100%', zIndex:'3', backgroundColor:'rgba(0,0,0,0.4)'}}><Spin size='large' style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)' }}/></div>
                :
                null
            } 
            {
                !data.empty 
                ?
                <FlowChart data={data} dispatch={dispatch} energyInfo={energyInfo} theme={theme} />
                :
                <div className={style['text']} style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}>能流图数据源为空</div>
            }   
            
        </div>
    )       
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.chartLoading !== nextProps.chartLoading || prevProps.rankInfo !== nextProps.rankInfo ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(FlowChartWrapper, areEqual);