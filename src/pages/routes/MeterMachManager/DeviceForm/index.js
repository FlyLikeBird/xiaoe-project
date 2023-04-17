import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Switch, Radio, Button, TreeSelect, Checkbox } from 'antd';

const { Option } = Select;
function checkNum(a, value){
    if ( !value || typeof +value === 'number' && +value > 0 ) {
        return Promise.resolve()
    } else {
        return Promise.reject('请输入正确的格式')
    }
}

const DeviceForm = ({ dispatch, device, gateway, forGateway})=>{
    let { form, prevForm, forEdit, currentRadio } = forGateway ?  gateway : device;
    let { energy_type, fieldArr, gateways, types, firms, users, model } = form;
    let { meter_name, register_code, connection_mode, net_mode, type_id, meter_firm_id, gateway_id, is_able, branch_id, region_id, energy_id, repair_user_id, model_id } = prevForm;
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    const fieldKeys = fieldArr ? Object.keys(fieldArr) : [];
    
    return (
        
        <Form 
            {...layout} 
            name="device-form" 
            initialValues = {
                {
                    meter_name : forEdit ? meter_name : '',
                    register_code : forEdit ? register_code : '',
                    connection_mode : forEdit ? connection_mode : '1',
                    energy_type : forEdit ? prevForm.energy_type : null,
                    type_id : forEdit ? type_id : null,
                    firm_id : forEdit ? meter_firm_id : null,
                    gateway_id : forEdit ? gateway_id : null,
                    is_able : forEdit ? is_able == 1 ? true : false : true,
                    repair_user_id : forEdit ? repair_user_id : null,
                    model_id : forEdit ? model_id : null,
                    //  编辑状态下，获取维度的默认值
                    branch : forEdit ? branch_id : null,
                    region : forEdit ? region_id : null,
                    //  网关上云方式的初始值
                    net_mode: forEdit ? net_mode : ['1']
                }
            }
            onFinish={values=>{
                if ( forGateway ) {
                    dispatch({type:'gateway/add', payload: { values, forEdit : forEdit ? true : false }});
                } else {
                    dispatch({type:'device/add', payload: { values, forEdit : forEdit ? true : false }});
                }         
            }}
        >
            <Form.Item name='meter_name' label={ forGateway ? '网关名称' : "设备名称"} rules={[{ required: true, message:'设备名称不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='register_code' label="识别码" rules={[{required:true,  message:'设备识别码不能为空'}]}>
                <Input />
            </Form.Item>
            {
                forGateway 
                ?
                <Form.Item name='net_mode' label='上云方式'>
                    <Checkbox.Group>
                        <Checkbox value='1'>4G</Checkbox>
                        <Checkbox value='2'>WIFI</Checkbox>
                    </Checkbox.Group>
                </Form.Item>
                :
                <Form.Item name='connection_mode' label="通讯方式" >
                    <Radio.Group>
                       <Radio value="1">4G</Radio>
                       <Radio value="2">Lora</Radio>
                       <Radio value="3">485</Radio>
                    </Radio.Group>
                </Form.Item>
            }
            {
                forGateway
                ?
                null
                :
                <Form.Item name='energy_type' label="能源类型" rules={[{ required:true, message:'必须选择一种能源类型'}]}>
                    <Select>
                        {
                            energy_type && energy_type.length
                            ?
                            energy_type.map((item,index)=>(
                                <Option key={index} value={item.energy_type}>{item.type_name}</Option>
                            ))
                            :
                            null
                        }
                    </Select>
                </Form.Item>
            }
            
            <Form.Item name='type_id' label={ forGateway ? "网关类型" : "设备类型" } rules={[{ required:true , message:'必须选择一种设备类型'}]}>
                <Select>
                    {
                        types && types.length
                        ?
                        types.map((item,index)=>(
                            <Option key={index} value={item.type_id}>{item.type_name}</Option>
                        ))
                        :
                        null
                    }
                </Select>
            </Form.Item>
            <Form.Item name='model_id' label={ forGateway ? '网关型号':'设备型号'} rules={[{ required:true , message:'必须选择一种设备型号'}]}>
                <Select>
                    {
                        model && model.length
                        ?
                        model.map((item,index)=>(
                            <Option key={index} value={item.model_id}>{item.model_desc}</Option>
                        ))
                        :
                        null
                    }
                </Select>
            </Form.Item>
            {
                forGateway
                ?
                null
                :
                <Form.Item name='repair_user_id' label='维护人员' rules={[{ required:true, message:'请选择一位维护人员'}]}>
                    <Select>
                        {
                            users && users.length 
                            ?
                            users.map((item,index)=>(
                                <Option key={index} value={item.user_id}>{ item.real_name }</Option>
                            ))
                            :
                            null
                        }
                    </Select>
                </Form.Item>
            }
            {
                forGateway
                ?
                null
                :
                <Form.Item name='total_kva' label='变压器容量' rules={[{ validator:checkNum }]}>
                    <Input />
                </Form.Item>
            }
            {
                forGateway
                ?
                null
                :
                <Form.Item name='rated_power' label='额定功率' rules={[{ validator:checkNum }]}>
                    <Input />
                </Form.Item>
            }
            
            {
                forGateway
                ?
                null
                :
                <Form.Item name='gateway_id' label="归属网关">
                    <Select>
                        {
                            gateways && gateways.length
                            ?
                            gateways.map((item,index)=>(
                                <Option key={index} value={item.gateway_id}>{item.meter_name}</Option>
                            ))
                            :
                            null
                        }
                    </Select>
                </Form.Item>
            }
            
            {
                fieldKeys.length
                ?
                fieldKeys.map((key,index)=>(
                    <Form.Item key={key} name={key} label={fieldArr[key].code_name}>
                        <TreeSelect
                            style={{width:'100%'}}
                            treeDefaultExpandAll={true}
                            dropdownStyle={{maxHeight:400, overflow:'auto'}}
                            treeData={fieldArr[key].list}
                            placeholder={`请选择一个${fieldArr[key].code_name}`}
                        />
                    </Form.Item>
                ))
                :
                null
            }
            <Form.Item name='is_able' label="是否启用" valuePropName="checked">
                <Switch />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                <Button type="primary" htmlType="submit">
                    { forEdit ? '修改' : '创建' }
                </Button>
                <Button style={{marginLeft:'6px'}} onClick={()=>{
                    if ( forGateway ){
                        dispatch({ type:'gateway/toggleVisible', payload:{ visible:false }})
                    } else {
                        dispatch({type:'device/toggleVisible', payload:{ visible:false }})
                    }
                }}>取消</Button>
            </Form.Item>
        </Form>
    )
}

export default connect(({device, gateway}) => ({device, gateway}))(DeviceForm);