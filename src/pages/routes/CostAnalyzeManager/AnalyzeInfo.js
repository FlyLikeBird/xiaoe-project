import React, { useState } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import style from '../IndexPage.css';

function AnalyzeInfo({ data, timeType }) {
    let str = timeType === '3' ? '昨日' : timeType === '2' ? '上月' : timeType === '1' ? '去年' : '';
    return (
        data && data.length 
        ?
        <div className={style['flex-container']}>
            {
                data.map((item,index)=>(
                    <div className={style['flex-item-wrapper']} key={index} style={{ paddingRight:index === data.length - 1 ? '0' : '14px' }}>
                        <div 
                            className={style['flex-item']}
                            style={{ justifyContent:'center', textAlign:'center' }} 
                            // style={{backgroundColor:index===0 ? '#4ea8fc' : index === 1 ? '#56d1ef' : '#709cb4'}}
                        >
                            <div className={style['info']} >{ `${ index === 1 ? str+item.text : item.text }(${item.unit})` }</div>
                            <div className={style['data']}>{ item.data }</div>              
                        </div>
                    </div>
                ))
            }
        </div>
        :
        null
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(AnalyzeInfo, areEqual);
