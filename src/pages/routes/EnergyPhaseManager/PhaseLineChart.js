import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio } from 'antd';
import { DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

function PhaseLineChart({ data, optionText, optionUnit, timeType, currentAttr, theme }) {
    const seriesData = [];
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let isFourPhase = optionText === '四象限无功电能' ? true : false;
    let isMaxDemand = optionText === '最大需量' ? true : false;
    let isLineVoltage = optionText === '线电压' ? true : false;
    let isAvg = optionText === '相电流' || optionText === '相电压' || optionText === '线电压' ? true : false; 
    if ( !isFourPhase ){
        seriesData.push({
            type:'line',
            symbol:'none',
            name: isAvg ? `平均${optionText}` : `总${optionText}`,
            data:data.energy,
            itemStyle:{
                color:'#142e60'
            },
        });
    } 
    if ( isLineVoltage ){
        seriesData.push({
            type:'line',
            name:`AB线`,
            symbol:'none',
            data:data.energyAB,
            itemStyle:{
                color:'#5386f1'
            },
        });
        seriesData.push({
            type:'line',
            name:`BC线`,
            symbol:'none',
            data:data.energyBC,
            itemStyle:{
                color:'#71c822'
            },
        });
        seriesData.push({
            type:'line',
            name:`CA线`,
            symbol:'none',
            data:data.energyCA,
            itemStyle:{
                color:'#fba123'
            },
        });
    } else {
        seriesData.push({
            type:'line',
            name: isFourPhase ? '第一象限':'A相',
            symbol:'none',
            data: isFourPhase ? data.energy1 : data.energyA,
            itemStyle:{
                color:'#5386f1',
            },
        });
        seriesData.push({
            type:'line',
            name:isFourPhase ? '第二象限':'B相',
            symbol:'none',
            data: isFourPhase ? data.energy2 : data.energyB,
            itemStyle:{
                color:'#71c822'
            }
        });
        seriesData.push({
            type:'line',
            name:isFourPhase ? '第三象限':'C相',
            symbol:'none',
            data: isFourPhase ? data.energy3 : data.energyC,
            itemStyle:{
                color:'#fba123'
            }
        });
        if ( isFourPhase ){
            seriesData.push({
                type:'line',
                name:'第四象限',
                symbol:'none',
                data:data.energy4,
                itemStyle:{
                    color:'#f0de1a'
                }
            });
        }
    }
    
    return (  
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group']} onChange={e=>{
                let value = e.target.value;
                let fileTitle = `能源趋势-${optionText}`;
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
                    var aoa = [], thead = ['对比项','属性','单位'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(currentAttr.title);
                        temp.push(optionUnit);
                        temp.push(...i.data);
                        aoa.push(temp);
                    })
                                              
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><DownloadOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        top:6,
                        textStyle:{ color:textColor },
                        data: isFourPhase ? ['第一象限','第二象限','第三象限','第四象限'] : isMaxDemand ? [`总${optionText}`] : isLineVoltage ? [isAvg ? `平均${optionText}` : `总${optionText}`,'AB线','BC线','CA线'] : [isAvg ? `平均${optionText}` : `总${optionText}`,'A相','B相','C相']
                    },
                    grid:{
                        top:50,
                        left:30,
                        right:30,
                        bottom:40,
                        containLabel:true
                    },
                    dataZoom: [
                        {
                            show:true,
                            bottom:10,
                            textStyle:{ color:textColor }
                        }
                    ],
                    
                    xAxis: {
                        type:'category',
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{
                            show:true,
                            color:textColor,
                            formatter:(value)=>{
                                let strArr = value.split('-');
                                if (timeType === '3' ) {
                                    return value;
                                } else {
                                    return strArr[1] + '-' + strArr[2] + '\n' + strArr[0];
                                }   
                            }
                        },
                        splitArea: {
                            show: false
                        }
                    },
                    yAxis:{
                        name: `${optionText}(${optionUnit})`,
                        nameTextStyle:{
                            align:'left',
                            color:textColor
                            // fontSize:20,
                            // fontWeigth:'bolder'
                        },
                        type:'value',
                        splitArea: {
                            show: false
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{
                            show:false,
                        },
                        axisTick:{
                            show:false
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }  
                    },
                        
                    series: seriesData 
                }}
            />
        </div>
                
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(PhaseLineChart, areEqual);
