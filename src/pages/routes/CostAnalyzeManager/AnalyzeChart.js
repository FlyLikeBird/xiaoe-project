import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, Tooltip } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../utils/array'
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
import { globalColors } from './colors';
import XLSX from 'xlsx';
let colorArr = [];
// 14为一组色系，隔一个色系
for(var i=0;i<globalColors.length;i++){
    colorArr.push(globalColors[i]);
}
function AnalyzeChart({ data, currentField }) {
    const echartsRef = useRef();
    const [chartType, setChartType] = useState('line');
    const { chartInfo, analyzeTimeType, analyzeStartTime, analyzeEndTime, energyInfo } = data;
    const { date, attr } = chartInfo;
    let seriesData = [];
    let legendData = [];
    if ( chartType === 'line') {
        seriesData = attr.map(item=>{
            let obj ={};
            obj.type = 'line';
            obj.name = item.attr_name;
            obj.data = item.cost;
            obj.symbol = 'none';
            obj.areaStyle = {
                opacity:0.1
            };
            legendData.push(item.attr_name);
            return obj;
        })
    } else if ( chartType === 'bar') {
        seriesData = attr.map(item=>{
            let obj ={};
            obj.type = 'bar';
            obj.barMaxWidth = 30;
            obj.name = item.attr_name;
            obj.data = item.cost;
            legendData.push(item.attr_name);
            return obj;
        })
    } else if ( chartType === 'pie') {
        seriesData.push({
            type:'pie',
            radius:'70%',
            label:{ show:false },
            // label:{
            //     show:true,
            //     position:'inner',
            //     fontSize:16,
            //     formatter:(params)=>{
            //         if ( params.data.value === 0 ){
            //             return '';
            //         } else {
            //             return `${params.data.name}\n${params.data.value.toFixed(2)}`;
            //         }              
            //     }
            // },
            labelLine:{ show:false },
            data:attr.map(item=>{
                return {
                    name:item.attr_name,
                    value: Math.round(item.cost.reduce((sum,cur)=>sum+=Number(cur), 0))
                }
            })
        });
        legendData = attr.map(i=>i.attr_name);
    };
    
    
    return (    
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <div className={style['float-button-group']}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'10px' }} value={chartType} onChange={e=>{
                   setChartType(e.target.value);
                }}>
                    <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                    <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                    <Radio.Button value='pie'><PieChartOutlined /></Radio.Button>
                </Radio.Group>
                <Radio.Group size='small' value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '统计分析-成本透视';
                    
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
                        var aoa = [], thead = ['属性','单位'];
                        date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push('元');
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
            </div>
            <ReactEcharts 
                notMerge={true}
                style={{ height:'100%' }}
                ref={echartsRef}
                option={{
                    color:colorArr,
                    legend:{ type:'scroll', data:legendData, top:40, left:20, right:20 },
                    tooltip:{
                        show: true,
                        trigger: chartType === 'pie' ? 'item' : 'axis'
                    }, 
                    grid: {
                        left:40,
                        right:40,
                        top:100,
                        bottom:20,
                        containLabel:true
                    },                 
                    xAxis: {
                        show: chartType === 'pie' ? false : true,
                        type:'category',
                        data:date,
                        axisLabel:{
                            formatter:(value)=>{
                                let dateStr = value.split(' ');
                                if ( dateStr && dateStr.length > 1){
                                    return dateStr[1];
                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                    yAxis:{
                        show:chartType === 'pie' ? false : true,
                        type:'value',
                        name:'(单位:元)'
                    },
                    series:seriesData
                }}
            />
            
        </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(AnalyzeChart, areEqual);
