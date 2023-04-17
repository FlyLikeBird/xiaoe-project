import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { globalColors } from '../EnergyCostChart/colors';

let colorArr = [];
// 14为一组色系，隔一个色系
for(var i=0;i<globalColors.length;i++){
    colorArr.push(globalColors[i]);
}
function EnergyCostChart({ data, currentField, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const sourceData = useRef(null);
    const fieldData = useRef(currentField);
    const { chartInfo, timeType, energyInfo } = data;
    const { date, attr } = chartInfo;
    const [chartType, toggleChartType] = useState('line');
    const echartsRef = useRef();
    useEffect(()=>{
        sourceData.current = data;
        fieldData.current = currentField;
    },[data, currentField]);
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
            obj.name = item.attr_name;
            obj.data = item.cost;
            legendData.push(item.attr_name);
            return obj;
        })
    } else if ( chartType === 'pie') {
        seriesData.push({
            type:'pie',
            radius:'70%',
            label:{
                show:true,
                position:'inner',
                fontSize:16,
                formatter:(params)=>{
                    if ( params.data.value === 0 ){
                        return '';
                    } else {
                        return `${params.data.name}\n${params.data.value.toFixed(2)}`;
                    }              
                }
            },
            labelLine:{ show:false },
            data:attr.map(item=>{
                return {
                    name:item.attr_name,
                    value: item.cost.reduce((sum,cur)=>sum+=Number(cur), 0)
                }
            })
        });
        legendData = attr.map(i=>i.attr_name);
    }
    
    return (    
        <div style={{ height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value={chartType} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '成本透视';
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#191932' })
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
                    var aoa = [], thead = ['属性'];

                    date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
                toggleChartType(value);
            }}>
                <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                <Radio.Button value='pie'><PieChartOutlined /></Radio.Button>
                <Radio.Button value='download'><FileImageOutlined /></Radio.Button>
                { chartType === 'pie' ? null : <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button> }
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={{
                    color:colorArr,
                    legend:{ 
                        type:'scroll', 
                        data:legendData, 
                        top:30,
                        left:20,
                        right:20,
                        textStyle:{ color:textColor }
                    },
                    tooltip:{
                        show: chartType === 'pie' ? false : true,
                        trigger:'axis'
                    }, 
                    
                    grid: {
                        left:20,
                        right:40,
                        top:90,
                        bottom:30,
                        containLabel:true
                    },                 
                    xAxis: {
                        show: chartType === 'pie' ? false : true,
                        type:'category',
                        data:date,
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{
                            color:textColor,
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
                        name:'(单位:元)',
                        nameTextStyle:{ color:textColor },
                        axisTick:{
                            show:false
                        },
                        axisLabel:{ color:textColor },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLine:{
                            show:false
                        }
                    },
                    series:seriesData
                }}
            /> 
        </div>
            
    );
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {

    } else {
        return true;
    }
}
export default EnergyCostChart;
