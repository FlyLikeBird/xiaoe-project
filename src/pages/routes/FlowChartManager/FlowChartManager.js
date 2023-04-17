import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Select, message } from 'antd';
import FlowChartWrapper from './FlowChartWrapper';
import style from '../IndexPage.css';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
const { Option } = Select;

function FlowChartManager({ dispatch, global, fields, efficiency }){
    const { timeType, startDate, endDate  } = global;
    const { allFields, energyList, energyInfo, currentField, currentAttr } = fields;
    const { chartInfo,  parentNodes, rankInfo, costChart, maskVisible, ratioInfo, outputInfo, attrData, regionData, chartLoading, year, month, day } = efficiency;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }})
        })
        .then(()=>{
            dispatch({ type:'efficiency/fetchFlowInit'});
        })
        return ()=>{
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});
        }
    },[]);
    return (
        <div className={style['page-container']}>
            <div style={{ height:'40px', display:'flex' }}>
                <Radio.Group className={style['custom-radio']} style={{ marginRight:'20px'}} value={energyInfo.type_id} onChange={e=>{
                    let temp = energyList.filter(i=>i.type_id === e.target.value)[0];
                    if ( temp.type_code === 'ele' || temp.type_code === 'water' ) {
                        dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                        dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/init', payload:{ resolve, reject }});
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchFlowChart' });
                            dispatch({ type:'efficiency/cancelFlowInit'});
                        })
                    } else {
                        message.info(`还没有接入${temp.type_name}能源数据`);
                    }                 
                }}>
                    {
                        energyList.map((item)=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ item.type_name }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'efficiency/fetchFlowChart'});
                }} />
                {
                    fieldList && fieldList.length 
                    ?
                    <Select style={{ width:'120px', marginLeft:'20px' }} className={style['custom-select']} value={currentField.field_id} onChange={value=>{
                        if ( chartLoading ) {
                            message.info('能流图还在加载中');
                        }
                        let current = fieldList.filter(i=>i.field_id === value )[0];
                        dispatch({ type:'fields/toggleField', payload:{ field:current } });
                        dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', resolve, reject });
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchFlowChart' });
                        })
                    }}>
                        {
                            fieldList.map((item,index)=>(
                                <Option key={index} value={item.field_id}>{ item.field_name }</Option>
                            ))
                        }
                    </Select>
                    :
                    null
                }      
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)'}}>
                <FlowChartWrapper 
                    data={chartInfo}
                    currentField={currentField}
                    fieldList={fieldList}
                    rankInfo={rankInfo}
                    flowTimeType={timeType}
                    beginDate={startDate}
                    endDate={endDate}
                    energyInfo={energyInfo}
                    chartLoading={chartLoading}
                    dispatch={dispatch}
                    theme='light'
                />
            </div>
        </div>
    )
}

export default connect(({ global, fields, efficiency })=>({ global, fields, efficiency }))(FlowChartManager);
