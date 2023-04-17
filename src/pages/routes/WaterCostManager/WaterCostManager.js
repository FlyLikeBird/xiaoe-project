import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Button, DatePicker, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import BarChart from '../EleCostManager/components/BarChart';
import AttrCostChart from '../EleCostManager/components/AttrCostChart';
import PieChart from '../EleCostManager/components/PieChart';
import InfoList from '../EleCostManager/components/InfoList';
import style from '../IndexPage.css';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

function WaterCostManager({ dispatch, eleCost, fields, global }){
    let { costInfo, chartInfo, costAnalysis, attrCost, chartLoading, showType, timeType, currentDate, warningList, warningLoading } = eleCost;
    let { energyList, energyInfo } = fields;
    let temp = currentDate.format('YYYY-MM-DD').split('-');
    const inputRef = useRef();
    useEffect(()=>{
        // console.log('ele-cost mounted');
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'水', type_code:'water', type_id:'2', unit:'m³'}});
        dispatch({ type:'eleCost/fetchInit' });
        return ()=>{
            dispatch({ type:'eleCost/reset'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});
        }
    },[]);
    return (
        <div className={style['page-container']}>
            <div style={{ height:'40px'}}>
                <Radio.Group size='small' className={style['custom-radio']} value={showType} onChange={e=>{
                    dispatch({ type:'eleCost/toggleShowType', payload:e.target.value });
                }}>
                    <Radio.Button key='0' value='0'>成本</Radio.Button>
                    <Radio.Button key='1' value='1'>能耗</Radio.Button>
                </Radio.Group>
                <div style={{ marginLeft:'20px', display:'inline-flex', alignItems:'center' }}>
                    <div className={style['date-picker-button-left']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).subtract(1,'days');
                        dispatch({ type:'eleCost/setDate', payload:date });
                        dispatch({ type:'eleCost/fetchAttrCost'});
                    }}><LeftOutlined /></div>
                    <DatePicker ref={inputRef} className={style['custom-date-picker']} locale={zhCN} allowClear={false} value={currentDate} onChange={value=>{
                        dispatch({ type:'eleCost/setDate', payload:value });
                        dispatch({ type:'eleCost/fetchAttrCost'});
                        if ( inputRef.current && inputRef.current.blur ){
                            inputRef.current.blur();
                        }
                    }}/> 
                    <div className={style['date-picker-button-right']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).add(1,'days');
                        dispatch({ type:'eleCost/setDate', payload:date });
                        dispatch({ type:'eleCost/fetchAttrCost'});
                    }}><RightOutlined /></div>
                </div> 
            </div>
            <div style={{ height:'calc( 100% - 40px )'}}>
                <div style={{ height:'20%', paddingBottom:'1rem' }}>
                    <div className={style['card-container']} style={{ padding:'1rem 0 1rem 1rem' }}>
                        <InfoList data={costInfo} energyInfo={energyInfo} showType={showType} />
                    </div>                    
                </div>
                {/* 成本分布 */}
                <div style={{ height:'40%', paddingBottom:'1rem' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(chartInfo).length
                            ?
                            <BarChart dispatch={dispatch} data={chartInfo} showType={showType} timeType={timeType} />
                            :
                            <Skeleton active className={style['skeleton']} />
                        }
                    </div>            
                </div>
                {/* 成本趋势 */}
                <div style={{ height:'40%'}}>
                    {
                        attrCost.map((attr,index)=>(
                            <div key={attr.key} className={style['card-container-wrapper']} style={{ width:'33.3%', paddingRight:index === attrCost.length - 1 ? '0' : '1rem'}}>
                                <div className={style['card-container']} style={{ overflow:'visible' }}>
                                    <AttrCostChart data={attr} showType={showType} energyInfo={energyInfo} year={temp[0]} month={temp[1]} day={temp[2]} isLoading={chartLoading} />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default connect(({ global, fields, eleCost })=>({ global, fields, eleCost }))(WaterCostManager);