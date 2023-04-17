import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Upload, Radio, message, Button, Modal, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function validator(a,value){
    if ( !value ) {
        return Promise.reject('该字段不能为空');
    } else {
        return Promise.resolve();
    }
}

function AlarmTimeline({ data, actionType, executeType, onClose, onDispatch }){
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewInfo, setPreviewInfo] = useState({});
    useEffect(()=>{
        form.setFieldsValue({
            'type_name':data.type_name,
            'executor_name':data.executor_name,
            'warning_info':data.warning_info,
            'warning_value':data.warning_value,
            'satisfied': data.satisfied
        })
    },[]);
    const handleChange = ( { fileList })=>{
        setFileList(fileList);
    };
    const handlePreview = (file)=>{
        // file.thumbUrl 默认编译成200*200像素的64位字符串, 用FileReader重新解析
        if ( !file.preview ) {
            getBase64(file.originFileObj)
                .then(data=>{
                    file.preview = data;
                    setPreviewInfo({
                        visible:true,
                        img:data,
                        title:file.name
                    });
                })
        } else {
            setPreviewInfo({
                visible:true,
                img:file.preview,
                title:file.name
            })
        }
    };
    const handleBeforeUpload = (file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error('只能上传JPG 、JPEG 、GIF、 PNG格式的图片')
        }
        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
            message.error('图片不能超过5M');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传图片</div>
        </div>
    );
    
    return (
        <div style={{ margin:'20px 0'}}>
            <Form
                form={form}
                onFinish={values=>{
                    console.log(values);                       
                    new Promise((resolve,reject)=>{
                        values.record_id = data.record_id;
                        values.oper_code = actionType;
                        if ( values.photos ){
                            values.photos = values.photos.fileList.map(item=>item.originFileObj);
                        } else {
                            values.photos = [];
                        }
                        values.resolve = resolve;
                        values.reject = reject;
                        onDispatch({type:'alarm/confirmRecord', payload:values }); 
                    })
                    .then(()=>onClose())
                    .catch(msg=>{
                        message.error(msg);
                        
                    }) 
                }}
            >
                <Row gutter={24}>
                    {
                        actionType === '2'
                        ?
                        <Col span={24}>
                        <Form.Item label='跟进类型:' name='execute_type' rules={[{ validator }]}>
                            <Select>
                                {
                                    executeType.length 
                                    ?
                                    executeType.map(item=>(
                                        <Option key={item.type_id}>{ item.type_name }</Option>
                                    ))
                                    :
                                    null
                                }
                            </Select>
                        </Form.Item>
                        </Col>
                        :
                        null
                    }                        
                    <Col span={24}>
                        <Form.Item label='执行措施:' name='execute_info' rules={[{ validator }]}>
                            <TextArea />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='处理凭证:' name='photos'>
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handlePreview}
                                onChange={handleChange}
                                beforeUpload={handleBeforeUpload}
                                
                            >
                                {
                                    fileList.length >= 4 ? null : uploadButton
                                }
                            </Upload>
                        </Form.Item>
                    </Col>
                   
                    <Col span={24} style={{ textAlign:'center'}}>
                        <Button type='primary' htmlType='submit'>确定</Button>
                        <Button onClick={onClose} style={{ marginLeft:'10px'}}>关闭</Button>
                    </Col>
                </Row>
            </Form>
            <Modal visible={previewInfo.visible} width='1200px' title={previewInfo.title} footer={null} onCancel={()=>setPreviewInfo({ ...previewInfo, visible:false })}>
                <img src={previewInfo.img} style={{ width:'100%'}} />
            </Modal>
        </div>
    )
}

export default AlarmTimeline;