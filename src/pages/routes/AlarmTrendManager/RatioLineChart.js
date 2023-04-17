import React, { useState, useEffect, useRef } from 'react';
import { Radio, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../utils/array';
import XLSX from 'xlsx';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
// const eleMap = {
//     '剩余电流':'#62a3ff',
//     '功率因素过低':'#01769c',
//     '温度越限':'#1fc48d',
//     '电压超标':'#0298c2',
//     '电流超标':'#f53f2e',
//     '相不平衡':'#f5a70d',
//     '缺相':'#002060'
// };

// const overMap = {
//     '产值比越限':'#'
//     '人效越限':
//     '坪效越限':
//     '电价越限':
//     '基本电费越限'
// }

function BarChart({ data, total, timeType, activeKey, startDate, endDate, currentField, attrIds }){
    const echartsRef = useRef();
    let seriesData = [];
    seriesData.push({
        type:'line',
        itemStyle:{
            color:'#1ec48d'
        },
        name:'已完成',
        symbol:'none',
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
        data:data.finish
    });
   
    
    return (
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <Radio.Group size='small' value='data' className={style['float-button-group']} onChange={e=>{
                let value = e.target.value;
                let fileTitle =  '告警事件完成趋势';
                
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
                    return;
                }
                if ( value === 'excel' ){
                    let aoa = [], thead = ['时间'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    })
                    aoa.push(thead);
                    let temp = [];
                    temp.push('已完成告警数');
                    temp.push(...data.finish);
                    aoa.push(temp);
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx');
                    return ;
                }
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>                
            </Radio.Group>
            <ReactEcharts 
                style={{ height:'100%' }}
                notMerge={true}
                ref={echartsRef}
                    option={{
                        tooltip: { trigger:'axis'},
                    title:{
                        text:`告警事件完成趋势`,
                        left:'center',
                        top:20,
                        textStyle:{
                            fontSize:14
                        }
                    },
                    grid:{
                        top:80,
                        bottom:30,
                        left:40,
                        right:60,
                        containLabel:true
                    },    
                    xAxis: {
                        show: true,
                        name: timeType === '2' ? '日' : timeType === '3' ? '月' : '' ,
                        nameTextStyle:{ color:'#404040'},
                        type:'category',
                        data:data.date,
                        axisLine:{
                            lineStyle:{
                                color:'#f0f0f0'
                            }
                        },
                        interval:0,
                        axisTick:{ show:false },
                        axisLabel:{
                            color:'#404040'
                        },
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        minInterval:1,
                        axisLine:{
                            show:false,
                        },
                        axisTick:{ show:false },
                        splitLine:{
                            lineStyle : { color:'#f0f0f0' }
                        },
                        name:'(单位:次)'
                    },
                    series:seriesData
                }}
            />
        </div>
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(BarChart, areEqual);