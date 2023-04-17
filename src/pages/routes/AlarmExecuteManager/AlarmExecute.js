import React,{ useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Modal, Tag, Input, Tabs, Table } from 'antd';
import AlarmForm from './AlarmForm';
import style from '../IndexPage.css';
const { TabPane } = Tabs;
const { Search } = Input;

function AlarmExecute({ dispatch, global, alarm, location }){
    const { recordListInfo, isLoading, executeType, pageNum, recordHistory, recordProgress } = alarm;
    const inputRef = useRef();
    const [visible, toggleVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [activeKey, setActiveKey] = useState('1');
    const [value, setValue] = useState('');
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ (pageNum - 1) * 10 + index + 1}`;
            }
        },
        { title:'区域', dataIndex:'region_name'},
        { title:'支路', dataIndex:'position_name' },
        { title:'设备名称', dataIndex:'mach_name'},
        { title:'告警分类', dataIndex:'type_name'},
        { 
            title:'告警信息',
            key:'warning_info',
            render:(row)=>{
                return `${row.warning_info}  实际:${row.warning_value}`;
            }
        },
        {
            title:'告警级别',
            dataIndex:'level'
        },
        {
            title:'当前状态',
            dataIndex:'status',
            render:(value)=>{
                let info = value === 1 ? { text:'未处理', color:'volcano'} : value === 2 ? { text:'跟进中', color:'geekblue'} : value === 3 ? { text:'已处理', color:'green'} : value === 4 ? { text:'挂起', color:'magenta'} : {};
                return (
                    <Tag color={info.color} key={info.text}>{info.text}</Tag>
                )
            }
        },
        { title:'发生时间', dataIndex:'first_warning_time'},
        { 
            title:'操作',
            render:(row)=>(
                <div>
                    <a onClick={()=>{
                        setCurrentRecord(row);
                        toggleVisible(true);
                        dispatch({ type:'alarm/fetchRecord', payload:row.record_id });
                    }}>查看详情</a>
                </div>
            )
        }
    ];
    useEffect(()=>{
        // 根据告警详情跳转的query设置当前选项卡
        let cate_code ;
        if ( location && location.query ){
            cate_code = location.query === 'total' || location.query === 'ele' ? '1' : location.query === 'limit' ? '2' : '3';
            setActiveKey(cate_code);
        }
        dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code }});

        return ()=>{
            dispatch({ type:'alarm/resetAlarmExecute'});
        }
    },[]);
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                    <Tabs activeKey={activeKey} className={style['custom-tabs']} onChange={activeKey=>{
                        dispatch({ type:'alarm/setPageNum', payload:1 });
                        dispatch({type:'alarm/fetchRecordList', payload:{ cate_code:activeKey }});
                        setActiveKey(activeKey);
                        setValue('');
                    }} tabBarExtraContent={
                        <div>
                            <Search allowClear value={value} onChange={e=>setValue(e.target.value)} style={{ width:'340px', marginTop:'6px' }} ref={inputRef} placeholder='可输入设备名称/注册码/区域/支路查询' enterButton onSearch={value=>{
                                dispatch({ type:'alarm/setPageNum', payload:1 });
                                dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code:activeKey, keywords:value }});
                                if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                            }}/>
                        </div>
                    }>
                        <TabPane key='1' tab='电气告警'>
                            <Table
                                dataSource={recordListInfo.list  || []}
                                bordered={true}
                                rowKey='record_id'
                                className={style['self-table-container']}
                                columns={columns}
                                locale={{ emptyText:'没有电气告警记录' }}
                                loading={isLoading}
                                pagination={{ total:recordListInfo.count, current:pageNum, pageSize:15, showSizeChanger:false  }}
                                onChange={pagination=>{
                                    dispatch({ type:'alarm/setPageNum', payload:pagination.current });
                                    dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code:activeKey, keywords:value }} )
                                }}
                            />
                        </TabPane>
                        <TabPane key='2' tab='越限告警'>
                            <Table
                                dataSource={recordListInfo.list || []}
                                bordered={true}
                                rowKey='record_id'
                                className={style['self-table-container']}
                                columns={columns}
                                locale={{ emptyText:'没有越限告警记录' }}
                                loading={isLoading}
                                pagination={{ total:recordListInfo.count, current:pageNum, pageSize:15, showSizeChanger:false }}
                                onChange={pagination=>{
                                    dispatch({ type:'alarm/setPageNum', payload:pagination.current });
                                    dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code:activeKey, keywords:value }} )
                                }}
                            />
                        </TabPane>
                        <TabPane key='3' tab='通讯告警'>
                            <Table
                                dataSource={recordListInfo.list || []}
                                bordered={true}
                                rowKey='record_id'
                                className={style['self-table-container']}
                                columns={columns}
                                locale={{ emptyText:'没有通讯告警记录' }}
                                loading={isLoading}
                                pagination={{ total:recordListInfo.count, current:pageNum, pageSize:15, showSizeChanger:false }}
                                onChange={pagination=>{
                                    dispatch({ type:'alarm/setPageNum', payload:pagination.current });
                                    dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code:activeKey, keywords:value }} )
                                }}

                            />
                        </TabPane>
                    </Tabs>
                    
                    <Modal 
                        visible={visible} 
                        footer={null} 
                        width='50%'
                        destroyOnClose={true} 
                        bodyStyle={{ padding:'40px' }}
                        onCancel={()=>toggleVisible(false)}
                    >
                        <AlarmForm 
                            data={currentRecord} 
                            executeType={executeType}
                            onClose={()=>toggleVisible(false)} 
                            onDispatch={(action)=>dispatch(action)}
                            recordHistory={recordHistory}
                            recordProgress={recordProgress}
                        />
                    </Modal>
                </div>  
               
            
        </div>
    )
}

export default React.memo(connect(({ global, alarm })=>({ global, alarm }))(AlarmExecute));