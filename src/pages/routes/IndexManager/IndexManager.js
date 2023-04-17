import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Skeleton, Spin } from 'antd';
import style from '../IndexPage.css';
import InfoList from './components/InfoList';
import PieChart from './components/PieChart';
import TrendLineChart from './components/TrendLineChart';
import AttrBarChart from './components/AttrBarChart';

function IndexManager({ dispatch, global, fields, home }){
    // console.log('index render()');
    let { energyList, energyInfo } = fields;
    let { energyData, warningList, warningLoading, energyPercent, chartInfo, energyType, timeType, dataType, attrChartInfo, attrChartLoading } = home;
    useEffect(()=>{
        dispatch({ type:'home/init'});
        return ()=>{
            dispatch({ type:'home/reset'});
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' }});
        }
    },[])
    return (
        <div className={style['page-container']}>
            <div className={style['card-container-wrapper']} style={{ display:'block', height:'60%', paddingRight:'0' }}>
                <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0', paddingRight:'0' }}>              
                    <InfoList list={energyList} data={energyData} />                  
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0', paddingRight:'0'}}>
                    <div className={style['card-container-wrapper']} style={{ height:'40%', paddingRight:'0' }}>
                        <div className={style['card-container']}>
                            <div className={style['card-title']} style={{ justifyContent:'flex-start' }}>
                                <span>今日告警</span>
                                <span style={{ marginLeft:'20px' }}>总告警数:{ warningList.length } </span>
                            </div>
                            <div className={style['card-content']}>
                                {
                                    warningLoading
                                    ?
                                    <Skeleton active className={style['skeleton']} />
                                    :
                                    <div style={{ overflow:'hidden auto', color:'#8a8a8a', padding:'10px 20px', height:'100%', overflowX:'hidden', overflowY:'auto', backgroundColor:'#f7f7f7' }}>
                                        {
                                            warningList.length 
                                            ?
                                            warningList.map((item,index)=>(
                                                <div key={index}>
                                                    <span>{ item.rule_name  + '--' }</span>
                                                    <span>{ item.mach_name }</span>
                                                    {/* <span>{ item.warning_value + item.warning_info }</span> */}
                                                </div>
                                            ))
                                            :
                                            <span>今日没有任何告警信息</span>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ height:'60%', paddingRight:'0', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(energyPercent).length 
                                ?
                                <PieChart data={energyPercent} activeKey={global.activeKey} />
                                :
                                <Skeleton active className={style['skeleton']} />
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/* 底部模块 */}
            <div className={style['card-container-wrapper']} style={{ display:'block', height:'40%', paddingRight:'0' }}>
                <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ padding:'0' }}>
                        {
                            Object.keys(chartInfo).length 
                            ?
                            <TrendLineChart data={chartInfo} energyList={energyList} energyInfo={energyInfo} timeType={timeType} dataType={dataType} dispatch={dispatch}  />
                            :
                            <Skeleton active className={style['skeleton']} />
                        }
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ padding:'0' }}>
                        {
                            attrChartLoading
                            ?
                            <Skeleton active className={style['skeleton']} />
                            :
                            <AttrBarChart data={attrChartInfo} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(({ global, fields, home })=>({ global, fields, home }))(IndexManager);