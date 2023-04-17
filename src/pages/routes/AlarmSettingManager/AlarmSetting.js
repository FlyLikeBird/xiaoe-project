import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Input } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import RuleForm from './RuleForm';
import style from '../IndexPage.css';

const { Option } = Select;

function AlarmSetting({ dispatch, global, alarm }){
    let { currentCompany } = global;
    let { ruleList, ruleType, ruleMachs } = alarm;
    let [visibleInfo, setVisible] = useState({ visible:false, forEdit:false });
    let [currentRule, setCurrentRule] = useState({});
    useEffect(()=>{
        dispatch({ type:'alarm/fetchRuleType'});
        dispatch({ type:'alarm/fetchMachs'});
        dispatch({ type:'alarm/fetchRule' });
        return ()=>{
            dispatch({ type:'alarm/resetAlarmSetting'});
        }
    },[]);
    const columns = [
        { title:'规则名称', dataIndex:'rule_name' }, 
        // { title:'所属公司', dataIndex:'company_name' },
        { title:'告警等级(1级为最高)', dataIndex:'level' },
        { title:'告警类型', dataIndex:'type_name'},
        { title:'告警最小阈值', dataIndex:'warning_min', render:(value)=>(<span style={{ color:'#1890ff'}}>{ value }</span>)},
        { title:'告警最大阈值', dataIndex:'warning_max', render:(value)=>(<span style={{ color:'#1890ff'}}>{ value }</span>)},
        { 
            title:'单位',
            dataIndex:'unit_name',
            render:(value)=>{
                if ( !value ){
                    return '-- --'
                } else {
                    return value;
                }
            }
        },
        { 
            title:'创建时间',  
            dataIndex:'create_time',
        },
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>{
                            setCurrentRule(row);
                            setVisible({ visible:true, forEdit:true });
                        }}>修改</a>
                        <Popconfirm title="确定删除此条规则吗?" onText="确定" cancelText="取消" onConfirm={()=> dispatch({type:'alarm/deleteRule', payload:row.rule_id })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>

                    </div>
                )
            }
        }
    ];

    return (
            <div className={style['page-container']}>
                <div className={style['card-container']} style={{ padding:'1rem' }}>
                    <Button type="primary"  style={{ marginBottom:'1rem' }} onClick={() => setVisible({ visible:true, forEdit:false }) }>添加告警规则</Button>                
                    <Table
                        className={style['self-table-container']}
                        style={{ padding:'0' }}
                        columns={columns}
                        dataSource={ruleList}
                        locale={{emptyText:'还没有设置规则'}}
                        bordered={true}
                        rowKey="rule_id"
                    />
                    <Modal
                        visible={visibleInfo.visible}
                        footer={null}
                        width="40%"
                        destroyOnClose={true}
                        bodyStyle={{ padding:'40px'}}
                        closable={false}
                        className={style['modal-container']}
                        onCancel={()=>setVisible({ visible:false, forEdit:false })}
                    >
                        <RuleForm 
                            visibleInfo={visibleInfo} 
                            ruleType={ruleType}
                            currentRule={currentRule} 
                            ruleMachs={ruleMachs}
                            onClose={()=>setVisible({ visible:false, forEdit:false })} 
                            onAdd={values=>dispatch({type:'alarm/addRule', payload:values })}
                            onUpdate={values=>dispatch({type:'alarm/updateRule', payload:values})}
                        />
                    </Modal>
                </div>
            </div> 
             
    )
};

AlarmSetting.propTypes = {
};

export default React.memo(connect( ({ global, alarm }) => ({ global, alarm }))(AlarmSetting));