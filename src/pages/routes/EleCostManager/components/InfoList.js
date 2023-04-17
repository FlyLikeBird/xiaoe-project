import React from 'react';
import { formatNum } from '@/pages/utils/parseDate';
import style from '@/pages/routes/IndexPage.css';

function InfoList({ data, energyInfo, showType }){
    let sameRate = showType === '0' ? 'sameRate' : 'sameEnergyRate';
    let adjoinRate = showType === '0' ? 'adjoinRate' : 'adjoinEnergyRate';
    return (
        data.map((item,index)=>(
            <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0' }} key={index}>
                <div style={{ 
                    display:'flex',
                    height:'100%',
                    borderRadius:'4px',
                    alignItems:'center',
                    backgroundColor:'#3f8fff',
                    color:'#fff',
                    position:'relative',
                    textAlign:'center',
                    whiteSpace:'nowrap'
                }}>
                    <div style={{ width:'20%', fontSize:'2rem'}}>{ item.key === 'day' ? '日' : item.key === 'month' ? '月' : '年' }</div>
                    <div style={{ width:'40%'}}>
                        <div>
                            <div className={style['data']} style={{ color:'#fff' }}>{ showType === '0' ? formatNum(item.cost).value + formatNum(item.cost).unit : item.energy + energyInfo.unit  }</div>
                            <div style={{ fontSize:'0.8rem', color:'#a7ccff'}}>{`${ item.key === 'day' ? '今日' : item.key === 'month' ? '本月' : '本年' }总${showType === '0' ? '费用' : '能耗'}`}</div>
                        </div>
                    </div>
                    <div style={{ textAlign:'left', width:'40%' }}>
                        <div>
                            <span style={{ fontSize:'0.8rem', color:'#a7ccff', marginRight:'6px' }}>同比</span>
                            <span className={style['data']} style={{ color:'#fff' }}>{ item[sameRate] ? (+item[sameRate]).toFixed(1) + '%' : '-- --' }</span>
                        </div>
                        <div>
                            <span style={{ fontSize:'0.8rem', color:'#a7ccff', marginRight:'6px' }}>环比</span>
                            <span className={style['data']} style={{ color:'#fff' }}>{ item[adjoinRate] ? (+item[adjoinRate]).toFixed(1) + '%' : '-- --' }</span>
                        </div>
                    </div>
                    <div style={{ 
                        backgroundImage:'linear-gradient(transparent,hsla(0,0%,100%,.3))',
                        position:'absolute',
                        top:'0',
                        left:'0',
                        width:'20%',
                        height:'100%'
                    }}>
                    </div>
                </div>
            </div>
        ))
    )
}

export default InfoList;