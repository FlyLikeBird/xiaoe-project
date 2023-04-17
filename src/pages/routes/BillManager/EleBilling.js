import React, { useState, useEffect } from 'react';
import { Switch, Tag, Table, Form, Modal, Radio, Input, Button, message, Popconfirm } from 'antd';
import style from '@/pages/routes/IndexPage.css';
import BillingForm from './BillingForm';
const allTimeType = {
    1:'峰时段',
    2:'平时段',
    3:'谷时段',
    4:'尖时段'
};
function EleBilling({ dispatch, billing }){
    let { rateInfo, list, is_actived, visible } = billing;
    let [formVisible, setFormVisile] = useState(false);
    let [ form ] = Form.useForm();
    let columns = [
        {
            title: '季度',
            dataIndex: 'quarter_name'
        },
        {
            title: '月份',
            dataIndex: 'month',
            render:(value, row)=>{
                return <div>{`${row.begin_month}月-${row.end_month}月`}</div>
            }
        },
        {
            title: '时段',
            dataIndex: 'tel',
            render: (value, row, index) => {
                const renderNode = (
                    <div>
                        {
                            row.timeList.map((time,index)=>(
                                 <div style={{ borderBottom: index === row.timeList.length - 1 ? 'none' : '1px solid #f0f0f0', padding:'4px 6px' }} key={index}>{`${allTimeType[time.time_type]}: ${time.begin_time}点 - ${time.end_time}点`}</div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : style['multi-table-cell'] }
                }
                return obj;
            },
        },
        {
            title: '费率(元/kwh)',
            dataIndex: 'fee_rate',
            render: (value, row)=>{
                const renderNode = (
                    <div>
                        {
                            row.timeList.map((time,index)=>(
                                 <div style={{ borderBottom: index === row.timeList.length - 1 ? 'none' : '1px solid #f0f0f0', padding:'4px 6px' }} key={index}><span style={{color:'#1890ff'}}>{`${time.fee_rate}元`}</span></div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : style['multi-table-cell'] }
                }
                return obj;
            }
        },
        {
            title:'操作',
            dataIndex:'action',
            render:(value, row)=>{
                return (
                    <div>
                        <a onClick={()=>dispatch({type:'billing/toggleVisible', payload:{ visible:true, forEdit:true, prevItem:row}})}>编辑</a>
                        <Popconfirm title="确定删除此条计费规则吗?" onText="确定" cancelText="取消" onConfirm={()=>dispatch({type:'billing/delete', payload:row.quarter_id })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ]; 
    useEffect(()=>{
        if ( formVisible && form.setFieldsValue ){
            form.setFieldsValue({
                total_kva:Math.round(rateInfo.total_kva),
                kva_price:Math.round(rateInfo.kva_price),
                demand_price:Math.round(rateInfo.demand_price),
                calc_type:rateInfo.calc_type + ''
            });
        }
    },[formVisible])
    return (
        <div style={{ padding:'1rem' }}>
            <div style={{ marginBottom:'10px', display:'flex', alignItems:'center' }}>
                <Button type="primary"  size="small" shape="round" style={{ marginRight:'20px' }} onClick={() => dispatch({type:'billing/toggleVisible', payload:{visible:true}})}>添加计费规则</Button>
                <span>目前状态:</span>
                <Switch style={{margin:'0 20px 0 6px'}} checked={is_actived} checkedChildren="激活中" unCheckedChildren="激活计费" onChange={checked=>{
                    new Promise((resolve, reject)=>{
                        dispatch({type:'billing/active', payload:{ resolve, reject }});
                    })
                    .then(()=>{
                        dispatch({type:'billing/toggleActive'})
                    })
                    .catch(msg=>{
                        message.error(msg);
                    })
                }} />
                <div>
                    <span style={{ marginLeft:'10px', paddingRight:'10px', borderRight:'1px solid #ccc' }}>
                        <span>计费类型:</span>
                        <Tag color='blue'>按{ +rateInfo.calc_type === 1 ? '需量' : '容量'}计费</Tag>
                    </span>
                    <span style={{ marginLeft:'10px', paddingRight:'10px', borderRight:'1px solid #ccc' }}>
                        <span>变压器容量(kva):</span>
                        <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold' }}>{ Math.round(rateInfo.total_kva) }</span>                            
                    </span>
                    <span style={{ marginLeft:'10px', paddingRight:'10px', borderRight:'1px solid #ccc' }}>
                        <span>容量基本电费单价(元/kva):</span>
                        <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold'  }}>{ Math.round(rateInfo.kva_price) }</span>                            
                    </span>
                    <span style={{ marginLeft:'10px', paddingRight:'10px' }}>
                        <span>需量基本电费单价(元/kw):</span>
                        <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold' }}>{ Math.round(rateInfo.demand_price) }</span>                            
                    </span>
                    <Button type="primary" shape="round" size="small" onClick={()=>{
                        setFormVisile(true);
                    }}>设置计费信息</Button>
                </div>            
            </div>
                <Table
                    className={style['self-table-container']}
                    style={{ padding:'0' }}
                    columns={columns}
                    dataSource={list}
                    bordered={true}
                    rowKey="quarter_id"
                />
                <Modal
                    visible={visible}
                    footer={null}
                    width="50%"
                    destroyOnClose={true}
                    bodyStyle={{ padding:'40px'}}
                    closable={false}
                    onCancel={()=>dispatch({type:'billing/toggleVisible', payload:{ visible:false }})}
                >
                    <BillingForm />
                </Modal>
                <Modal
                    visible={formVisible}
                    closable={false}
                    destroyOnClose={true}
                    onCancel={()=>setFormVisile(false)}
                    okText='确定'
                    cancelText='取消'
                    onOk={()=>{
                        form.validateFields()
                        .then(values=>{
                            values.rate_id = rateInfo.rate_id;
                            dispatch({ type:'billing/editRate', payload:{ values }});
                            setFormVisile(false);
                        })
                        
                    }}
                >
                    <Form 
                        form={form}
                    >
                        <Form.Item label='计费类型' name='calc_type' rules={[{ required:true, message:'请选择一种计费类型' }]}> 
                            <Radio.Group >
                                <Radio value='1'>按需量计费</Radio>
                                <Radio value='2'>按容量计费</Radio>
                            </Radio.Group>          
                        </Form.Item>
                        <Form.Item label="变压器容量(KVA)" name="total_kva" rules={[{ required:true, message:'请选择一种计费类型' }]}>
                            <Input size="small" style={{width:'120px'}}/> 
                        </Form.Item>
                        <Form.Item label="容量基本电费单价(元/KVA)" name="kva_price" rules={[{ required:true, message:'请选择一种计费类型' }]}>
                            <Input size="small" style={{width:'120px'}}/> 
                        </Form.Item>
                        <Form.Item label="需量基本电费单价(元/KW)" name="demand_price" rules={[{ required:true, message:'请选择一种计费类型' }]}>
                            <Input size="small" style={{width:'120px'}}/> 
                        </Form.Item>
                       
                    </Form>
                </Modal>
            </div> 
    )
}

export default EleBilling;