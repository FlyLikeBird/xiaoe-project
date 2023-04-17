import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, message, Skeleton  } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import AnalyzeChart from './AnalyzeChart';
import AnalyzeInfo from './AnalyzeInfo';
import style from '../IndexPage.css';

const { TabPane } = Tabs;

function CostAnalyze({ dispatch, costReport, fields, global }) {
    const { analyzeInfo, chartInfo, checkedKeys, curRatio, timeType } = costReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let infoTitle = timeType === '1' ? '昨日' : timeType === '2' ? '上月' : timeType === '3' ? '去年' : '';
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    // console.log(allFields);
    // console.log(fieldList);
    const sidebar = (
        <div>
            <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                new Promise((resolve, reject)=>{
                    dispatch({ type:'fields/init', payload:{ resolve, reject }});
                })
                .then((node)=>{
                    let temp = [];
                    if ( node.children ) {
                        temp.push(node.key);
                        node.children.map(i=>temp.push(i.key));
                    } else if ( node.key ) {
                        temp.push(node.key);
                    }
                    dispatch({type:'costReport/select', payload:temp});
                    dispatch({type:'costReport/fetchCostAnalyze'});
                })
            }}>
                {
                    energyList.map((item,index)=>(
                        <TabPane key={item.type_id} tab={item.type_name}>
                            <Tabs  
                                className={style['custom-tabs']}
                                activeKey={currentField.field_id + ''}  
                                type='card'                      
                                onChange={fieldKey=>{
                                    let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                                    new Promise((resolve, reject)=>{
                                        dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                                    }).then((attrs)=>{
                                        let temp = [];
                                        if ( attrs.length && attrs[0].children ) {
                                            temp.push(attrs[0].key);
                                            attrs[0].children.map(i=>temp.push(i.key));
                                        } else if ( attrs.length ) {
                                            temp.push(attrs[0].key);
                                        }
                                        dispatch({type:'costReport/select', payload:temp});
                                        dispatch({type:'costReport/fetchCostAnalyze'});
                                    })
                                    
                            }}>
                                {   
                                    fields.isLoading
                                    ?
                                    null
                                    :
                                    fieldList && fieldList.length
                                    ?                    
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
                                                    checkable
                                                    checkStrictly
                                                    expandedKeys={expandedKeys}
                                                    onExpand={temp=>{
                                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                                    }}
                                                    checkedKeys={checkedKeys}
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
                                                        dispatch({type:'costReport/select', payload:checkedKeys.checked });
                                                        dispatch({type:'costReport/fetchCostAnalyze'});                                            
                                                    }}
                                                    treeData={fieldAttrs}
                                    
                                                />
                                            }
                                        </TabPane>
                                    ))
                                    :
                                    <div className={style['text']} style={{ padding:'1rem'}}>该能源类型还没有设置维度</div>
                                }
                            </Tabs>
                        </TabPane>
                    ))
                }
            </Tabs> 
        </div>
    );
    const content = (
            
        Object.keys(chartInfo).length 
        ?
        <div>
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'costReport/fetchCostAnalyze'});                                            
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'16%', paddingRight:'0' }}>
                    {
                        analyzeInfo.map((item,index)=>(
                            <div key={index} className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0', paddingRight:index === analyzeInfo.length - 1 ? '0' : '1rem' }}>
                                <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                                    <div>{ `${ index === 1 ? infoTitle + item.text : item.text }(${item.unit})` }</div>
                                    <div className={style['data']}>{ item.data }</div>   
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className={style['card-container-wrapper']} style={{ display:'block', paddingRight:'0', paddingBottom:'0', height:'84%'}}>
                    <div className={style['card-container']}>
                        <AnalyzeChart 
                            data={costReport} 
                            currentField={currentField} 
                        />
                    </div>
                </div>
            </div> 
        </div>
        :
        <Skeleton className={style['skeleton']} />
              
    );
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/init', payload:{ resolve, reject }});
        })
        .then((attr)=>{
            let temp = [];
            if ( attr.children && attr.children.length ){
                temp.push(attr.key);
                attr.children.forEach(i=>temp.push(i.key));
            } else {
                temp.push(attr.key);
            }
            dispatch({ type:'costReport/select', payload:temp });
            dispatch({ type:'costReport/fetchCostAnalyze'});
        })
        return ()=>{
            dispatch({ type:'costReport/reset'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});
        }
    },[]);
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ costReport, fields, global})=>({ costReport, fields, global}))(CostAnalyze);
