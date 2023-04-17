import React, { useState, useEffect, useRef } from 'react';
import { Radio, Tooltip } from 'antd';
import html2canvas from 'html2canvas';
import { BarChartOutlined, LineChartOutlined, PictureOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';

const machMap = {
    '1':{
        name:'电表',
        color:'#1fc48d'
    },
    '2':{
        name:'水表',
        color:'#f5a70d'
    },
    '3':{
        name:'气表',
        color:'#f53f2e'
    },
    '4':{
        name:'传感器',
        color:'#3f8fff'
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

function PieChart({ data, timeType }){
    const echartsRef = useRef();
    let total = 0;
    let seriesData = [];
    Object.keys(data).forEach(key=>{
        total += +data[key];
        seriesData.push({
            name:machMap[key].name,
            value:data[key],
            ratio: total === 0 ? 0.0 : (data[key] / total * 100).toFixed(1),
            itemStyle:{
                color:machMap[key].color
            }
        })
    });
    
    return (
        <div style={{ position:'relative', height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let date = new Date();
                let fileTitle =  '设备类型异常占比';
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
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
            </Radio.Group>            
            <ReactEcharts 
                notMerge={true}
                style={{ height:'100%'}}
                ref={echartsRef}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'设备类型异常占比',
                        left:20,
                        top:10,
                        textStyle:{
                            color:'#404040', fontWeight:'bold', fontSize:16
                        }
                    },   
                    legend: {
                        show:true,
                        left:'50%',
                        top:'center',
                        orient:'vertical',
                        data:seriesData.map(i=>i.name),
                        icon:'circle',
                        formatter:(name)=>{
                            let temp = findData(name, seriesData);
                            return `{title|${name}}\n{value|${temp.ratio}%  ${temp.value}}{title|次}`
                        },
                        textStyle:{
                            rich: {
                                title: {
                                    fontSize: 12,
                                    lineHeight: 20,
                                    color: '#9a9a9a'
                                },
                                value: {
                                    fontSize: 16,
                                    fontWeight:'bold',
                                    lineHeight: 20,
                                    color: '#3c3c3c'
                                }
                            }
                        }
                    },
                    series:{
                        type:'pie',
                        center:['30%','50%'],
                        radius:['44%','54%'],
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
                                return `{a|${total}次}\n{b|${timeType === '1' ? '本日' : timeType === '2' ? '本月' : '本年'}总通讯异常}`
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
                                    padding:[6,0,6,0]
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