import React, { useEffect, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';
let myChart ;
function LineChart({ xData, yData, y2Data, y3Data, title, hidden, multi, isPhaseU }){
    let seriesData = [];
    if ( multi ){
        seriesData.push({
            type:'line',
            name: 'A相',
            data:yData,
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#f5a609'
            }
        });
        seriesData.push({
            type:'line',
            name: 'B相',
            data:y2Data,
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#1fc48d'
            }
        });
        seriesData.push({
            type:'line',
            name:'C相',
            data:y3Data,
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#f53f2e'
            }
        });
    } else {
        seriesData.push({
            type:'line',
            data:yData,
            symbol:'none',
            smooth:true,
            itemStyle:{
                color: hidden ? '#f5f5f5':'#3a7adf'
            },
            areaStyle:{
                color:{
                    type:'linear',
                    x:0,
                    y:0,
                    x2:0,
                    y2:1,
                    colorStops: [{
                        offset: 0, color: hidden ? 'transparent' : 'rgba(91, 150, 243, 0.2)' // 0% 处的颜色
                    }, {
                        offset: 0.8, color: 'transparent' // 100% 处的颜色
                    }],
                }
            }    
        });
    }
            
    return (
        <ReactEcharts 
            notMerge={true}
            style={{ width:'100%', height:'100%' }}
            option={{
                tooltip:{
                    trigger:'axis'
                },
                title:{
                    text:title,
                    textStyle:{
                        fontSize:14
                    },
                    left:20,
                    top:10
                },
                legend:{
                    show: multi ? true : false,
                    data: multi ? seriesData.map(i=>i.name) : [],
                    top:10,
                    left:'center'
                },
                grid:{
                    left:20,
                    right:20,
                    top:60,
                    bottom:20,
                    containLabel:true
                },
                xAxis:{
                    type:'category',
                    axisTick:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color:'#e8e8e8'
                        }
                    },
                    axisLabel:{
                        color:'#676767'
                    },
                    data:xData
                },
                yAxis:{
                    type:'value',
                    axisLine:{ show:false },
                    axisTick:{ show:false },
                    splitLine:{
                        lineStyle:{
                            color:'#e8e8e8'
                        }
                    },
                    
                },
                series:seriesData
            }}
        />
    )
}

export default LineChart;