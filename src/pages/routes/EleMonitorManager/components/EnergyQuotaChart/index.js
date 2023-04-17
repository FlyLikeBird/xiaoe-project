import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Radio, Card, Progress, Button, Spin, message } from 'antd';
import { DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import style from './EnergyQuotaChart.css';
import IndexStyle from '../../../IndexPage.css';
import icons from '../../../../../public/icons/energy-type-blue.png';

const energyIcons = {
    'ele':0,
    'water':2,
    'gas':1,
    'hot':3
};

const energyText = {
    'ele':{
        text:'电',
        unit:'kwh'
    },
    'water':{
        text:'水',
        unit:'m³'
    },
    'gas':{
        text:'气',
        unit:'m³'
    },
    'hot':{
        text:'热',
        unit:'GJ'
    }
}

function ProgressItem({ data, showType, forReport }){
    let quota = showType === '0' ? Math.floor(data.quota) : Math.floor(data.energyQuota);
    let value = showType === '0' ? Math.floor(data.cost) : Math.floor(data.energy);
    return (
        <div className={style['process-item']}>
            <div className={style['icon-container']} style={{ 
                width:forReport ? '24px' : '30px',
                height:forReport ? '24px' : '30px',
                backgroundImage:`url(${icons})`, 
                backgroundPosition:`-${energyIcons[data.key] * ( forReport ? 24 : 30 )}px 0` 
            }}></div>
            <div className={style['info-container']}>
                
                <div>
                    <span>{`用${energyText[data.key].text}${showType === '0' ? '成本':'量'}定额:`}</span>
                    { 
                        quota 
                        ?
                        <span style={{marginLeft:'10px', color:'#1890ff' }}>{quota}</span>
                        :
                        <span style={{marginLeft:'10px'}}><Link to={`/energy/info_manage_menu/quota_manage`}>{ forReport ? '未设置' : '未设置定额' }</Link></span>
                    }
                </div>
                <div className={style['progress-container']}>
                    {
                        !quota ||  value <= quota 
                        ?
                        <div className={style['progress-item']} style={{ width: quota ? `${Math.floor(value/quota*100)}%` : '0', backgroundColor:'#52c41a'}}></div>
                        :
                        <div style={{ width:'100%', height:'100%'}}>
                            <div className={style['progress-item']} style={{ width: Math.floor(quota/value*100) + '%', backgroundColor:'#52c41a', borderTopLeftRadius:'10px', borderBottomLeftRadius:'10px' }}></div>
                            <div className={style['progress-item']} style={{ width: Math.floor(( value - quota )/value*100) + '%', backgroundColor:'#1890ff', borderTopRightRadius:'10px', borderBottomRightRadius:'10px' }}></div>
                        </div>
                    }
                </div>
                   
                <div style={{ display:forReport ? 'block' : 'flex', justifyContent:'space-between'}}>
                    <div>已使用:<span className={style['text']}>{ value }</span>{ showType==='0' ? '元' : energyText[data.key].unit }</div>
                    <div>超出:<span className={style['text']}>{ value > quota ? (value-quota).toFixed(0) : '0'}</span>{ showType==='0' ? '元' : energyText[data.key].unit }</div>
            
                </div>
            </div>
        </div>
    )
}

function EnergyQuotaChart({ data, showType, onToggleTimeType, forReport }) {
    const [timeType, changeTimeType] = useState('2');
    const containerRef = useRef();
    return (   
        <div className={IndexStyle['card-container-wrapper']} style={ forReport ? { width:'100%', paddingRight:'0' } : { width:'50%', paddingRight:'0' }}>
            <div className={IndexStyle['card-container']} style={ forReport ? { backgroundColor:'#f0f0f0', boxShadow:'none' } : {}}>
                <div className={IndexStyle['card-title']} style={ forReport ? { borderBottom:'1px solid #f1f1f1'} : {}}>
                    <div>{`${ showType === '0' ? '成本定额' : '能耗定额'}执行概况`}</div>              
                    <div>
                        <Radio.Group size='small' style={{ top:'0' }} className={IndexStyle['float-button-group'] + ' ' + IndexStyle['custom-radio']} value={timeType} onChange={e=>{
                            if ( !data.length ){
                                message.info('数据加载中，请稍后...');
                                return ;
                            }
                            if ( showType === '0' ) {
                                changeTimeType(e.target.value);
                                onToggleTimeType(e.target.value);
                            }
                        }}>
                            <Radio.Button value='2'>{ showType === '0' ? '本月定额' : '本月能耗' }</Radio.Button>
                            { showType === '0' ? <Radio.Button value='1'>本年定额</Radio.Button> : null }
                            
                        </Radio.Group>     
                    </div>
                </div>
                <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                    {
                        data.length 
                        ?
                        <div ref={containerRef} className={style['process-container']}>
                            {
                                data.map(item=>(
                                    <div key={item.key}>
                                        <ProgressItem data={item} showType={showType} forReport={forReport}  />
                                    </div>
                                ))
                            }
                        </div>  
                        :
                        <Spin size='large' className={style['spin']} /> 
                    }
                </div>
            </div>
        </div>
       
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data 
        || prevProps.showType !== nextProps.showType 
     ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EnergyQuotaChart, areEqual);
