import React, { Component, useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Input, Popconfirm, Form, Spin, message } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from '../IndexPage.css';
import DeviceForm from './DeviceForm';

const { Option } = Select;
const { Search } = Input;

const MachManager = ({dispatch, device, user}) => {
    let { currentCompany, companyList } = global;
    let { list, selectedRowKeys, pageNum, total, visible, isLoading } = device;
    const [value, setValue] = useState('');
    const inputRef = useRef();
    const columns = [
       { width:160, ellipsis:true, title:'设备名称', dataIndex:'meter_name', key:'meter_name', fixed:'left' },
       { width:100, ellipsis:true, title:'设备类型', dataIndex:'type', key:'type' },
       { width:120, ellipsis:true, title:'设备识别码', dataIndex:'register_code', key:'register_code' },
       { width:160, ellipsis:true, title:'设备型号', dataIndex:'model_name', key:'model_name' },
       { ellipsis:true, title:'区域', dataIndex:'region', key:'region' },
       { ellipsis:true, title:'支路', dataIndex:'branch', key:'branch' },
       { width:120, ellipsis:true, title:'维护人员', dataIndex:'repair_user_name', key:'repair_user_name' },
       { width:120, ellipsis:true, title:'所属网关', dataIndex:'gateway', key:'gateway' },
       { width:120, ellipsis:true, title:'创建时间', dataIndex:'create_time', key:'create_time' },
       { 
            title:'操作',
            width:120,
            key:'action',
            fixed:'right',
            render:(text, record)=>(
                <span>
                    <a onClick={()=>dispatch({type:'device/fetchEditForm', payload:record})}>编辑</a>
                </span>
            )
       }
    ];
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) =>dispatch({type:'device/select', payload:selectedRowKeys})
    };
    useEffect(()=>{
        dispatch({ type:'device/fetchDevice'})
        return ()=>{
            dispatch({ type:'device/reset'});
        }
    },[])
    return (
            <div className={style['block-container']}>
                <div className={style['operation-container']} style={{ marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div><Button type="primary" style={{ marginRight:'6px' }} onClick={()=>{
                            dispatch({ type:'device/select', payload:[] });
                            dispatch({type:'device/fetchAddForm'})
                        }}>添加设备</Button>
                        <Popconfirm title="确定要删除设备吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                            if ( !selectedRowKeys.length ){
                                message.info('请至少选择一个设备');
                            } else {
                                dispatch({type:'device/delete'});
                            }
                        }}><Button type="primary" >删除设备</Button></Popconfirm>
                        </div>
                        <Search allowClear value={value} onChange={e=>setValue(e.target.value)} style={{ width:'340px', marginTop:'6px' }} ref={inputRef} placeholder='可输入设备名称查询' enterButton onSearch={value=>{
                            dispatch({ type:'device/setPageNum', payload:1 });
                            dispatch({ type:'device/fetchDevice', payload:{ meter_name:value }});
                            if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                        }}/>
                </div>
                <Table
                    columns={columns}
                    dataSource={list}
                    className={style['self-table']}
                    bordered={true}
                    rowKey="mach_id"
                    rowSelection={rowSelection}
                    loading={isLoading}
                    locale={{emptyText:'还没有添加设备'}}
                    pagination={{current:pageNum, pageSize:15, total, showSizeChanger:false }}
                    onChange={(pagination)=>dispatch({type:'device/fetchDevice', payload:{pageNum:pagination.current}})}
                />
                <Modal
                    footer={null} 
                    visible={visible} 
                    bodyStyle={{padding:'40px'}}
                    destroyOnClose={true}
                    closable={false}
                    onCancel={()=>dispatch({type:'device/toggleVisible', payload:{visible:false, forEdit:false}})}
                >
                    <DeviceForm />
                </Modal>
            </div>
        
    )
}

MachManager.propTypes = {
};

export default React.memo(connect(({global, device})=>({device, global}))(MachManager));
