import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Tag, Input, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, EditOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import BaseCostChart from './components/BaseCostChart';
import BaseCostTable from './components/BaseCostTable';
import style from '../IndexPage.css';


const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function BaseCostManager({ dispatch, global, baseCost }) {
    const { baseCostInfo, startDate, endDate, treeLoading } = baseCost;
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');

    return ( 
        Object.keys(baseCostInfo).length 
        ?
        <div className={style['scroll-container']} style={{ height:'100%' }}>
            <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0' }}>
                <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>按容量计算</span>
                            { baseCostInfo.calc_type === 2 ? <Tag color='blue'>现在</Tag> : null }
                            {
                                +baseCostInfo.demand_amount > +baseCostInfo.kva_amount
                                ?
                                <Tag color='green'>建议</Tag>
                                :
                                null
                            }
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', margin:'10px 0', textAlign:'center' }}>
                            <div>
                                <div className={style['sub-text']}>变压器容量(KVA)</div>
                                <div className={style['data']}>{ baseCostInfo.total_kva ? (+baseCostInfo.total_kva).toFixed(0): '-- --' }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>单价(元/KVA)</div>
                                <div className={style['data']}>{ baseCostInfo.kva_price }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>基本电费(元)</div>
                                <div className={style['data']}>{ baseCostInfo.kva_amount ? (+baseCostInfo.kva_amount).toFixed(0): '-- --' }</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>按需量计算</span>
                            { baseCostInfo.calc_type === 1 ? <Tag color='blue'>现在</Tag> : null }
                            {
                                +baseCostInfo.demand_amount < +baseCostInfo.kva_amount
                                ?
                                <Tag color='green'>建议</Tag>
                                :
                                null
                            }
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', textAlign:'center', margin:'10px 0'}}>
                            <div>
                                <div className={style['sub-text']}>本月最大需量(kw)</div>
                                <div className={style['data']}>{ baseCostInfo.maxDemand ? (+baseCostInfo.maxDemand).toFixed(0) : 0 }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>单价(元/KW)</div>
                                <div className={style['data']}>{ baseCostInfo.demand_price } </div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>基本电费(元)</div>
                                <div className={style['data']}>{ (+baseCostInfo.demand_amount).toFixed(0) }</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'50%', paddingRight:'0' }}>
                <div className={style['card-container']}>
                    <BaseCostChart data={baseCostInfo} />
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'auto', paddingRight:'0', overflow:'unset', paddingBottom:'0' }}>
                <div className={style['card-container']}>
                    <BaseCostTable data={baseCostInfo.detail} />
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
    )
}

export default connect(({ global, baseCost })=>({ global, baseCost }))(BaseCostManager);
