import React, { useState, useEffect, useRef } from 'react';
import echarts from 'echarts';
import { Radio, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
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

function BarChart({ data, typeCode, timeType, activeKey, forOverAlarm, beginDate, endDate, currentField, currentAttr }){
    const echartsRef = useRef();
    const myChart = useRef();
    const excelData = useRef([]);
    const [chartType, toggleChartType] = useState('bar');
    useEffect(()=>{
        myChart.current = echarts.init(echartsRef.current);
        let handleResize = ()=>{
            if ( myChart.current ) myChart.current.resize();
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    useEffect(()=>{
        if ( myChart.current ){
            myChart.current.resize();
        }
    },[activeKey])
    useEffect(()=>{
        if ( myChart.current ){
            let seriesData = [];
            if ( chartType === 'bar'){
                seriesData = Object.keys(data.typeArr).map(key=>{
                    let obj = {
                        type:'bar',
                        stack:'ele',
                        name:key,
                        barWidth:20,
                        data:data.typeArr[key],
                    };
                    return obj;
                });
            } else {
                seriesData = Object.keys(data.typeArr).map(key=>{
                    let obj = {
                        type:'line',
                        name:key,
                        symbol:'none',
                        data:data.typeArr[key],
                    };
                    return obj;
                })
            };
            excelData.current = seriesData;
            let option = {
                tooltip: { trigger:'axis'},
                title:{
                    text:`{a|${ typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : '通讯安全'}}{b|总告警数:${data.totalCount}次}`,
                    left:20,
                    top:10,
                    textStyle:{
                        rich:{
                            a:{ color:'#404040', fontWeight:'bold', fontSize:16 },
                            b:{ color:'#f55445', fontSize:16, padding:[0,0,0,20]}
                        }
                    }
                },
                grid:{
                    top:60,
                    bottom:30,
                    left:20,
                    right:40,
                    containLabel:true
                },    
                legend: {
                    type:'scroll',
                    left: seriesData.length <= 8 ? 'center' : 240,
                    right: seriesData.length <=8 ? 0 : 100,
                    top:10,
                    right:160,
                    data:seriesData.map(i=>i.name)
                },
                color:['#62a3ff','#1fc48d','#f5a70d','#f53f2e','#0298c2','#002060'],
                xAxis: {
                    show: true,
                    name: timeType === '1' ? '小时' : timeType === '2' ? '日' : '月',
                    nameTextStyle:{ color:'#404040'},
                    type:'category',
                    data:data.date,
                    axisLine:{
                        lineStyle:{
                            color:'#f0f0f0'
                        }
                    },
                    interval:0,
                    axisLabel:{
                        color:'#404040',
                        formatter:(value)=>{
                            let strArr = value.split('-');
                            let result = '';
                            if ( timeType === '1'){
                                result = value.split(' ')[1];
                            } else if ( timeType === '2'){
                                result = strArr[2]
                            } else {
                                result = strArr[1];
                            }
                            return result;
                        }
                    },
                    axisTick:{ show:false }
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
                    }
                },
                series:seriesData
            };
            myChart.current.setOption(option);
        }
    },[data, chartType])
    return (
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <div style={{ position:'absolute', right:'10px', top:'10px', zIndex:'2' }}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'10px' }} value={chartType} onChange={e=>{
                    toggleChartType(e.target.value);
                }}>
                    <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                    <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                </Radio.Group>
                <Radio.Group size='small' value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle =  
                                timeType === '1' 
                                ?
                                `${beginDate.format('YYYY-MM-DD')}${typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : ''}告警趋势`
                                :
                                timeType === '2' 
                                ?
                                `${beginDate.format('YYYY-MM-DD')}至${endDate.format('YYYY-MM-DD')}${typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : ''}告警趋势`
                                :
                                timeType === '3' 
                                ?
                                `${beginDate.format('YYYY-MM')}至${endDate.format('YYYY-MM')}${typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : ''}告警趋势`
                                :
                                '' 
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current, { allowTaint:false, useCORS:false })
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
                        let rows = data.date.map((time,index)=>{
                            let obj = {
                                '维度':currentField.field_name,
                                '属性':currentAttr.title,
                                [timeType === '1' ? '时间' : timeType === '2' ? '日期' : '月份']: timeType === '1' ? time.split(' ')[1] : time,
                                '单位':'次'
                            };
                            if ( excelData.current && excelData.current.length ){
                                excelData.current.forEach(item=>{
                                    obj[item.name] = item.data[index] || '-- --';                            
                                });
                            }
                            return obj;
                        });
                        downloadExcel(rows, fileTitle + '.xlsx');
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>                
                </Radio.Group>
            </div>
            <div style={{ height:'100%'}} ref={echartsRef}></div>
        </div>
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.activeKey !== nextProps.activeKey ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(BarChart, areEqual);