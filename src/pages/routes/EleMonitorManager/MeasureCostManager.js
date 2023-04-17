import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined, RightCircleOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import MeasureBarChart from './components/MeasureBarChart';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const timeInfo = {
    '1':'峰时段',
    '2':'平时段',
    '3':'谷时段',
    '4':'尖时段'
};

const colorInfo = {
    '1':'#f5a623',
    '2':'#efdd07',
    '3':'#7ed321',
    '4':'#fd6e4c'
};

function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function MeasureCostManager({ dispatch, global, baseCost }) {
    const { machList, currentMach, energyList, energyInfo, measureCostInfo, measureInfoList, measureReferList, measureTimeType, measureStartDate, measureEndDate, treeLoading } = baseCost;
    let totalCost = measureCostInfo.base ? measureCostInfo.base.totalCost : 0;
    return ( 
        Object.keys(measureCostInfo).length 
        ?
        <div style={{ height:'100%' }}>
            
            <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0' }}>
                {
                    measureInfoList && measureInfoList.length 
                    ?
                    measureInfoList.map((item,index)=>(
                        <div key={index} className={style['card-container-wrapper']} style={{ width:100/measureInfoList.length + '%', paddingBottom:'0', paddingRight:index === measureInfoList.length - 1 ? '0' : '1rem' }}>
                            <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 20px' }}>
                                <div style={{ display:'flex', justifyContent:'space-between' }}>
                                        <div style={{ fontSize:'1.2rem' }}>{ timeInfo[item.time_type]}</div>
                                        <div className={style['sub-text']}>电价：{ (+item.fee_rate).toFixed(2) } 元</div>
                                </div>
                                <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 0' }}>
                                    <div>
                                        <div className={style['sub-text']}>电费(元)</div>
                                        <div className={style['data']}>{ Math.floor(+item.totalCost) }</div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>电费占比(%)</div>
                                        <div className={style['data']}>
                                            {
                                                measureCostInfo.base.totalCost ? ((item.totalCost / measureCostInfo.base.totalCost)*100).toFixed(1) : 0.00
                                            }
                                            %
                                        </div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>用电量(kwh)</div>
                                        <div className={style['data']}>{ Math.floor(+item.totalEnergy) }</div>
                                    </div>
                                </div>
                            </div>
                        </div>       
                    ))
                    :
                    null
                }        
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'80%', paddingRight:'0', paddingBottom:'0' }}>
                <div className={style['card-container']}>
                    <MeasureBarChart data={measureCostInfo.view} timeType={global.timeType} theme={global.theme} />
                </div>
            </div>

        </div>
        :
        <Skeleton active className={style['skeleton']} /> 
            
    );
}

export default connect(({ global, baseCost})=> ({ global, baseCost}))(MeasureCostManager);
