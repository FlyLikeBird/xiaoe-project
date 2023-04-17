import React, { useEffect } from 'react';
import { Form, InputNumber, Input, Button, message } from 'antd';

function validator(a,value){
    if ( !value || typeof +value !== 'number' || +value <0 ) {
        return Promise.reject('请填入合适的阈值');
    } else {
        return Promise.resolve();
    }
}


function AnalyzeMachForm({ data, onClose, onDispatch }){
    const [form] = Form.useForm();
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    useEffect(()=>{
        form.setFieldsValue({
            off_power:+data.off_power || '',
            empty_power:+data.empty_power || '',
            over_power:+data.over_power || '',
            rated_power:+data.rated_power || ''
        })
    },[]);

    return (
        <Form
            form={form}
            { ...layout }
        >
            <Form.Item label='设备模型名称:' name='device_name' rules={[{ required:true, message:'请输入设备模型名称' }]}><Input /></Form.Item>
            <Form.Item label='关机功率阈值:' name='off_power' rules={[{ validator }]}><InputNumber style={{ width:'100%' }} /></Form.Item>
            <Form.Item label='空载功率阈值:' name='empty_power' rules={[{ validator }]}><InputNumber style={{ width:'100%' }}/></Form.Item>
            <Form.Item label='重载功率阈值:' name='over_power' rules={[{ validator }]}><InputNumber style={{ width:'100%' }}/></Form.Item>
            <Form.Item label='额定功率:' name='rated_power' rules={[{ validator }]}><InputNumber style={{ width:'100%' }}/></Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                <Button type='primary' onClick={()=>{
                    form.validateFields()
                    .then(values=>{
                        new Promise((resolve, reject)=>{
                           onDispatch({type:'analyze/addDevice', payload:{ values, resolve, reject }})
                        })
                        .then(()=>{
                            onClose();
                        })
                        .catch(msg=>{
                            message.error(msg);
                        })
                    })
                }}>添加</Button>
                <Button style={{ marginLeft:'6px'}} onClick={()=>onClose()}>取消</Button>

            </Form.Item>
        </Form>
    )
}

export default AnalyzeMachForm;