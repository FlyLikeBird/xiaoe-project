import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Modal, Skeleton, Button } from 'antd';
import ReactEcharts from 'echarts-for-react';

import style from '../IndexPage.css';
import style2 from './MachManager.css';
import machPng from '../../../../public/terminal-mach.png';
import MachList from './MachList';
import EleMachDetail from './EleMachDetail';
import WaterMachDetail from './WaterMachDetail';

let tagStyle = {
    position:'absolute',
    top:'0',
    right:'0',
    color:'#fff',
    backgroundColor:'rgb(45, 183, 245)',
    padding:'2px 10px',
    fontSize:'0.8rem',
    borderTopRightRadius:'4px',
    borderBottomLeftRadius:'4px'
};
let maskStyle = {
    position:'absolute',
    top:'0',
    left:'0',
    height:'100%',
    width:'30%',
    backgroundImage:'linear-gradient(transparent, rgba(255,255,255,0.3))'
};
function MachManager({ dispatch, terminalMach, global, match, history, location }){
    let { machTypes, currentType, machListInfo, machDetail, total, currentPage, machLoading } = terminalMach ;
    const [currentMach, setCurrentMach] = useState({});
    const [keyword, setKeyWord] = useState('1');
    const echartsRef = useRef();
    useEffect(()=>{
        // 监听路由变化
        dispatch({ type:'terminalMach/init'});
        return ()=>{
            dispatch({ type:'terminalMach/reset'});
        }
    },[]);
    return (
        <div className={style['page-container']}>
            <div style={{ height:'12%' }}>
                {
                    machListInfo.infoList && machListInfo.infoList.length 
                    ?
                    machListInfo.infoList.map((item,index)=>(
                            <div key={index} className={style['card-container-wrapper']} style={{ width:'20%', paddingRight:index === machListInfo.infoList.length - 1 ? '0' : '1rem' }}>
                                <div className={style['card-container']} style={{
                                    display:'flex',
                                    alignItems:'center',
                                    color:'#fff',
                                    padding:'0',
                                    cursor:'pointer',
                                    backgroundImage:'linear-gradient( to bottom, #3777de, #75a8f9)'
                                }} onClick={()=>{
                                    dispatch({ type:'terminalMach/resetPage'});
                                    dispatch({ type:'terminalMach/fetchMachList', payload:{ keyword:item.key }});
                                    setKeyWord(item.key);
                                }}>                           
                                    <div style={{ width:'30%', textAlign:'center', height:'100%', position:'relative' }}>
                                        <div style={{ 
                                            backgroundImage:`url(${machPng})`,
                                            backgroundRepeat:'no-repeat',
                                            backgroundPosition:`-${index*40}px 0px`, 
                                            width:'40px',
                                            height:'45px',
                                            position:'absolute',
                                            left:'50%',
                                            top:'50%',
                                            transform:'translate(-50%,-50%)'                                 
                                        }}></div>
                                    </div>
                                    <div style={{ width:'70%', paddingLeft:'20px' }}>
                                        <div className={style['data']} style={{ color:'#fff' }}>{ item.value }</div>
                                        <div className={style['sub-text']}>{ item.title }</div>
                                    </div>
                                    <div style={maskStyle}></div> 
                                    {
                                        keyword === item.key 
                                        ?
                                        <div style={tagStyle}>当前</div>                   
                                        :
                                        null
                                    }
                                </div>
                            </div>
                    ))
                    :
                    <div className={style['card-container']}><Skeleton active className={style['card-container']} /></div>
                }
            </div>
            
            <div style={{ height:'88%', paddingBottom:'1rem' }}>
                <div className={style2['menu-container']}>
                    <div className={style2['menu-title']}>设备在线率</div>
                    <div className={style2['menu-chart']}>
                        <div style={{ flex:'1'}}><span className={style['data']} style={{ color:'#fff' }}>{ machListInfo.total_meter ? Math.floor( machListInfo.total_meter - machListInfo.outline_meter ) : 0 }</span> / <span className={style['sub-text']}>{ machListInfo.total_meter ? machListInfo.total_meter : 0 }</span></div>
                        <div style={{ flex:'1'}}>
                            <ReactEcharts 
                                notMerge={true}
                                style={{ width:'100%', height:'100%'}}
                                option={{
                                    polar:{
                                        radius:['64%','80%']
                                    },
                                    angleAxis:{
                                        show:false,
                                        max:machListInfo.total_meter
                                    },
                                    radiusAxis:{
                                        type:'category',
                                        show:true,
                                        axisLabel:{ show:false },
                                        axisLine:{ show:false },
                                        axisTick:{ show:false }
                                    },
                                    graphic:{
                                        type:'text',
                                        left:'center',
                                        top:'46%',
                                        style:{
                                            text:`${machListInfo.total_meter ? Math.floor((machListInfo.total_meter - machListInfo.outline_meter)/machListInfo.total_meter * 100) : 0}%`,
                                            textAlign:'center',
                                            fill:'#ffc654',
                                            fontWeight:'bold',
                                            fontSize:14
                                        }
                                    },
                                    series:[{
                                        type:'bar',
                                        roundCap:true,
                                        coordinateSystem:'polar',
                                        barWidth:30,
                                        showBackground:true,
                                        backgroundStyle:{
                                            color:'#89b4f6'
                                        },
                                        itemStyle:{
                                            color:'#f5a60a'
                                        },
                                        data:[machListInfo.total_meter ? machListInfo.total_meter - machListInfo.outline_meter : 0]
                                    }]
                                }}
                            />
                        </div>
                    </div>
                    <div className={style2['menu-list']}>
                        {
                            machTypes.map((menu,index)=>(
                                <div key={index} className={ menu.key === currentType.key ? style2['menu-item'] + ' ' + style2['selected'] : style2['menu-item']} onClick={()=>{
                                    let temp = machTypes.filter(i=>i.key === menu.key )[0];
                                    dispatch({ type:'terminalMach/toggleMachType', payload:temp });
                                    dispatch({ type:'terminalMach/fetchMachList', payload:{ keyword }});
                                }}>
                                    <div>{ menu.title }</div>
                                    <div>{ menu.count }</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className={style2['main-content']}>               
                    <MachList 
                        dispatch={dispatch} 
                        machList={machListInfo.meterList} 
                        currentType={currentType}
                        currentPage={currentPage} 
                        total={total}
                        keyword={keyword}
                        onSelect={(item)=>setCurrentMach(item)} 
                        containerWidth={global.containerWidth}
                    />  
                </div>
            </div>
            <Modal 
                width='80vw' 
                height='80vh' 
                bodyStyle={{ height:'80vh' }}
                visible={Object.keys(currentMach).length ? true : false } 
                cancelText='关闭' 
                onCancel={()=>setCurrentMach({})} 
                closable={true}
                destroyOnClose={true}
                footer={null}
                
            >
                
                {
                    currentMach.energy_type === 1 
                    ?
                    <EleMachDetail 
                        dispatch={dispatch}
                        machDetail={machDetail}
                        currentMach={currentMach}
                        machLoading={machLoading}
                    />
                    :
                    currentMach.energy_type === 2 
                    ?
                    <WaterMachDetail
                        dispatch={dispatch}
                        machDetail={machDetail}
                        currentMach={currentMach}
                        machLoading={machLoading}
                    />
                    :
                    null
                }
                
            </Modal>
        </div>
    )
}

export default connect(({ terminalMach, global })=>({ terminalMach, global }))(MachManager);