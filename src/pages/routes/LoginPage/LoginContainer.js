import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Select, Modal, message, Tooltip } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { md5 } from '@/pages/utils/encryption';
import wxCodeImg from '../../../../public/wxCode.jpg';
import wxAppImg from '../../../../public/wxApp.jpg';
import style from './LoginPage.css';
import logo from '../../../../public/login-logo.png';
import AMapLoader from '@amap/amap-jsapi-loader';

const { Option } = Select;
const { Search } = Input;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{6,20}$/ ;
let msg = '密码必须包含字母、数字、特殊字符且长度为6-20位';

let AMap;
let map;
let points = [];
let vcodeCounting = false;
let timer = null;

function LoginContainer({ dispatch, global }){
    const { newThirdAgent } = global;
    const [isLogined, setLogined] = useState(true);
    const [visible, setVisible] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({});
    const [vcodeTime, setVcodeTime] = useState(5*60);
    const [form] = Form.useForm();
    function handleSendAuthCode(){
        form.validateFields(['phone'])
        .then(values=>{
            dispatch({ type:'global/fetchVCode', payload:values['phone']});
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
        })
    }
   
    useEffect(()=>{
        return ()=>{
            AMap = null;
            map = null;
            points=[];
            clearInterval(timer);
            timer = null;
        }
    },[])
    useEffect(()=>{
        if ( visible ) {
            AMapLoader.load({
                key:'26dbf93c4af827e4953d7b72390e3362',
            })
            .then((MapInfo)=>{
                AMap = MapInfo;
                map = new AMap.Map('my-map',{
                    resizeEnable:true
                });
            })
            .catch(e=>{
                console.log(e);
            })
        }
    },[visible])
    return (
        <div className={style['login-container']}>
                {/* <img src={logo}  style={{ height:'100%' }} />
                <Tooltip title='扫描关注即可接收每日能耗信息和告警日报'>
                    <img src={wxCodeImg} style={{ height:'100%'}} />
                </Tooltip> */}
            <div style={{ whiteSpace:'nowrap', height:'10vh', fontSize:'2.4rem', color:'#404040', margin:'20px 0', letterSpacing:'0.2rem', display:'flex', alignItems:'center' }}>
                <span>欢迎{ isLogined ? '登录' : '注册' }</span>
                {
                    newThirdAgent.logo_path === 'http://api.h1dt.com/images/product/xe-w.png'
                    ?
                    <span style={{ color:'#3f8fff' }}>小e物联</span>
                    :
                    null
                }
                <img src={  newThirdAgent.logo_path === 'http://api.h1dt.com/images/product/xe-w.png' ? '' : newThirdAgent.logo_path } style={{ height:'6vh' }} />
            </div>
            {
                isLogined 
                ?
                <Form form={form} className={style['login-form']}>
                    <Form.Item name='phone'>
                        <Input style={{ height:'6vh', fontSize:'1.2rem' }} prefix={<UserOutlined style={{ fontSize:'1.4rem' }} />} placeholder='请输入账号'/>
                    </Form.Item>
                    <Form.Item name='password'>
                        <Input.Password style={{ height:'6vh' }} placeholder='请输入密码' prefix={<LockOutlined style={{ fontSize:'1.4rem' }} />} />
                    </Form.Item>
                    <Form.Item name='vcode'>
                        <Input style={{ height:'6vh' }} placeholder='请输入短信验证码' suffix={
                            vcodeCounting
                            ?
                            <span style={{ color:'#4b96ff', cursor:'pointer' }} >{`有效期:${Math.floor(vcodeTime/60)}分${Math.floor(vcodeTime%60)}秒`}</span>
                            :
                            <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>handleSendAuthCode()}
                        >发送验证码</span>}/>
                    </Form.Item>
                </Form>
                :
                <Form form={form} className={style['login-form']}>
                    <Form.Item name='phone' rules={[{ required:true, message:'请输入联系方式'}, { pattern:phoneReg, message:'请输入合法的手机号码'}]}>
                        <Input style={{ height:'6vh' }} placeholder='请输入手机号' prefix={<span>+86</span>}  />
                    </Form.Item>
                    <Form.Item name='vcode' rules={[{ required:true, message:'验证码不能为空' }]}>
                        <Input style={{ height:'6vh' }} placeholder='请输入短信验证码' suffix={
                            vcodeCounting
                            ?
                            <span style={{ color:'#4b96ff', cursor:'pointer' }} >{`有效期:${Math.floor(vcodeTime/60)}分${Math.floor(vcodeTime%60)}秒`}</span>
                            :
                            <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>handleSendAuthCode()}
                        >发送验证码</span>}/>
                    </Form.Item>
                    <Form.Item name='company_name' rules={[{ required:true, message:'请输入公司名称' }]}>
                        <Input style={{ height:'6vh' }} placeholder='请输入公司名称' />
                    </Form.Item>
                    <Form.Item>
                        {
                            Object.keys(companyInfo).length
                            ?
                            <div style={{ display:'flex', alignItems:'center', padding:'0 10px', height:'6vh', border:'1px solid #d9d9d9', borderRadius:'2px' }}>
                                <span style={{ flex:'1', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{ `${companyInfo.company_name} | ${companyInfo.address}` }</span>
                                <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>setVisible(true)}>重新定位</span>
                            </div>
                            :
                            <Button onClick={()=>setVisible(true)}>选择公司位置</Button>
                        }
                    </Form.Item>
                    <Form.Item name='register_password' rules={[{ required:true, message:'密码不能为空' },{ pattern:passwordReg, message:msg }]}>
                        <Input.Password style={{ height:'6vh' }} type='password' placeholder='设置初始密码' />
                    </Form.Item>
                    <Form.Item name='register_confirm_password' rules={[{ required:true, message:'密码不能为空'}, { pattern:passwordReg, message:msg }]}>
                        <Input.Password style={{ height:'6vh' }} type='password' placeholder='再次输入密码' />
                    </Form.Item>
                </Form>
            }
            {
                isLogined
                ?
                <div>
                    <div className={style['button'] + ' ' + style['login']} onClick={()=>{
                        form.validateFields()
                        .then(values=>{
                            new Promise((resolve, reject)=>{
                                let obj = { phone:values.phone, vcode:values.vcode, password:md5(values.password, values.phone)}
                                dispatch({ type:'global/login', payload:{ values:obj, resolve, reject }})
                            })
                            .catch(msg=>message.error(msg));
                        })
                       
                    }}>登录</div>
                    <div style={{ height:'1px', width:'170px', margin:'30px auto', backgroundColor:'#e5e5e5', position:'relative', color:'#e5e5e5' }}>
                        <span style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', padding:'0 20px', backgroundColor:'#fff' }}>or</span>
                    </div>
                    <div className={style['button'] + ' ' + style['register']} onClick={()=>setLogined(false)}>注册</div>
                </div>
                :
                <div>
                    <div className={style['button'] + ' ' + style['register']} onClick={()=>{
                        form.validateFields()
                        .then(values=>{
                            if ( !Object.keys(companyInfo).length){
                                message.info('请选择公司位置');
                                return;
                            } 
                            if ( values.register_password !== values.register_confirm_password ) {
                                message.info('两次密码输入不一致');
                                return;
                            }
                            let password = md5(values['register_password'], values['phone']);                            
                            let obj = { ...companyInfo, company_name:values.company_name, phone:values.phone, vcode:values.vcode, password, confirm_password:password };
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'global/register', payload:{ values:obj, resolve, reject } });
                            })
                            .then(()=>{
                                message.info('注册用户成功');
                                setLogined(true);
                            })
                            .catch(msg=>{
                                message.error(msg);
                            })
                        })
                        .catch(err=>{
                            console.log(err);
                        })
                    }}>立即注册</div>
                    <div style={{ fontSize:'1rem', marginTop:'10px' }}>
                        <span>已有账号,</span>
                        <span style={{ color:'#4b96ff', cursor:'pointer' }} onClick={()=>{
                            setVcodeTime(5*60);
                            setLogined(true);
                            vcodeCounting = false;
                            clearInterval(timer);
                        }}>立即登录</span>
                    </div>
                </div>
            }
            {
                newThirdAgent.logo_path === 'http://api.h1dt.com/images/product/xe-w.png'
                ?
                <div style={{ margin:'20px 0', height:'10vh', display:'flex', justifyContent:'space-around', textAlign:'center' }}>
                    <div>
                        <div>公众号</div>
                        <img src={wxCodeImg} style={{ height:'10vh' }} />
                    </div>
                    <div>
                        <div>小程序</div>
                        <img src={wxAppImg} style={{ height:'10vh' }} />
                    </div>
                </div>
                :
                null
            }
            
            <Modal visible={visible} footer={null} onCancel={()=>setVisible(false)} width='848px' destroyOnClose={true} title={
                <div>
                    <Search style={{ width:'260px' }} placeholder='请输入公司名称' onSearch={value=>{            
                        if(AMap && value ){
                            AMap.plugin('AMap.PlaceSearch',function(){
                                let placeSearch = new AMap.PlaceSearch({
                                    extensions:'all',
                                });
                                placeSearch.search(value,function(status, result){
                                    if ( points.length && map.remove ) map.remove(points);
                                    if ( status === 'complete' && result.poiList.pois && result.poiList.pois.length ) {
                                        // 搜索到结果,默认取第一条搜索值
                                        let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
                                        result.poiList.pois.forEach(point=>{ 
                                            let pos = [point.location.lng, point.location.lat];
                                            let marker = new AMap.Marker({
                                                position:pos,
                                                map
                                            });
                                            marker.extData = { company_name:point.name, lng:pos[0], lat:pos[1], address:point.address, province:point.pname, city:point.cityname, area:point.adname };
                                            marker.content = `<div><p style="font-weight:bold;">${point.name}</p><p>地址:${point.address}</p><p>电话:${point.tel}</p></div>`;
                                            marker.on('mouseover', handleShowInfo);
                                            marker.on('click',handleClick);  
                                            points.push(marker);                               
                                        });
                                       
                                        function handleClick(e){
                                            setCompanyInfo(e.target.extData);
                                            setVisible(false);
                                        }
                                        function handleShowInfo(e){
                                            infoWindow.setContent(e.target.content);
                                            infoWindow.open(map, e.target.getPosition());
                                        }
                                        map.setFitView();
                                        
                                    } else {
                                        message.info('请输入完整的公司名称');
                                    }
                                });
                            })
                        } else {
                            message.info('公司名称不能为空');
                        }
                    }}/>
                </div>
            }>
                <div id='my-map' style={{ width:'800px', height:'600px' }}></div>
            </Modal>
        </div>
    )
}

export default connect(({ global })=>({ global }))(LoginContainer);