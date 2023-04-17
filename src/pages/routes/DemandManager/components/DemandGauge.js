import React, { useEffect, useRef } from 'react';
import echarts from 'echarts';

let myChart;
function DemandGauge({ data, innerActiveKey, activeKey }){
    const echartsRef = useRef();
    useEffect(()=>{
        myChart = echarts.init(echartsRef.current);
        let handleResize = ()=>{
            if ( myChart ) myChart.resize();
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            myChart = null;
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    useEffect(()=>{
        if ( myChart ){
            myChart.resize();
        }
    },[activeKey, innerActiveKey])
    useEffect(()=>{
        if ( myChart ){
            let option = {
                series:[
                    {
                        type:'gauge',
                        name:'当前需量',
                        center:['50%','55%'],
                        min:0,
                        max:data.month_max_demand ? data.month_max_demand : 100,
                        radius:'80%',
                        startAngle:200,
                        endAngle:-20,
                        axisLine:{
                            lineStyle:{
                                width:24,
                                color:[
                                    [ data.month_max_demand ? data.now_demand/data.month_max_demand : 0,'#1890ff'],
                                    [1,'#a5e0fe']
                                ]
                            }
                        },
                        axisTick:{ show:false },
                        axisLabel:{ 
                            show:true,
                            distance:-60,
                            formatter:(value)=>{
                                if ( !data.month_max_demand ) {
                                    return '';
                                }
                                if ( value === 0 || value === data.month_max_demand ) {
                                    return Math.floor(value) + 'kw';
                                } else {
                                    return '';
                                }
                            }
                        },
                        splitLine:{ show:false },
                        detail:{
                            offsetCenter:[0,40],
                            fontSize:20,
                            fontWeight:'bold',
                            color:'#1890ff',
                            formatter:'{value}kw'
                        },
                        data:[
                            { value:Math.floor(data.now_demand), name:''}
                        ]
                    }
                ]
            };
            myChart.setOption(option);
        }
    },[data])
    return (
        <div ref={echartsRef} style={{ height:'100%' }}></div>
    )
}

export default DemandGauge;