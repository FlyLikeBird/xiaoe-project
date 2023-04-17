import React, { useState, useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, Tooltip, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';

function MeasureBarChart({ data, timeType, theme, forReport }) { 
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const [showType, toggleShowType] = useState('cost');
    const seriesData = [];
    let title = showType === 'cost' ? '电费' : '电量';
    if ( data.tipCost.filter(i=>i).length !== 0 ) {
        seriesData.push({
            type:'bar',
            name:`尖时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#fd6e4c'
            },
            barMaxWidth:14,
            data: showType === 'cost' ? data.tipCost : data.tipEnergy
        });
    }
    if ( data.topCost.filter(i=>i).length !== 0 ){
        seriesData.push({
            type:'bar',
            name:`峰时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#2ccb96'
            },
            barMaxWidth:14,
            data: showType === 'cost' ? data.topCost : data.topEnergy
        });
    }
    if ( data.middleCost.filter(i=>i).length !== 0){
        seriesData.push({
            type:'bar',
            name:`平时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#4391ff'
            },
            barMaxWidth:14,
            data: showType === 'cost' ? data.middleCost : data.middleEnergy
        });
    }
    if ( data.bottomCost.filter(i=>i).length !== 0){
        seriesData.push({
            type:'bar',
            name:`谷时段${title}`,
            stack:'measure',
            itemStyle:{
                color:'#f7ae1c'
            },
            barMaxWidth:14,
            data: showType === 'cost' ? data.bottomCost : data.bottomEnergy
        });
    }
    
    return (   
        <div style={{ position:'relative', height:'100%' }}>
            <div className={style['float-button-group']}>
            <Radio.Group size='small' value={showType} onChange={e=>toggleShowType(e.target.value)}>
                <Radio.Button key='energy' value='energy'>电量</Radio.Button>
                <Radio.Button key='cost' value='cost'>电费</Radio.Button>
            </Radio.Group>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' style={{ marginLeft:'20px' }} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `电度电费-${showType}`;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
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
                    if ( value === 'excel' ) {
                        var aoa = [], thead = ['对比项','单位'];
                        data.date.forEach(i=>thead.push(i));
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push(`${showType === 'cost' ? '元' : 'kwh'}`);
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
                    
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
                </Radio.Group> 
            }
            </div>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: {
                        trigger: 'axis',
                    },
                    legend: {
                        left:'center',
                        top:10,
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:textColor }
                    }, 
                    grid:{
                        left:20,
                        right:40,
                        bottom:40,
                        containLabel:true
                    },
                    xAxis: {
                        show:true,
                        name: timeType === '2' ? '日' : '月',
                        nameTextStyle:{
                            color:textColor
                        },
                        type:'category',
                        data:data.date,
                        axisTick: { show:false },
                        axisLabel:{
                            show:true,
                            color:textColor
                        },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        nameTextStyle:{
                            color:textColor
                        },
                        name: showType === 'cost' ? '(元)' : '(kwh)',
                        splitLine:{ 
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{ show:false },
                        axisTick:{ show:false }
                    },
                    series:seriesData                
                }}
            />  
        </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MeasureBarChart, areEqual);
