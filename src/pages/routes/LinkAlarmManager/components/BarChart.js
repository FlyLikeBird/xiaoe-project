import React, { useEffect, useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined, PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

const machMap = {
    '1':{
        name:'电表',
        color:'#1fc48d'
    },
    '2':{
        name:'水表',
        color:'#f7bc48'
    },
    '3':{
        name:'气表',
        color:'#f53f2e'
    },
    '4':{
        name:'传感器',
        color:'#62a3ff'
    }
};

function BarChart({ data, timeType }){
    const echartsRef = useRef();
    const [chartType, toggleChartType] = useState('bar');
    const myChart = useRef();
    let seriesData = [];
    if ( chartType === 'bar'){
        seriesData = Object.keys(data.energyTypeArr).map(key=>{
            let obj = {
                type:'bar',
                stack:'ele',
                name:machMap[key].name,
                barWidth:20,
                data:data.energyTypeArr[key],
                itemStyle:{
                    color:machMap[key].color
                }
            };
            return obj;
        })
    } else {
        seriesData = Object.keys(data.energyTypeArr).map(key=>{
            let obj = {
                type:'line',
                name:machMap[key].name,
                symbol:'none',
                data:data.energyTypeArr[key],
                itemStyle:{
                    color:machMap[key].color
                }
            };
            return obj;  
        })
    }
   
    return (
        <div style={{ position:'relative', height:'100%' }}>
            <div className={style['float-button-group']}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'10px' }} value={chartType} onChange={e=>{
                    toggleChartType(e.target.value);
                }}>
                    <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                    <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                </Radio.Group>
                <Radio.Group size='small' value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '通讯异常告警趋势';
                   
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
                        let aoa = [], thead = ['对比项','单位'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(item=>{
                            let temp = [];
                            temp.push(item.name);
                            temp.push('次');
                            temp.push(...item.data);
                            aoa.push(temp);
                        })
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx');
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>                
                </Radio.Group>
            </div>
            <ReactEcharts 
                style={{ height:'100%'}}
                ref={echartsRef}
                notMerge={true}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'通讯异常趋势图',
                        left:20,
                        top:10,
                        textStyle:{
                            color:'#404040', fontWeight:'bold', fontSize:16
                        }
                    },
                    grid:{
                        top:80,
                        bottom:30,
                        left:20,
                        right:40,
                        containLabel:true
                    },    
                    legend: {
                        left:'center',
                        type:'scroll',
                        top:20,
                        data:seriesData.map(i=>i.name)
                    },
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
                        name:'(单位:次)',
                        axisTick:{ show:false },
                        splitLine:{
                            lineStyle : { color:'#f0f0f0' }
                        }
                    },
                    series:seriesData
                }}
            />
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(BarChart, areEqual);