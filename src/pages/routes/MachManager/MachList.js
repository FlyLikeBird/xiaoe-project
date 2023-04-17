import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Spin, Pagination, Tooltip } from 'antd';
import style from './MachManager.css';
import IndexStyle from '../IndexPage.css';

const styleObj = {
    display:'inline-block',
    whiteSpace:'nowrap',
    fontSize:'0.8rem', 
    color:'#3e8fff', 
    marginLeft:'4px',
    verticalAlign:'top',
    overflow:'hidden',
    textOverflow:'ellipsis'
};



function MachList({ dispatch, machList, total, keyword, currentPage, currentType, containerWidth, onSelect }){
    let isSmallDevice = containerWidth <= 1440 ? true : false;
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                machList  
                ?
                machList.length 
                ?
                <div style={{ height:'100%'}}>
                    <div style={{ height:'96%'}}>
                        {
                            machList.map((mach,index)=>(
                                <div key={mach.mach_id} className={style['inline-item-container-wrapper']} style={{ width: '25%', height: '25%'}}>
                                   
                                        <div key={mach.mach_id} className={ mach.rule_name ? `${style['inline-item-container']} ${style['error']}` : style['inline-item-container']} onClick={()=>{
                                            onSelect(mach);
                                        }}>
                                            {
                                                mach.img_path 
                                                ?
                                                <img src={mach.img_path} style={{ height:'80%', width:'auto'}}/>
                                                :
                                                <div style={{ height:'80%', width:'30%', display:'flex', alignItems:'center', textAlign:'center', margin:'10px', backgroundColor:'rgb(251 251 251)'}}>
                                                    暂无产品图片
                                                </div>
                                            }
                                            <div style={{ whiteSpace:'nowrap', flex:'1' }}>
                                                <div>
                                                    <span className={IndexStyle['sub-text']} style={{ verticalAlign:'top' }}>编号:</span>                                                
                                                    <Tooltip title={mach.register_code}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{mach.register_code || '-- --'}</span></Tooltip>                             
                                                </div>
                                                <div>
                                                    <span className={IndexStyle['sub-text']} style={{ verticalAlign:'top' }}>支路:</span>
                                                    <Tooltip title={mach.branch_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{mach.branch_name || '-- --'}</span></Tooltip>                              
                                                </div>                                           
                                                <div>
                                                    <span className={IndexStyle['sub-text']} style={{ verticalAlign:'top' }}>区域:</span>
                                                    <Tooltip title={mach.region_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{mach.region_name || '-- --'}</span></Tooltip>                             
                                                </div>
                                                <div>
                                                    <span className={IndexStyle['sub-text']} style={{ verticalAlign:'top' }}>告警:</span>
                                                    <Tooltip title={mach.rule_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{mach.rule_name || '-- --'}</span></Tooltip>                             
                                                </div>
                                            </div>
                                            <div className={style['extra-info']}>
                                                <span className={style['dot']} style={{ backgroundColor:mach.rule_name ? '#fd6051' : '#31cb98' }}></span>
                                                <Tooltip title={mach.model_desc}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px', color:'#5d5d5d' }}>{mach.model_desc}</span></Tooltip>                             
                                            </div>
                                        </div>
                                </div>
                            ))
                        }
                    </div>
                    {
                        total > 16 
                        ?
                        <div style={{ height:'4%'}}>
                            <Pagination size={ isSmallDevice ? 'small' : 'default'} current={+currentPage} showSizeChanger={false} defaultPageSize={16} total={total} onChange={page=>{
                                dispatch({ type:'terminalMach/setCurrentPage', payload:page });
                                dispatch({ type:'terminalMach/fetchMachList', payload:{ keyword } });

                            }}/>
                        </div>
                        :
                        null
                    }
                    
                </div>
                :
                <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)'}}>{`${currentType.title}设备为空`}</div>
                :
                <Spin className={style['spin']} />
            }
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.machList !== nextProps.machList || prevProps.currentPage !== nextProps.currentPage ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MachList, areEqual);