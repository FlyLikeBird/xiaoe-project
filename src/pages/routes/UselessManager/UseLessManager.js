import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Button, Modal, Tabs, DatePicker, Skeleton, message } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, LeftOutlined, RightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import UselessChart from './LineChart';

import style from '../IndexPage.css';

const { TabPane } = Tabs;

function UseLessManager({ dispatch, global, fields, demand }) {
    const { machList, currentMach, uselessInfo, uselessTime, uselessLoading } = demand;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const inputRef = useRef();
    const monthData = uselessInfo.month ? uselessInfo.month : {};
    const nowData = uselessInfo.now ? uselessInfo.now : {};
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }});
        })
        .then(()=>{
            dispatch({ type:'demand/fetchUseless'});
        })
        return ()=>{
            dispatch({ type:'demand/reset'});
        }
    },[]);
    const sidebar = (
        <div>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id+''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'demand/fetchUseless'});                   
                    })
                }}>
                    {                       
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}
                                                        
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        className={style['custom-tree']}
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'demand/fetchUseless'});
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>             
        </div>
    );
    const content = (
        Object.keys(uselessInfo).length 
        ?
        <div>
            <div style={{ height:'40px'}}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'demand/fetchUseless'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0'}}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']}>本月概况</div>
                            <div className={style['card-content']}>
                                <div className={style['flex-container']}>
                                    <div className={style['flex-item']}>
                                        <div>有功电量(kwh)</div>
                                        <div className={style['data']}>
                                            {
                                                monthData.eleEnergy 
                                                ?
                                                Math.floor(monthData.eleEnergy)
                                                :
                                                <span>-- --</span>
                                            }
                                        </div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>无功电量(kVarh)</div>
                                        <div className={style['data']}>
                                            {
                                                monthData.revEleEnergy
                                                ?
                                                // <CountUp  start={0} end={Math.floor(monthData.revEleEnergy)} useGrouping={true} separator=','  />
                                                Math.floor(monthData.revEleEnergy)
                                                :
                                                <span onClick={()=>alert('lalala')}>-- --</span>
                                            }
                                        </div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>功率因素COSΦ</div>
                                        <div className={style['data']}>
                                            {
                                                monthData.avgFactor 
                                                ?
                                                // <CountUp  start={0} end={monthData.avgFactor} useGrouping={true} separator=',' decimals={2} decimal='.' />
                                                (+monthData.avgFactor).toFixed(2)
                                                :
                                                <span onClick={()=>alert('lalala')}>-- --</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:'0', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']}>当前功率</div>
                            <div className={style['card-content']}>
                                <div className={style['flex-container']}>
                                    <div className={style['flex-item']}>
                                        <div>有功功率(kw)</div>
                                        <div className={style['data']}>
                                            {
                                                nowData.usePower && nowData.usePower
                                                ?
                                                // <CountUp  start={0} end={Math.floor(nowData.usePower)} useGrouping={true} separator=',' lastSymbol='KW' />
                                                Math.floor(nowData.usePower)
                                                :
                                                <span onClick={()=>alert('lalala')}>-- --</span>
                                            }  
                                        </div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>无功功率(kVar)</div>
                                        <div className={style['data']}>
                                            {
                                                nowData.uselessPower && nowData.uselessPower
                                                ?
                                                // <CountUp  start={0} end={Math.floor(nowData.uselessPower)} useGrouping={true} decimal='1' separator=',' lastSymbol='KW' />
                                                Math.floor(nowData.uselessPower)
                                                :
                                                <span onClick={()=>alert('lalala')}>-- --</span>
                                            }
                                        </div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>功率因素COSΦ</div>
                                        <div className={style['data']}>
                                            {
                                                nowData.factor && nowData.factor
                                                ?
                                                // <CountUp  start={0} end={nowData.factor} useGrouping={true} separator=',' lastSymbol='KW' decimals={2} decimal='.' />
                                                (+nowData.factor).toFixed(2)
                                                :
                                                <span onClick={()=>alert('lalala')}>-- --</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'80%', paddingRight:'0', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                    {
                        uselessLoading 
                        ?
                        <Skeleton active className={style['skeleton']} />
                        : 
                        <UselessChart data={uselessInfo} />   
                    }
                    </div>
                </div>

            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />

           
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ global, demand, fields })=>({ global, demand, fields }))(UseLessManager);
