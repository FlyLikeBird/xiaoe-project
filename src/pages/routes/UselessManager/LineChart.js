import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio, Tooltip } from 'antd';
import { FileExcelOutlined, FileImageOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '../IndexPage.css';
import XLSX from 'xlsx';

const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function UselessChart({ data, theme, forModal, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const seriesData = [];
    seriesData.push({
        type:'line',
        name:'无功功率',
        symbol:'none',
        
        data: data.powerArr,
        yAxisIndex:0,
    });
    seriesData.push({
        type:'line',
        name:'功率因素',
        symbol:'none',
        data: data.factorArr,
        yAxisIndex:1
    });
    return (  
        <div style={{ height:'100%' }}>
            {
                forReport 
                ?
                null
                :          
                <Radio.Group size='small' className={style['float-button-group']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `无功监测`;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: forModal || theme === 'light' ? '#fff' : '#191932' })
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
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push( i.name === '无功功率' ? 'kVar' : 'COSΦ');
                            temp.push(...i.data);
                            aoa.push(temp);
                        })

                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
                </Radio.Group>
            }
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{width:'100%', height:'100%'}}
                option={{
                    color:colors,
                    tooltip:{
                        trigger:'axis'
                    },
                    
                    legend:{
                        top:20,
                        data:['无功功率','功率因素'],
                        textStyle:{ color:textColor }
                    },
                   
                    dataZoom: [
                        {
                            show:true,
                            bottom:20,
                            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                            handleSize: '80%',
                            handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            },
                            textStyle:{ color:textColor }
                        }
                    ],
                    grid:{
                        top:80,
                        left:40,
                        right:40,
                        bottom:60,
                        containLabel:true
                    },
                    xAxis: {
                        type:'category',
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor,
                            show:true,
                            formatter:(value)=>{
                                let temp = value.split(' ');
                                if ( temp && temp.length > 1){
                                    return temp[1] ;
                                } else {
                                    return temp[0];
                                }
                            }
                        },
                        splitArea: {
                            show: false
                        }
                    },
                    // 日当前需量和月申报需量差值过大，采用log模式
                    yAxis:[
                        {
                            name: '无功功率(kVar)',
                            nameTextStyle:{
                                fontSize:14,
                                color:textColor,
                                fontWeigth:500,
                                padding:[0, 0, 0, 60]
                            },
                            type:'value',
                            splitArea: {
                                show: false
                            },
                            axisLabel:{ color:textColor },
                            axisLine:{ show:false },
                            axisTick:{ show:false },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                }
                            }             
                        },
                        {
                            name:'功率因素(COSΦ)',
                            nameTextStyle:{
                                fontSize:14,
                                color:textColor,
                                fontWeigth:500,
                                padding:[0, 60, 0, 0]
                            },
                            axisLabel:{ color:textColor },
                            axisLine:{ show:false },
                            axisTick:{ show:false },
                            type:'value',
                            splitArea: {
                                show: false
                            },
                            splitLine:{
                                show:false
                            }   
                        }
                    ],
                    series: seriesData,
                    
                }}
            />
        </div>
                
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(UselessChart, areEqual);
