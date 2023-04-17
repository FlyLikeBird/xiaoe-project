import React, { useState } from 'react';
import { Radio } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import icons from '../../../../../public/index-icons.png';
import { formatNum } from '../../../utils/parseDate';

const tabStyle = {
    display:'inline-block',
    width:'50%',
    verticalAlign:'top',
    height:'30px',
    lineHeight:'30px',
    textAlign:'center',
    fontSize:'0.8rem',
    borderBottom:'1px solid transparent',
    cursor:'pointer'
}

const dividerStyle = {
    height:'1px',
    backgroundColor:'rgb(226 226 226)'
};

const energyMap = {
    'ele':{ color:'#fcb221', offset:2 },
    'water':{ color:'#61a3ff', offset:3 },
    'gas':{ color:'rgb(39 202 147)', offset:0 },
    'hot':{ color:'#fb5b4c', offset:1 }
}

function InfoItem({ data, energyInfo }){
    const [dataType, setDataType] = useState('cost');
    let monthRate = dataType === 'cost' ? data.monthCostRate : data.monthEnergyRate;
    let yearRate = dataType === 'cost' ? data.yearCostRate : data.yearEnergyRate;
    let dayRate = dataType === 'cost' ? data.dayCostRate : data.dayEnergyRate;
    return (
        <div style={{ height:'100%' }}>
            <div style={{ height:'30px' }}>
                <div style={{
                    ...tabStyle, 
                    color:dataType === 'cost' ? energyMap[energyInfo.type_code].color : '#b3b3b3',
                    borderBottom: dataType === 'cost' ? `1px solid ${energyMap[energyInfo.type_code].color}` : '1px solid transparent'    
                }} onClick={()=>setDataType('cost')}>费用</div>
                <div style={{
                    ...tabStyle, 
                    color:dataType === 'energy' ? energyMap[energyInfo.type_code].color : '#b3b3b3',
                    borderBottom: dataType === 'energy' ? `1px solid ${energyMap[energyInfo.type_code].color}` : '1px solid transparent'    
                }} onClick={()=>setDataType('energy')}>{`能耗(${energyInfo.unit})`}</div>     
            </div>
            <div style={{ whiteSpace:'nowrap', padding:'0 20px', height:'calc(100% - 30px)', display:'flex', flexDirection:'column', justifyContent:'space-around' }}>
                <div>
                    <div style={{ color:energyMap[energyInfo.type_code].color }}>本月用{energyInfo.type_name}</div>
                    <div>
                        <span className={style['data']}>{ dataType === 'cost' ? formatNum(data.monthCost).value : Math.round(data.monthEnergy) }</span>
                        <span className={style['sub-text']} style={{ marginLeft:'6px'}}>{ dataType === 'cost' ? formatNum(data.monthCost).unit : energyInfo.unit }</span>
                    </div>
                    <div className={style['sub-text']}>
                        <span style={{ color: monthRate <= 0 ? '#2ec895' :'#f65647', marginRight:'6px', fontWeight:'bold' }}>{ monthRate <=0 ? <ArrowDownOutlined />: <ArrowUpOutlined />}{ Math.abs(monthRate) + '%' }</span>
                        <span >
                            <span>上月用{energyInfo.type_name}</span>
                            <span style={{ fontWeight:'bold', margin:'0 6px' }}>{ dataType === 'cost' ? formatNum(data.monthLastCost).value : Math.round(data.monthLastEnergy) }</span>
                            <span>{ dataType === 'cost' ? formatNum(data.monthLastCost).unit : energyInfo.unit }</span>
                        </span>
                    </div>
                </div>
                <div style={dividerStyle}></div>
                <div>
                    <div style={{ color:energyMap[energyInfo.type_code].color }}>本年用{energyInfo.type_name}</div>
                    <div>
                        <span className={style['data']}>{ dataType === 'cost' ? formatNum(data.yearCost).value : Math.round(data.yearEnergy) }</span>
                        <span className={style['sub-text']} style={{ marginLeft:'6px'}}>{ dataType === 'cost' ? formatNum(data.yearCost).unit : energyInfo.unit }</span>
                    </div>
                    <div className={style['sub-text']}>
                        <span style={{ color: yearRate <= 0 ? '#2ec895' :'#f65647', marginRight:'6px', fontWeight:'bold' }}>{ yearRate <=0 ? <ArrowDownOutlined />: <ArrowUpOutlined />}{ Math.abs(yearRate) + '%' }</span>
                        <span >
                            <span>上年用{energyInfo.type_name}</span>
                            <span style={{ fontWeight:'bold', margin:'0 6px' }}>{ dataType === 'cost' ? formatNum(data.yearLastCost).value : Math.round(data.yearLastEnergy)}</span>
                            <span>{ dataType === 'cost' ? formatNum(data.yearLastCost).unit : energyInfo.unit  }</span>
                        </span>
                    </div>
                </div>
                <div style={dividerStyle}></div>
                <div>
                    <div style={{ color:energyMap[energyInfo.type_code].color }}>今日用{energyInfo.type_name}</div>
                    <div>
                        <span className={style['data']}>{ dataType === 'cost' ? formatNum(data.dayCost).value : Math.round(data.dayEnergy) }</span>
                        <span className={style['sub-text']} style={{ marginLeft:'6px'}}>{ dataType === 'cost' ? formatNum(data.dayCost).unit : energyInfo.unit }</span>
                    </div>
                    <div className={style['sub-text']}>
                        <span style={{ color: dayRate <= 0 ? '#2ec895' :'#f65647', marginRight:'6px', fontWeight:'bold' }}>{ dayRate <=0 ? <ArrowDownOutlined />: <ArrowUpOutlined />}{ Math.abs(dayRate) + '%' }</span>
                        <span >
                            <span>昨日用{energyInfo.type_name}</span>
                            <span style={{ fontWeight:'bold', margin:'0 6px' }}>{ dataType === 'cost' ? formatNum(data.dayLastCost).value : Math.round(data.dayLastEnergy)}</span>
                            <span>{ dataType === 'cost' ? formatNum(data.dayLastCost).unit : energyInfo.unit }</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoList({ list, data }){
    return (
            
        list.map((item,index)=>(
            <div className={style['card-container-wrapper']} key={index} style={{ width:'25%', paddingBottom:'0' }}>
                <div className={style['card-container']} style={{ overflow:'hidden' }}>
                    <div className={style['card-title']} style={{ height:'50px', lineHeight:'50px', justifyContent:'flex-start', fontWeight:'normal', color:'#fff', borderTopLeftRadius:'6px', borderTopRightRadius:'6px', backgroundColor:`${energyMap[item.type_code].color}` }}>
                        <span style={{ display:'inline-block', width:'28px', height:'28px', backgroundImage:`url(${icons})`, backgroundPosition:`-${energyMap[item.type_code].offset * 28}px 0` }}></span>
                        <span style={{ marginLeft:'6px' }}>用{item.type_name}详情</span>
                    </div>
                    <div className={style['card-content']} style={{ height:'calc( 100% - 50px)', padding:'0' }}>
                        <InfoItem data={data[item.type_code] || {}} energyInfo={item} />
                    </div>
                </div>
            </div>
        ))
            
    )
}

function areEqueal(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(InfoList, areEqueal);