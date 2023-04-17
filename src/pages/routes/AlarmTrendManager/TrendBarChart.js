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

function BarChart({ data, timeType }){
    const echartsRef = useRef();
    let seriesData = [];
    if ( Object.keys(data).length ){
        seriesData.push({
            type:'bar',
            stack:'trend',
            name:'安全告警',
            barWidth:14,
            itemStyle:{
                color:'#f7bc48'
            },
            label:{
                show:true,
                formatter:params=>{
                    return params.data || '';
                }
            },
            data:data.safe,
            z:1
        });
        seriesData.push({
            type:'bar',
            stack:'trend',
            name:'越限告警',
            barWidth:14,
            itemStyle:{
                color:'#56d2a9'
            },
            label:{
                show:true,
                formatter:params=>{
                    return params.data || '';
                }
            },
            data:data.limit,
            z:2
        });
        seriesData.push({
            type:'bar',
            stack:'trend',
            name:'通讯告警',
            barWidth:14,
            itemStyle:{
                color:'#3e8eff'
            },
            label:{
                show:true,
                formatter:params=>{
                    return params.data || '';
                }
            },
            data:data.link,
            z:3
        });
    }
   
    return (
        <div style={{ position:'relative', height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle =  '告警类型警报趋势';
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
                    let aoa = [], thead = ['告警类型','单位'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    })
                    aoa.push(thead);
                    seriesData.forEach(item=>{
                        let temp = [];
                        temp.push(item.name);
                        temp.push('次');
                        temp.push(...item.data);
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
                notMerge={true}
                ref={echartsRef}
                option={{
                    tooltip: { trigger:'axis'},
                    // title:{
                    //     text:`{a|${ typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : '通讯安全'}}{b|总告警数:${data.totalCount}次}`,
                    //     left:40,
                    //     top:20,
                    //     textStyle:{
                    //         rich:{
                    //             a:{ color:'#404040', fontWeight:'bold', fontSize:16 },
                    //             b:{ color:'#f55445', fontSize:16, padding:[0,0,0,20]}
                    //         }
                    //     }
                    // },
                    grid:{
                        top:80,
                        bottom:30,
                        left:40,
                        right:60,
                        containLabel:true
                    },    
                    legend: {
                        type:'scroll',
                        left: seriesData.length <= 8 ? 'center' : 240,
                        right: seriesData.length <=8 ? 0 : 100,
                        top:20,
                        data:seriesData.map(i=>i.name)
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
                        axisLabel:{
                            color:'#404040',
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