import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Tabs, Modal, Tag, Select, Spin, Switch, message, Popconfirm, Form, Input, Radio } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import style from '../IndexPage.css';
import EleBilling from './EleBilling';
import WaterBilling from './WaterBilling';
const { Option } = Select;
const { TabPane } = Tabs;



function BillingManager({ dispatch, global, fields, billing }){
    let { companyList, currentCompany } = global;
    let { energyList, energyInfo } = fields;
    let { list, visible, is_actived, rateInfo } = billing;
    
    useEffect(()=>{
        dispatch({ type:'billing/fetchBilling'});
        dispatch({ type:'billing/fetchFeeRate'});
        return ()=>{
            dispatch({ type:'billing/reset'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' }});
        }
    },[]);
    
    
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                }}>
                    {
                        energyList.map((item,index)=>(
                            <TabPane key={item.type_id} tab={item.type_name}>
                                {
                                    item.type_code === 'ele' 
                                    ?
                                    <EleBilling dispatch={dispatch} billing={billing} />
                                    :
                                    item.type_code === 'water'
                                    ?
                                    <WaterBilling dispatch={dispatch} billing={billing} />
                                    :
                                    null
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        </div> 
    )
};

BillingManager.propTypes = {
};

export default connect( ({ global, fields, billing }) => ({ global, fields, billing }))(BillingManager);