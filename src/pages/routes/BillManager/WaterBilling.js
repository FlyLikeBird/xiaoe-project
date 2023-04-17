import React, { useState, useEffect } from 'react';
import { Button, Input, message, Tag } from 'antd';
import style from '@/pages/routes/IndexPage.css';

function WaterBilling({ dispatch, billing }){
    let { feeRate } = billing;
    const [value, setValue] = useState('');
    const [editing, toggleEditing] = useState(false);
    useEffect(()=>{
        setValue(feeRate.water ? feeRate.water.price : '');
    },[feeRate])
    return (
        <div className={style['card-container']} style={{ padding:'2rem 1rem' }}>
            {
                editing 
                ?
                <div style={{ display:'flex', alignItems:'center' }}>
                    <div>水费费率:</div>
                    <Input style={{ width:'240px', margin:'0 10px 0 4px' }} value={value} onChange={e=>setValue(e.target.value)}/>
                    <div>
                        <Button type='primary' onClick={()=>{
                            if ( value && value >= 0 ) {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'billing/setFeeRate', payload:{ resolve, reject, water_rate:value }});
                                })
                                .then(()=>{
                                    message.success('设置水费成功');
                                    toggleEditing(false);
                                })
                                .catch(msg=>message.info(msg))
                            } else {
                                message.info('请输入合适的水费费率');

                            }
                        }}>确定</Button>
                        <Button style={{ marginLeft:'6px' }} onClick={()=>toggleEditing(false)}>取消</Button></div>    
                </div>
                :
                <div>
                    <div>当前水费费率:<span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px' }}>{ feeRate.water ? feeRate.water.price : '-- --'}</span></div>
                    <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                        toggleEditing(true);
                    }}>设置</Button></div>
                </div>
            }
            
            
        </div>
    )
}

export default WaterBilling;