import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { forceFormatNum } from '@/pages/utils/parseDate';
import { downloadExcel } from '@/pages/utils/array';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

function AttrBarChart({ data }) {
    const echartsRef = useRef();
    let seriesData = [], eleCostData = [], waterCostData = [], gasCostData = [], hotCostData = [];
    data.forEach((item,index)=>{
        eleCostData.push(item.ele_cost);
        waterCostData.push(item.water_cost);
        gasCostData.push(item.gas_cost);
        hotCostData.push(item.hot_cost);
    });
    seriesData.push({
        type:'bar',
        stack:'attr',
        name:'电',
        barWidth:10,
        itemStyle:{ color:'#fcb221' },
        data:eleCostData
    });
    seriesData.push({
        type:'bar',
        stack:'attr',
        name:'水',
        barWidth:10,
        itemStyle:{ color:'#61a3ff' },
        data:waterCostData
    });
    seriesData.push({
        type:'bar',
        stack:'attr',
        name:'气',
        barWidth:10,
        itemStyle:{ color:'rgb(39 202 147)' },
        data:gasCostData
    });
    
    seriesData.push({
        type:'bar',
        stack:'attr',
        name:'热',
        barWidth:10,
        itemStyle:{ color:'#fb5b4c' },
        data:hotCostData
    });
    
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `本月区域能耗成本趋势`;
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
                    return ;
                }
                if ( value === 'excel' ){
                    let aoa = [], thead = ['属性','单位','电','水','气','热'];
                    aoa.push(thead);
                    data.forEach(item=>{
                        let temp = [];
                        temp.push(item.attr_name);
                        temp.push('元');
                        temp.push(item.ele_cost);
                        temp.push(item.water_cost);
                        temp.push(item.gas_cost);
                        temp.push(item.hot_cost);
                        aoa.push(temp);
                    })
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(()=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
            </Radio.Group>
            <ReactEcharts 
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                ref={echartsRef}
                option={{
                    tooltip: {
                        trigger: 'axis',
                        // formatter:params=>{
                        //     return `
                        //         <div>
                        //             <div><span>${params[0].axisValue}</span></div>
                        //             <div>
                        //                 <span>${params[0].marker}</span>
                        //                 <span>${params[0].seriesName}:</span>
                        //                 <span>${params[0].data} 万元</span>
                        //             </div>
                        //             <div>
                        //                 <span>${params[1].marker}</span>
                        //                 <span>${params[1].seriesName}:</span>
                        //                 <span>${params[1].data} 万元</span>
                        //             </div>
                        //             <div>
                        //                 <span>${params[2].marker}</span>
                        //                 <span>${params[2].seriesName}:</span>
                        //                 <span>${params[2].data} 万元</span>
                        //             </div>
                        //             <div>
                        //                 <span>${params[3].marker}</span>
                        //                 <span>${params[3].seriesName}:</span>
                        //                 <span>${params[3].data} 万元</span>
                        //             </div>
                        //         </div>
                        //     `
                        // }
                    },
                    title:{
                        text:'能耗成本分布',
                        textStyle:{
                            fontSize:14
                        },
                        left:20,
                        top:6
                    }, 
                    legend:{
                        top:6,
                        left:'center',
                        icon:'circle',
                        itemWidth:10,
                        itemHeight:10,
                        data:['电','水','气','热']
                    },
                    grid: {
                        top:60,
                        left:80,
                        right:80,
                        bottom:20,
                        // containLabel: true
                    },
                    dataZoom:[
                        {
                            show:true,
                            yAxisIndex:0,
                            startValue:0,
                            endValue:5
                        }
                    ],
                    xAxis: {
                        type: 'value',
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color:'#f7f7f7'
                            }
                        },
                        position:'top',
                        name:'元',
                        splitNumber:3,
                        nameTextStyle:{
                            verticalAlign:'bottom',
                            padding:[0,0,6,20]
                        }
                    },
                    yAxis: {
                        type: 'category',
                        inverse:true,
                        data: data.map(i=>i.attr_name),
                        splitLine:{
                            show:false
                        },
                        axisTick:{
                            show:false
                        },
                        axisLabel:{
                            formatter:value=>{
                                if ( value.length &&  value.length > 6) {
                                    let temp = value.substring(0, 4) + '...';
                                    return temp;
                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                    series:seriesData
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

export default React.memo(AttrBarChart, areEqual);
