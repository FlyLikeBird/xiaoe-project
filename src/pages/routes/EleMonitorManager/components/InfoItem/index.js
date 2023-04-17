import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';
import style from '../../../IndexPage.css';
const labelStyle = {
    display:'inline-block',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold'
};
function InfoItem({ data, energyInfo, showType }) {
    let { key, cost, energy, adjoinEnergyRate, adjoinRate, sameEnergyRate, sameRate } = data;
    adjoinRate = showType === '0' ? adjoinRate : adjoinEnergyRate;
    sameRate = showType === '0' ? sameRate : sameEnergyRate;
    let value = showType === '0' ? cost : energy ;
    return (     
        <div className={style['flex-container']}>
            <div className={style['flex-item']}>
                <span style={{...labelStyle, backgroundColor: key === 'day' ? '#af2aff' : key === 'month' ? '#6dcffb' : '#ffc177'}}>{ key === 'day' ? '日' : key === 'month' ? '月' : '年' }</span>
            </div>
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>
                    {
                        key === 'day' ? energyInfo.type_id === 0 ? `今日总${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.type_id === 0 ? 'kgce' : energyInfo.unit })` : `今日${ energyInfo.type_name} ${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.unit })` :
                        key === 'month' ? energyInfo.type_id === 0 ? `本月总${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.type_id === 0 ? 'kgce' : energyInfo.unit })` : `本月${ energyInfo.type_name} ${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.unit })` :
                        key === 'year' ? energyInfo.type_id === 0 ? `年度总${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.type_id === 0 ? 'kgce' : energyInfo.unit })` : `本年${ energyInfo.type_name} ${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.unit })` :
                        null
                    }
                </span>
                <br/>
                <span className={style['data']} ><CountUp  start={0} end={Math.floor(+value)} useGrouping={true} separator=',' decimal='.' /></span>
            </div>  
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>同比</span>
                <br/>
                {
                    !sameRate
                    ?
                    <span className={style['data']}>-- --</span>
                    :
                    <span className={`${style['data']} ${style[ sameRate < 0 ? 'down' : 'up']}`}>
                        { Math.abs(sameRate).toFixed(1) + '%' }
                        { sameRate < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }} /> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> }                        
                    </span>
                }
            
            </div>    
            <div className={style['flex-item']} style={{ flex:'1' }}>
                <span>环比</span>
                <br/>
                {
                    !adjoinRate
                    ?
                    <span className={style['data']}>-- --</span>
                    :
                    <span className={`${style['data']} ${style[ adjoinRate < 0 ? 'down' : 'up']}`}>
                        { Math.abs(adjoinRate).toFixed(1) + '%' }
                        { adjoinRate < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }}/> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> }
                        
                    </span>
                }
            </div>                        
        </div>         
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data != nextProps.data || prevProps.showType != nextProps.showType ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(InfoItem, areEqual);
