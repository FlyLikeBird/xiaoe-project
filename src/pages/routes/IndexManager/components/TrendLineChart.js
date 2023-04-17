import React, { useEffect, useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio, Spin, Tooltip } from 'antd';
import { DownloadOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import html2canvas from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function TrendLineChart({ data, energyList, energyInfo, timeType, dataType, dispatch }){
    const echartsRef = useRef();
    // console.log('index-page render');
    let category1 = timeType === '1' ? '今日' : timeType === '2' ? '本月' : '本年';
    let category2 = timeType === '1' ? '昨日' : timeType === '2' ? '上月' : '去年';
    let seriesData = [];
    seriesData.push({
        type:'line',
        name:category1,
        itemStyle:{
            color:'#3f8fff'
        },
        smooth:true,
        areaStyle:{
            opacity:0.2,
            color:{
                type:'linear',
                x:0,
                y:0,
                x2:0,
                y2:1,
                colorStops:[
                    { offset:0, color:'#3f8fff'},
                    { offset:1, color:'transparent'}
                ]
            }
        },
        symbol:'none',
        data:data.view.energy.map((value,index)=>{
            return { value:(+value).toFixed(1), ratio:data.view.rate[index] };
        })
    });
    seriesData.push({
        type:'line',
        name:category2,
        symbol:'none',
        itemStyle:{
            color:'#1ec48d'
        },
        smooth:true,
        areaStyle:{
            opacity:0.2,
            color:{
                type:'linear',
                x:0,
                y:0,
                x2:0,
                y2:1,
                colorStops:[
                    { offset:0, color:'#1ec48d'},
                    { offset:1, color:'transparent'}
                ]
            }
        },
        data:data.view.lastEnergy.map(value=>{
            return { value:(+value).toFixed(1) }
        })
    });
    return (
        <div style={{ height:'100%' }}>
            <div className={style['float-button-group']} style={{ left:'100px' }}>
                <Radio.Group size='small' buttonStyle='solid' value={energyInfo.type_id} onChange={e=>{
                    let temp = energyList.filter(i=>i.type_id === e.target.value)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    dispatch({ type:'home/fetchEnergyTrend'});
                }}>
                    {
                        energyList.map((item,index)=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ item.type_name }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <Radio.Group style={{ marginLeft:'10px' }} size='small' buttonStyle='solid' value={dataType} onChange={e=>{
                    dispatch({ type:'home/toggleDataType', payload:e.target.value });
                    dispatch({ type:'home/fetchEnergyTrend'});
                }}>
                    <Radio.Button value='1'>成本</Radio.Button>
                    <Radio.Button value='2'>能耗</Radio.Button>
                </Radio.Group>
            </div>
            
            <div className={style['float-button-group']}>
                <Radio.Group size='small' style={{ marginRight:'10px' }} value={timeType} onChange={e=>{                    
                    dispatch({ type:'home/toggleTimeType', payload:e.target.value });
                    dispatch({ type:'home/fetchEnergyTrend'});
                }}>
                    <Radio.Button value='1' >今日</Radio.Button>
                    <Radio.Button value='2' >本月</Radio.Button>
                    <Radio.Button value='3' >本年</Radio.Button>
                </Radio.Group>
                <Radio.Group size='small' value='data' onChange={e=>{
                    let date = new Date();
                    let value = e.target.value;
                    let fileTitle = category1 + energyInfo.type_name + '能耗对比趋势图';
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false })
                        .then(canvas=>{
                            let MIME_TYPE = "image/png";
                            let url = canvas.toDataURL(MIME_TYPE);
                            let linkBtn = document.createElement('a');
                            linkBtn.download = fileTitle ;          
                            linkBtn.href = url;
                            let event;
                            if( window.MouseEvent) {
                                event = new MouseEvent('click');
                            } else {
                                event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            }
                            linkBtn.dispatchEvent(event);
                        })
                        return ;
                    }
                    if ( value === 'excel' ){
                        let aoa = [], thead = ['对比项','能源类型','单位','时间周期'];
                        data.view.date.forEach(i=>{
                            thead.push(i);
                        })
                        aoa.push(thead);
                        let time = timeType === '1' ? '时' : timeType === '2' ? '日' : '月';
                        seriesData.forEach(item=>{
                            let temp = [];
                            temp.push(item.name);
                            temp.push(energyInfo.type_name);
                            temp.push(dataType === '1' ? '元' : energyInfo.unit );
                            temp.push(time);
                            temp.push(...item.data.map(i=>i.value));
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(()=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
                </Radio.Group>
            </div>
            <ReactEcharts
                ref={echartsRef}
                style={{ height:'100%' }}
                notMerge={true}
                option={{
                    tooltip: { 
                        trigger:'axis',
                        backgroundColor:'#fff',
                        padding:0,
                        formatter:(params)=>{
                            if ( params[0] && params[1] ) {
                                let ratio = params[0].data.ratio;
                                
                                return `<div style="box-shadow:0px 10px 20px #ccc;padding:6px">
                                        <div>
                                            <span style="color:#ccc">${params[0].axisValue}</span>
                                            <span style="margin-left:10px;color:${ratio <=0 ? '#2ec895' :'#f65647'};">${ ratio ? ratio <=0 ? '↓' + Math.abs(ratio) + '%' : '↑' + Math.abs(ratio) + '%' : '--' }</span>
                                        </div>
                                        <div style="color:#505050;">
                                            ${params[0].marker}
                                            <span>${params[0].seriesName}</span>
                                            <span style="margin-left:10px;font-weight:bold;">${params[0].data.value || '-- --'}</span>
                                            <span>${ params[0].data.value ? dataType === '1' ? '元' : energyInfo.unit : '' }</span>
                                        </div>
                                        <div style="color:#505050;">
                                            ${params[1].marker}
                                            <span>${params[1].seriesName}</span>
                                            <span style="margin-left:10px;font-weight:bold;">${params[1].data.value || '-- --'}</span>
                                            <span>${ params[1].data.value ? dataType === '1' ? '元' : energyInfo.unit : '' }</span>
                                        </div>
                                        </div>`
                            } else {
                                return ''
                            }
                        }
                    },  
                    title:{
                        text:'能耗趋势',
                        textStyle:{
                            fontSize:14
                        },
                        left:20,
                        top:10
                    },
                    legend: {
                        show:true,
                        data:[category1,category2],
                        left:'center',
                        top:10
                    },
                    grid:{
                        top:80,
                        left:20,
                        right:20,
                        bottom:20,
                        containLabel:true
                    },
                    xAxis:{
                        type:'category',
                        data:data.view.date,
                        axisTick:{ show:false },
                        axisLine:{
                            show:false
                        }
                    },
                    yAxis:{
                        type:'value',
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        splitLine:{
                            lineStyle:{
                                color:'#dedede'
                            }
                        },
                        name: dataType === '1' ? '元' : energyInfo.unit
                    },
                    series:seriesData
                }}
            />
        </div>     
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(TrendLineChart, areEqual);