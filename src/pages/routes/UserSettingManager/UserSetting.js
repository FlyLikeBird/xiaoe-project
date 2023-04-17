import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, message } from 'antd';
import style from '../IndexPage.css';
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{6,20}$/ ;
let msg = '密码必须包含字母、数字、特殊字符且长度为6-20位';
let vcodeCounting = false;
let timer = null;

function UserSettingManager({ dispatch, global }){
    const { userInfo, currentCompany } = global;
    const [form] = Form.useForm();
    const [vcodeTime, setVcodeTime] = useState(5*60);
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    const tailLayout = {
      wrapperCol: { offset: 6, span: 18 },
    };
    useEffect(()=>{
        if ( form && form.setFieldsValue ){
            form.setFieldsValue({
                'username':userInfo.user_name,
                'company':currentCompany.company_name
            })
        }
        return ()=>{
            clearInterval(timer);
            timer = null;
            vcodeCounting = false;
        }
    },[])
    function handleSendAuthCode(){
        dispatch({ type:'global/fetchVCode', payload:userInfo.user_name });
        vcodeCounting = true;
        timer = setInterval(()=>{
            setVcodeTime(vcodeTime=>{
                if ( vcodeTime === 0 ) {
                    vcodeCounting = false;
                    clearInterval(timer);
                    setVcodeTime(5*60);
                }
                return vcodeTime - 1;
            });
        },1000) 
    }
    return (
        <div className={style['block-container']} style={{ padding:'20px', position:'relative' }}>
            <Form
                { ...layout }
                style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)'}}
                form={form}
                onFinish={values=>{
                    let { password, confirm_password, vcode } = values;
                    if ( password !== confirm_password ){
                        message.info('两次密码输入不一致');
                        return ;
                    } else {
                        new Promise((resolve, reject)=>{
                            dispatch({type:'global/update', payload:{ values:{ user_id:userInfo.user_id, vcode, password, confirm_password }, resolve, reject }})
                        })
                        .then(()=>{
                            message.info('修改用户信息成功!');
                            vcodeCounting = false;
                            setVcodeTime(5*60);
                            clearInterval(timer);
                            form.setFieldsValue({
                                'vcode':'',
                                'password':'',
                                'confirm_password':''                                
                            });

                        })
                        .catch(msg=>{
                            message.error(msg);
                        })
                    }
                }}
            >
                <Form.Item label='用户名' name='username'>
                    <Input style={{ width:'300px' }} disabled/>
                </Form.Item>
                <Form.Item label='所属公司' name='company'>
                    <Input style={{ width:'300px' }} disabled/>
                </Form.Item>
                <Form.Item label='验证码' name='vcode' rules={[{ required:true, message:'验证码不能为空' }]}>
                    <Input style={{ width:'300px' }}  placeholder='请输入短信验证码' suffix={
                        vcodeCounting
                        ?
                        <span style={{ color:'#4b96ff' }} >{`有效期:${Math.floor(vcodeTime/60)}分${Math.floor(vcodeTime%60)}秒`}</span>
                        :
                        <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>handleSendAuthCode()}
                    >发送验证码</span>}/>
                </Form.Item> 
                <Form.Item label='密码' name='password' rules={[{ required:true, message:'密码不能为空' },{ pattern:passwordReg, message:msg }]}>
                    <Input.Password style={{ width:'300px' }}  type='password' placeholder='输入新密码' />
                </Form.Item>
                <Form.Item label='确认密码' name='confirm_password' rules={[{ required:true, message:'密码不能为空'}, { pattern:passwordReg, message:msg }]}>
                    <Input.Password style={{ width:'300px' }}  type='password' placeholder='再次输入新密码' />
                </Form.Item> 
                <Form.Item { ...tailLayout}>
                    <Button type='primary' htmlType='submit'>修改</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default React.memo(connect(({ global })=>({ global }))(UserSettingManager));