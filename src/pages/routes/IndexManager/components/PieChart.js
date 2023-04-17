import React, { useState, useRef, useEffect } from 'react';
import { Radio, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import { formatNum } from '../../../utils/parseDate';
import html2canvas from 'html2canvas';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';

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

const energyMap = {
    'ele':{ text:'电', color:'#fcb221', unit:'kwh', offset:2 },
    'water':{ text:'水', color:'#61a3ff', unit:'t', offset:3 },
    'gas':{ text:'气', color:'rgb(39 202 147)', unit:'m³', offset:0 },
    'hot':{ text:'热', color:'#fb5b4c', unit:'GJ', offset:1 }
}
function PieChart({ data }){
    const echartsRef = useRef();
    let seriesData = [];
    let totalInfo = formatNum(data.total);
    Object.keys(data).filter(i=>i !== 'total').forEach(key=>{
        seriesData.push({
            name:energyMap[key].text,
            value:data[key],
            ratio: data.total === 0 ? 0.0 : (data[key] / data.total * 100).toFixed(1),
            itemStyle:{
                color:energyMap[key].color
            }
        })
    });
    
    return (
        <div style={{ height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `本月能耗成本分布`;
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
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                ref={echartsRef}
                option={{
                    tooltip: { trigger:'item'}, 
                    title:{
                        text:'本月能耗成本分布',
                        textStyle:{
                            fontSize:14
                        },
                        left:20,
                        top:'6px'
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
                                    lineHeight: 12,
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
                                return `{a|${totalInfo.value}}{b|${totalInfo.unit}}\n{b|本月总成本}`
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
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(PieChart, areEqual);