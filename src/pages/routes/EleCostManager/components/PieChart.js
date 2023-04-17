import React, { useState, useRef, useEffect } from 'react';
import { Radio, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { formatNum } from '../../../utils/parseDate';
import { DownloadOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';

const machMap = {
    'base':{
        name:'基',
        color:'#f5a609'
    },
    'tip':{
        name:'尖',
        color:'#a7ccff'
    },
    'top':{
        name:'峰',
        color:'#3f8fff'
    },
    'middle':{
        name:'平',
        color:'#1fc48d'
    },
    'bottom':{
        name:'谷',
        color:'#f53f2e'
    }
};

function findData(name, data){
    let result = {};
    if ( name && data && data.length ){
        for(var i=0;i<data.length;i++){
            if ( data[i].name === name ) {
                result = { value:data[i].value, ratio:data[i].ratio };
            }
        }
    }
    return result;
}
function PieChart({ data }){
    const echartsRef = useRef();
    let total = 0;
    let seriesData = [];
    Object.keys(data).forEach(key=>{
        if ( key === 'totalFee') return;
        seriesData.push({
            name:machMap[key].name,
            value: Math.round(data[key].cost),
            ratio: data[key].percent || 0.0 + '%',
            itemStyle:{
                color:machMap[key].color
            }
        });
        total += +data[key].cost;
    });
    return (
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let date = new Date();
                let fileTitle = `${date.getFullYear()}年${date.getMonth()+1}月电费分布`;
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
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
            </Radio.Group>
            <ReactEcharts 
                ref={echartsRef}
                notMerge={true}
                style={{ height:'100%'}}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'本月电费分布',
                        textStyle:{
                            fontSize:14
                        },
                        left:20,
                        top:6
                    },   
                    legend: {
                        show:true,
                        left:'54%',
                        top:'center',
                        orient:'vertical',
                        data:seriesData.map(i=>i.name),
                        icon:'circle',
                        itemWidth:10,
                        itemHeight:10,
                        formatter:(name)=>{
                            let temp = findData(name, seriesData);
                            let valueInfo = formatNum(temp.value);
                            return `{title|${name}}\n{value|${temp.ratio}%  ${valueInfo.value}}{title|${valueInfo.unit}}`
                        },
                        textStyle:{
                            rich: {
                                title: {
                                    fontSize: 12,
                                    lineHeight: 16,
                                    color: '#9a9a9a'
                                },
                                value: {
                                    fontSize: 14,
                                    fontWeight:'bold',
                                    lineHeight: 16,
                                    color: '#3c3c3c'
                                }
                            }
                        }
                    },  
                    series:{
                        type:'pie',
                        center:['30%','50%'],
                        radius:['55%','65%'],
                        itemStyle:{
                            borderColor:'#fff',
                            borderWidth:4,
                            shadowBlur: 50,
                            shadowColor: 'rgba(235, 241, 250, 0.5)',
                        },
                        labelLine:{
                            show:false
                        },
                        label:{
                            show:true,
                            position:'center',
                            formatter:(params)=>{
                                let temp = formatNum(total);
                                return `{a|${temp.value}}{b|${temp.unit}}\n{b|本月总成本}`
                            },
                            rich:{
                                'a':{
                                    color:'#414141',
                                    fontSize:22,   
                                    padding:[0,4,0,0]                                                          
                                },
                                'b':{
                                    color:'#8a8a8a',
                                    fontSize:12,
                                    padding:[6,0,6,0],
                                }
                            }
                        },
                        data:seriesData
                    }
                }}
            />
        </div> 
    )
}

export default PieChart;