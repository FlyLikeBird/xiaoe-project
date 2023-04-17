import React, { useState, useRef } from 'react';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/index.less';

const runTimeType = {
    'off':{
        text:'关机',
        color:'#ccc'
    },
    'empty':{
        text:'空载',
        color:'#f8e71c'
    },
    'normal':{
        text:'开机',
        color:'#b8e986'
    },
    'over':{
        text:'重载',
        color:'#f5a724'
    }
}

const feeTimeType = {
    '1':{
        text:'峰',
        color:'#57e29f'
    },
    '2':{
        text:'平',
        color:'#ffc84b'
    },
    '3':{
        text:'谷',
        color:'#65cae3'
    },
    '4':{
        text:'尖',
        color:'#ccc'
    }
};

function AnalyzeChart({ data, forModal, theme }) {
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    let option={};
    // 电流的空载率
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'电流',
        data:data.view.power,
        itemStyle:{
            color:'#1890ff'
        },
        xAxisIndex:0,
        yAxisIndex:0,        
    });
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'关机阈值',
        itemStyle:{
            color:'#ffc80c'
        },
        data:data.view.date.map(i=>+data.off_power),
        markPoint:{
            symbol:'rect',
            symbolSize:[100,20],
            data:[ { value:'关机阈值: '+ (+data.off_power ), xAxis:data.view.date.length-10, yAxis:+data.off_power } ],
        },
        lineStyle:{
            type:'dashed'
        }
    });
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'空载阈值',
        itemStyle:{
            color:'#6ec71e'
        },
        data:data.view.date.map(i=>+data.empty_power),
        markPoint:{
            symbol:'rect',
            symbolSize:[100,20],
            data:[ { value:'空载阈值: '+ (+data.empty_power ), xAxis:data.view.date.length-10, yAxis:+data.empty_power } ],
        },
        lineStyle:{
            type:'dashed'
        }
    });
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'重载阈值',
        itemStyle:{
            color:'#fd6e4c'
        },
        data:data.view.date.map(i=>+data.over_power),
        markPoint:{
            symbol:'rect',
            symbolSize:[100,20],
            data:[ { value:'重载阈值: '+ (+data.over_power ), xAxis:data.view.date.length-10, yAxis:+data.over_power } ],
        },
        lineStyle:{
            type:'dashed'
        }
    });
    // 运行状态
    // data.view.power.forEach(power=>{
    //     // 未设置额定功率算开机时间
    //     let timeType = power == null
    //                 ?
    //                 'null'
    //                 : 
    //                 power <= +data.off_power 
    //                 ?
    //                 'off'
    //                 :
    //                 +data.off_power < power && power <= +data.empty_power 
    //                 ?
    //                 'empty'
    //                 :
    //                 +data.empty_power < power && power < +data.over_power
    //                 ?
    //                 'normal'
    //                 :
    //                 data.over_power && power >= +data.over_power 
    //                 ?
    //                 'over'
    //                 :
    //                 'normal';
    //     seriesData.push({
    //         type:'bar',
    //         xAxisIndex:0,
    //         yAxisIndex:0,
    //         name:runTimeType[timeType] ? runTimeType[timeType].text : '',
    //         data:[1],
    //         barWidth:10,
    //         stack:'timeType',
    //         itemStyle:{
    //             color:runTimeType[timeType] ? runTimeType[timeType].color : '#fff'
                        
    //         }
    //     });
    // });
    // 计费时段
    
    seriesData.push({
        type:'bar',
        xAxisIndex:1,
        yAxisIndex:1,
        // feeTimeType[time] ? feeTimeType[time].text : '',
        data:data.view.time.map(i=>({ name:feeTimeType[i].text, value:1, itemStyle:{ color:feeTimeType[i].color }})),        
        // 设置此柱状图之间连续拼接
        barCategoryGap:-1,
        tooltip:{ show:false }
    })
    
    option = {
        tooltip:{
            show:true,
            trigger:'axis',            
        },  
        graphic:{
            type:'group',
            left:'center',
            top:6,
            children:[
                {
                    type:'circle',
                    shape:{ cx:10, cy:10, r:6 },
                    style:{
                        fill:'#ccc'
                    }
                },
                {
                    type:'text',
                    style:{ text:'尖时段', x:20, y:6, fill:'#ccc' }
                },
                {
                    type:'circle',
                    shape:{ cx:70, cy:10, r:6 },
                    style:{
                        fill:'#57e29f'
                    }
                },
                {
                    type:'text',
                    style:{ text:'峰时段', x:80, y:6, fill:'#57e29f' }
                },
                {
                    type:'circle',
                    shape:{ cx:130, cy:10, r:6 },
                    style:{
                        fill:'#ffc84b'
                    }
                },
                {
                    type:'text',
                    style:{ text:'平时段', x:140, y:6, fill:'#ffc84b' }
                },
                {
                    type:'circle',
                    shape:{ cx:190, cy:10, r:6 },
                    style:{
                        fill:'#65cae3'
                    }
                },
                {
                    type:'text',
                    style:{ text:'谷时段', x:200, y:6, fill:'#65cae3' }
                }
            ]
        },
        grid:[
            
            {
                left:80,
                right:20,
                bottom:'17%',
                top:'10%',
            },{
                left:80,
                right:20,
                top:'88%',
                bottom:56,
            }
        ],
        dataZoom:{
            // type:'inside',                     
            show:true,
            bottom:20,
            xAxisIndex:[0,1],
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
            
        },   
        xAxis:[
            
            {
                type:'category',
                data:data.view.date,
                // boundaryGap:false,
                // alignWithLabel:true,
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
                },
                axisTick:{
                    show:false
                },
                gridIndex:0
            },
            {
                type:'category',
                gridIndex:1,
                data:data.view.date,
                // min:0,
                // max:288,
                axisLabel:{
                    show:false,
                    color:textColor,
                    formatter:(value)=>{
                        let dateStr = value.split(' ');
                        if ( dateStr && dateStr.length > 1){
                            return dateStr[1];
                        } else {
                            return value; 

                        }
                    }
                },
                axisTick:{ show:false },
                axisLine:{ show:false },
                splitLine:{ show:false }
            },
        ],
        yAxis:[
            {
                type:'value',
                gridIndex:0,
                name:'(单位:A)',
                nameTextStyle:{
                    color:textColor
                },
                axisLine:{ show:false },
                axisTick:{ show:false },
                axisLabel:{
                    color:textColor
                },
                splitLine:{
                    show:true,
                    interval:0,
                    lineStyle:{
                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                    }
                } 
            },
            {
                type:'value',
                gridIndex:1,
                min:0,
                max:1,
                axisLine:{ show:false },
                axisTick:{ show:false },
                axisLabel:{ show:false },
                splitLine:{ show:false }
            }
        ],
       
        series:seriesData
    };
    
    return (    
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' style={{ position:'absolute', top:'1rem', right:'1rem', zIndex:'2' }} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '分析中心-空载率';
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
                    var aoa = [], thead = ['运行状态'];
                    thead.push(...data.view.date);
                    aoa.push(thead);
                    Object.keys(data.view).forEach(key=>{
                        let temp = [];
                        if ( key === 'power') {
                            temp.push('开机');
                            temp.push(...data.view.power);
                            aoa.push(temp);
                        } else if ( key === 'off') {
                            temp.push('关机');
                            temp.push(...data.view.off);
                            aoa.push(temp);
                        } else if ( key === 'empty') {
                            temp.push('空载');
                            temp.push(...data.view.empty);
                            aoa.push(temp);
                        } else if ( key === 'over') {
                            temp.push('重载');
                            temp.push(...data.view.over);
                            aoa.push(temp);
                        }
                    })                    
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={option}
            />
        </div>
             

    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.them !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(AnalyzeChart, areEqual);
