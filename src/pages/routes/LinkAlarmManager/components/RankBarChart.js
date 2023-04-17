import React, { useState, useEffect, useRef } from 'react';
import { message, Radio, Tooltip } from 'antd';
import { PictureOutlined, DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

let pattern = /\s/g;

function RankBarChart({ data, typeCode }){   
    const echartsRef = useRef();
    return (
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle =  '设备掉线排名';
               
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
                    let aoa = [], thead = ['属性','掉线次数'];
                    aoa.push(thead);
                    data.attrArr.forEach((item,index)=>{
                        let temp = [];
                        temp.push(item);
                        temp.push(data.valueArr[index]);
                        aoa.push(temp);
                    });
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
                style={{ height:'100%'}}
                ref={echartsRef}
                notMerge={true}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text: typeCode === 'link' ? '设备掉线排名' : '越限告警排名',
                        left:20,
                        top:10,
                        textStyle:{
                            color:'#404040', fontWeight:'bold', fontSize:16 
                        }
                    },
                    grid:{
                        top:70,
                        bottom:50,
                        left:20,
                        right:40,
                        containLabel:true
                    },    
                    legend: {
                        show:false
                    },
                    dataZoom:[
                        {
                            show:true,
                            xAxisIndex:0,
                            startValue:0,
                            endValue:12,
                            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                            handleSize: '80%',
                            handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            },
                        }
                    ],
                    xAxis: {
                        show: true,
                        type:'category',
                        data:data.attrArr,
                        axisLine:{
                            lineStyle:{
                                color:'#f0f0f0'
                            }
                        },
                        interval:0,
                        axisLabel:{
                            color:'#484848',
                            formatter:value=>{
                                let str;
                                if ( value.length > 10 ) {
                                    str = value.substring(0, 8) + '...';
                                } else {
                                    str = value;
                                }
                                str = str.replace(pattern,'');
                                return str;
                            }
                        },
                        axisTick:{ show:false }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        name:'次',
                        nameGap:5,
                        nameTextStyle:{
                            color:'#919191',
                            fontSize:12
                        },
                        minInterval:1,
                        axisLine:{
                            show:false,
                        },
                        axisTick:{ show:false },
                        splitLine:{
                            lineStyle : { color:'#f0f0f0' }
                        }
                    },
                    series:{
                        type:'bar',
                        data:data.valueArr,
                        barWidth:20,
                        itemStyle:{
                            color:'#f5a60a'
                        }
                    }
                }}
            />
        </div>
    )
}

export default RankBarChart;