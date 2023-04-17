import React, { useState, useEffect, useRef } from 'react';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Form, InputNumber, Table, DatePicker, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import EleReport from './PreviewReport/EleReport';
import WaterReport from './PreviewReport/WaterReport';
import style from '../../../IndexPage.css';
const curDate = new Date();
let feeRate = null;

function validator(a,value){
    if ( !value && typeof value !== 'number' ){
        return Promise.reject('单价不能为空');
    }
    if ( typeof +value !== 'number') {
        return Promise.reject('请填入合适的单价');
    } else if ( value < 0 ){
        return Promise.reject('单价不能为负数');
    } else {
        return Promise.resolve();
    }
}
const layout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 15 },
};
function ReportDocument({ currentField, currentAttr, companyInfo, documentInfo, rateInfo, energyInfo, dispatch, onFetchDocument, onTranslateImg, onCreateDocument, theme }) {
    let textColor = theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.85)';
    const inputRef = useRef();
    const [preview, setPreview] = useState(false);
    const [cost_mode, setCostMode] = useState('company');
    const [date, setDate] = useState(moment(`${curDate.getFullYear()}-${curDate.getMonth()+1}`,'YYYY-MM'));
    const [form] = Form.useForm();
    const [isLoading, setLoading] = useState(false);
    useEffect(()=>{ 
        if ( rateInfo ){
            if ( energyInfo.type_code === 'ele' && rateInfo['ele'] ) {
                form.setFieldsValue({
                    cost_mode:'company',
                    tip_price:rateInfo['ele'].tip,
                    high_price:rateInfo['ele'].high,
                    middle_price:rateInfo['ele'].middle,
                    bottom_price:rateInfo['ele'].bottom,
                });
            }
            if ( energyInfo.type_code === 'water' && rateInfo['water'] ) {
                form.setFieldsValue({
                    person_price:rateInfo['water'].price
                })
            }
        }
    },[energyInfo]);
    return (  
        <div className={style['card-container']}>
            <Form
                {...layout}
                form={form}
                style={{ width:'600px', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:'red' }}
            >
                <Form.Item label='当前公司'>
                    <span style={{ color:textColor }}>{ companyInfo ? companyInfo.company_name : '' }</span>
                </Form.Item>
                <Form.Item label='当前维度属性'>
                    <span style={{ color:textColor }}>{`${currentField.field_name || '未设置'} - ${currentAttr.title || '未设置' }`}</span>
                </Form.Item>
                <Form.Item label='选择日期' rules={[{ required: true, message:'请选择一个时间' }]}>
                    <DatePicker style={{ width:'100%' }} ref={inputRef} allowClear={false} picker="month" onChange={date=>{
                        setDate(date);
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }} locale={zhCN} value={date} />
                </Form.Item>
                {
                    energyInfo.type_id === '1' 
                    ?
                    <Form.Item name='cost_mode' label='计费模式' rules={[ {required:true, messsage:'请选择一种计费模式'}]}>
                        <Radio.Group onChange={e=>setCostMode(e.target.value)}>
                            <Radio value='company'>工业</Radio>
                            <Radio value='person'>民用</Radio>
                        </Radio.Group>
                    </Form.Item>
                    :
                    null
                }
                
                {
                    energyInfo.type_id === '1' && cost_mode === 'company' 
                    ?
                    <Form.Item name='tip_price' label="尖时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }    
                {
                    energyInfo.type_id === '1' && cost_mode === 'company' 
                    ?
                    <Form.Item name='high_price' label="峰时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    energyInfo.type_id === '1' && cost_mode === 'company'
                    ?
                    <Form.Item name='middle_price' label="平时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    energyInfo.type_id === '1' && cost_mode === 'company'
                    ?
                    <Form.Item name='bottom_price' label="谷时段单价" rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                {
                    cost_mode === 'person' || energyInfo.type_id !== '1'
                    ?
                    <Form.Item name='person_price' label={`${energyInfo.type_name}费单价`} rules={[{ validator }]}>
                        <InputNumber style={{width:'100%'}}/>
                    </Form.Item>
                    :
                    null
                }
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 9 }}>
                    <Button type="primary" style={{ marginRight:'10px' }} onClick={()=>{
                        form.validateFields(['cost_mode', 'tip_price', 'high_price','middle_price','bottom_price','person_price'])
                            .then(values=>{
                                if ( Object.keys(currentAttr).length && Object.keys(currentField).length ){
                                    setLoading(true);
                                    let dateStr = date.format('YYYY-MM').split('-');
                                    let payload = { ...values };
                                    if ( energyInfo.type_code === 'ele' ) {
                                        if ( values.cost_mode === 'person') {
                                            payload['tip_price'] = values.person_price;
                                            payload['high_price'] = values.person_price;
                                            payload['middle_price'] = values.person_price;
                                            payload['bottom_price'] = values.person_price;
                                        }
                                    } else if ( energyInfo.type_code === 'water') {
                                        payload['price'] = values.person_price;
                                    }
                                    
                                    new Promise((resolve, reject)=>{
                                        onFetchDocument({ data:{ ...payload, year:dateStr[0], month:dateStr[1] }, resolve, reject })
                                    })
                                    .then(()=>{
                                        setPreview(true);
                                        setLoading(false);                      
                                    })
                                } else {
                                    message.info(`请先设置${energyInfo.type_name}能源维度信息`);
                                }                       
                            })
                            .catch(err=>{
                                console.log(err);
                            })
                    }}>预览报告</Button>
                </Form.Item>
            </Form>
            <Modal visible={preview} footer={null} onCancel={()=>setPreview(false)} closable={false} destroyOnClose={true} width='1200px'>               
                {/* 根据不同能源类型显示不同能源预览报告 */}
                {
                    energyInfo.type_code === 'ele' 
                    ?
                    <EleReport 
                        currentField={currentField}
                        currentAttr={currentAttr}
                        companyInfo={companyInfo} 
                        documentInfo={documentInfo} 
                        energyInfo={energyInfo}
                        onTranslateImg={onTranslateImg}
                        onCancel={()=>setPreview(false)} 
                        costMode={cost_mode}
                        onCreateDocument={onCreateDocument}
                        date={date}
                    /> 
                    :
                    energyInfo.type_code === 'water'
                    ?
                    <WaterReport 
                        currentField={currentField}
                        currentAttr={currentAttr}
                        companyInfo={companyInfo} 
                        documentInfo={documentInfo} 
                        energyInfo={energyInfo}
                        onTranslateImg={onTranslateImg}
                        onCancel={()=>setPreview(false)} 
                        costMode={cost_mode}
                        onCreateDocument={onCreateDocument}
                        date={date}
                    />
                    :
                    null
                }
                          
            </Modal>
            {
                isLoading
                ?
                <div style={{ position:'fixed', top:'0', left:'0', right:'0', bottom:'0', backgroundColor:'rgba(0,0,0,0.8)'}}>
                    <Spin size='large' style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)'}} tip="结算单生成中，请稍后..." />
                </div>
                :
                null
            }
        </div>
    );
}

export default ReportDocument;
