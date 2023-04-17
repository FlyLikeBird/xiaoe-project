import React, { Component, useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tabs, Table } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from '../IndexPage.css';
const { TabPane } = Tabs;

const SystemLog = ({dispatch, log, global}) => {
    const { loginLog, actionLog, isLoading } = log;
    const { companyList, userInfo } = global;
    const [logType, toggleLogType] = useState('login');
    const data = logType === 'login' ? loginLog : actionLog;
    const columns = [
        // {
        //     title:'日志ID',
        //     dataIndex:'log_id'
        // },
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( +data.pageNum - 1) * 10 + index + 1}`;
            }
        },
        {
            title:'日志类型',
            dataIndex:'log_type',
            render:(text)=>(
                <span>{ text == '1' ? '操作日志' : '登录日志'}</span>
            )
        },
        {
            title:'登录用户',
            dataIndex:'action_user'
        },
        {
            title:'登录IP',
            dataIndex:'ip',
        },
        // {
        //     title:'所属公司',
        //     dataIndex:'company_id',
        //     render:(text)=>{
        //         let filterCompany = companyList.filter(i=>i.company_id == text)[0];
        //         return <div>{ filterCompany ? filterCompany.company_name : '' }</div>
        //     }
        // },
        {
            title:'操作行为',
            dataIndex:'action_desc'
        },
        {
            title:'登录时间',
            dataIndex:'action_time'
        }
    ];
    useEffect(()=>{
        dispatch({ type:'log/fetchLog', payload:{ logType }});
        return ()=>{
            dispatch({ type:'log/reset'});
        }
    },[])
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <Tabs type="card" className={style['custom-tabs']} activeKey={logType} onChange={activeKey=>{
                    toggleLogType(activeKey);
                    dispatch({type:'log/fetchLog', payload:{ logType:activeKey }});
                }}>
                    <TabPane key='login' tab='登录日志'>
                        <Table
                            columns={columns}
                            className={style['self-table-container']}
                            dataSource={data.logs}
                            rowKey="log_id"
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:+data.pageNum, total:+data.count, showSizeChanger:false }}
                            onChange={(pagination)=>dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}})}
                        />
                    </TabPane>
                    <TabPane key='action' tab='操作日志'>
                        <Table
                            columns={columns}
                            dataSource={data.logs}
                            className={style['self-table-container']}
                            rowKey="log_id"
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:+data.pageNum, total:+data.count, showSizeChanger:false }}
                            onChange={(pagination)=>dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}})}
                        />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
    
}

SystemLog.propTypes = {
};

export default connect(({ log, global })=>({ log, global }))(SystemLog);
