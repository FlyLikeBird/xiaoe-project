import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton } from 'antd';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '@/pages/routes/IndexPage.css';
import TrendBarChart from './TrendBarChart';
import RatioLineChart from './RatioLineChart';

const { TabPane } = Tabs;

function AlarmTrendManager({ dispatch, alarm, fields, global }){
    const dateRef = useRef();
    let { timeType, startDate, endDate } = global;
    let { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let { alarmTrendInfo, attrIds } = alarm;
    let total = Object.keys(alarmTrendInfo).length ? alarmTrendInfo.safeCnt + alarmTrendInfo.limitCnt + alarmTrendInfo.linkCnt : 0;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>           
            <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                new Promise((resolve, reject)=>{
                    dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                }).then(attrs=>{
                    let temp = [];
                    if ( attrs.length && attrs[0].children ) {
                        temp.push(attrs[0].key);
                        attrs[0].children.map(i=>temp.push(i.key));
                    } else if ( attrs.length ) {
                        temp.push(attrs[0].key);
                    }
                    dispatch({ type:'alarm/selectAttrIds', payload:temp });
                    dispatch({type:'alarm/fetchWarningTrend'}); 
                })
            }}>
                {                       
                    fieldList.map(field=>(
                        <TabPane 
                            key={field.field_id} 
                            tab={field.field_name}
                            activeKey={currentField.field_id}                        
                        >
                            {
                                treeLoading
                                ?
                                <Spin />
                                :
                                <Tree
                                    checkable
                                    checkStrictly
                                    expandedKeys={expandedKeys}
                                    onExpand={value=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:value });
                                    }}
                                    checkedKeys={attrIds}
                                    onCheck={(checkedKeys, e)=>{
                                        let { checked, checkedNodes, node }  = e;
                                        if ( node.children && node.children.length  ){
                                            if ( checked ){
                                                node.children.map(i=>{
                                                    if(!checkedKeys.checked.includes(i.key)) {
                                                        checkedKeys.checked.push(i.key);
                                                    }
                                                });
                                            } else {
                                                let childKeys = node.children.map(i=>i.key);
                                                checkedKeys.checked = checkedKeys.checked.filter(key=>{
                                                    return !childKeys.includes(key);
                                                });
                                            }
                                        }
                                        dispatch({type:'alarm/selectAttrIds', payload:checkedKeys.checked });
                                        dispatch({type:'alarm/fetchWarningTrend'});                                            
                                    }}
                                    treeData={fieldAttrs}
                                />
                            }
                        </TabPane>
                    ))
                }
            </Tabs>                                     
        </div>
    );
    const content = (
        
                Object.keys(alarmTrendInfo).length 
                ?
                <div>
                    {/* 日期控制器 */}
                    <div style={{ height:'40px' }}>
                        <CustomDatePicker noDay onDispatch={()=>{
                            dispatch({type:'alarm/fetchWarningTrend'});                                            
                        }} />
                    </div>
                    <div style={{ height:'calc( 100% - 40px)'}}>
                        {/* 信息列表 */}
                        <div style={{ height:'12%' }}>
                            {
                                alarmTrendInfo.alarmInfoList.map((item,index)=>(
                                    <div key={item.type} className={style['card-container-wrapper']} style={{ 
                                        width:'33.3%',
                                        paddingRight: index === alarmTrendInfo.alarmInfoList.length - 1 ? '0' : '1rem',                                
                                    }}>
                                        <div style={{ height:'100%', display:'flex', justifyContent:'space-around', alignItems:'center', textAlign:'center', backgroundColor:'#fff', borderRadius:'6px', color:'rgba(0, 0, 0, 0.85)' }}>
                                            <div >
                                                <span>{ item.text }</span>
                                                <div className={style['data']}>{ item.total }件</div>
                                            </div>
                                            <div>
                                                <span>已处理完成</span>
                                                <div className={style['data']}>{ item.finish }件</div>
                                            </div>
                                            <div>
                                                <span>完成率</span>
                                                <div className={style['data']}>{ item.ratio }%</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={style['card-container-wrapper']} style={{ height:'44%', paddingRight:'0' }}>
                            <div className={style['card-container']}>
                                <TrendBarChart 
                                    data={alarmTrendInfo.view} 
                                    timeType={timeType}

                                />
                            </div>
                        </div>
                        <div className={style['card-container-wrapper']} style={{ height:'44%', paddingRight:'0', paddingBottom:'0' }}>
                            <div className={style['card-container']}>
                                <RatioLineChart 
                                    total={total} 
                                    data={alarmTrendInfo.view} 
                                    timeType={timeType}
                                    
                                />
                            </div>
                        </div>
                    </div>
                </div>
                :
                <Skeleton className={style['skeleton']} active />
           
    );
    useEffect(()=>{
        dispatch({ type:'global/toggleTimeType', payload:'2'});
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }})
        })
        .then(attr=>{
            let temp = [];
            if ( attr.children && attr.children.length ){
                temp.push(attr.key);
                attr.children.forEach(i=>temp.push(i.key));
            } else {
                temp.push(attr.key);
            }
            dispatch({ type:'alarm/selectAttrIds', payload:temp });
            dispatch({ type:'alarm/fetchWarningTrend'});
        })
        
        return ()=>{
            dispatch({ type:'alarm/reset'});
            dispatch({ type:'global/toggleTimeType', payload:'1' });
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
};

export default React.memo(connect(({ fields, alarm, global })=>({ fields, alarm, global }))(AlarmTrendManager));