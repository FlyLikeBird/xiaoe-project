import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Input, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, EditOutlined, CheckCircleOutlined, ExclamationCircleOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import AdjustCostChart from './components/AdjustCostChart';
import BaseCostTable from './components/BaseCostTable';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function AdjustCostManager({ dispatch, global, baseCost }) {
    const { adjustCostInfo, treeLoading } = baseCost;
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');
    return (  
        Object.keys(adjustCostInfo).length
        ?
        <div className={style['scroll-container']} style={{ height:'100%'}}>
            
            <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0'}}>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>无功罚款</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', margin:'10px 0', textAlign:'center' }}>
                            <div>
                                <div className={style['sub-text']}>年累计(元)</div>
                                <div className={style['data']}>{ adjustCostInfo.totalAdjustCost }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>最大值(元)</div>
                                <div className={style['data']}>{ adjustCostInfo.maxAdjustCost }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>每月平均(元)</div>
                                <div className={style['data']}>{ adjustCostInfo.avgAdjustCost }</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>功率因素</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-around', textAlign:'center', margin:'10px 0'}}>
                            <div>
                                <div className={style['sub-text']}>功率因素考核值</div>
                                <div className={style['data']}>{ adjustCostInfo.factorRef }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>平均功率因素</div>
                                <div className={style['data']}>{ adjustCostInfo.avgFactor }</div>
                            </div>
                            <div>
                                <div className={style['sub-text']}>低于考核值次数</div>
                                <div className={style['data']}>{ adjustCostInfo.unqualified } 次</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <span>提示信息</span>
                        </div>
                        <div style={{ textAlign:'center', margin:'10px 0'}}>
                            {
                                !adjustCostInfo.totalAdjustCost 
                                ?
                                <span>-- --</span>
                                :
                                +(adjustCostInfo.totalAdjustCost) < 0 
                                ?
                                <span style={{ color:'#69d633', fontSize:'1.2rem', fontWeight:'bold'}}><CheckCircleOutlined style={{ marginRight:'4px'}}/>当前使用状态良好，请继续保持</span> 
                                :
                                <span style={{ color:'#09c1fd', fontSize:'1.2rem', fontWeight:'bold'}}><ExclamationCircleOutlined style={{ marginRight:'4px' }} />当前罚款较多，可以通过合理的无功补偿，可以提高功率因素，避免罚款</span>                           
                            }
                           
                        </div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'50%'}}>
                <div className={style['card-container']}>
                    <AdjustCostChart data={adjustCostInfo.view}  />
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'auto', paddingBottom:'0', paddingRight:'0', overflow:'unset' }}>
                <div className={style['card-container']}>
                    <BaseCostTable data={adjustCostInfo.detail} forAdjust={true} />
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
    );
}

export default connect(({ global, baseCost })=>({ global, baseCost }))(AdjustCostManager);
