import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Button, DatePicker, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import BarChart from './components/BarChart';
import AttrCostChart from './components/AttrCostChart';
import PieChart from './components/PieChart';
import InfoList from './components/InfoList';
import style from '../IndexPage.css';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

function EleCostManager({ dispatch, eleCost, fields, global }){
    let { costInfo, chartInfo, costAnalysis, attrCost, chartLoading, showType, timeType, currentDate, warningList, warningLoading } = eleCost;
    let { energyList, energyInfo } = fields;
    let temp = currentDate.format('YYYY-MM-DD').split('-');
    const inputRef = useRef();
    useEffect(()=>{
        // console.log('ele-cost mounted');
        dispatch({ type:'eleCost/fetchInit', payload:{ energyType:'ele' }});
        return ()=>{
            dispatch({ type:'eleCost/reset'});
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
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'20%', paddingRight:'0' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                        <div className={style['card-container']} style={{ padding:'1rem 0 1rem 1rem' }}>
                            <InfoList data={costInfo} energyInfo={energyInfo} showType={showType} />
                        </div>
                    </div>
                    {/* 今日告警 */}
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0', paddingRight:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']} style={{ justifyContent:'flex-start' }}>
                                <span>今日告警</span>
                                <span style={{ marginLeft:'20px' }}>总告警数:{ warningList.length } </span>
                            </div>
                            <div className={style['card-content']}>
                                {
                                    warningLoading
                                    ?
                                    <Skeleton className={style['skeleton']} active />
                                    :
                                    <div className={style['scroll-container']} style={{ color:'#8a8a8a', padding:'10px 20px', height:'100%', overflowX:'hidden', overflowY:'auto', backgroundColor:'#f7f7f7' }}>
                                        {
                                            warningList.length 
                                            ?
                                            warningList.map((item,index)=>(
                                                <div key={index}>
                                                    <span>{ item.rule_name  + '--' }</span>
                                                    <span>{ item.mach_name }</span>
                                                    {/* <span>{ item.warning_value + item.warning_info }</span> */}
                                                </div>
                                            ))
                                            :
                                            <span>今日没有任何告警信息</span>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {/* 成本分布 */}
                <div style={{ height:'40%'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
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
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(costAnalysis).length   
                                ?                         
                                <PieChart data={costAnalysis} showType={showType} />
                                :
                                <Skeleton active className={style['skeleton']} />
                            }
                        </div>
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
            

            
            {/* 
            
                
            {
                attrCost.length 
                ?
                <div className={style['flex-container']} style={{ height:'40%' }}>
                    
                </div>
                :
                <Skeleton className={style['skeleton']} />
            } */}
        </div>
    )
}

export default connect(({ global, fields, eleCost })=>({ global, fields, eleCost }))(EleCostManager);