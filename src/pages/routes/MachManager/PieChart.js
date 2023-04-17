import React from 'react';
import ReactEcharts from 'echarts-for-react';

function PieChart({ data }){
    let pieData = [];
    Object.keys(data).map(key=>{
        pieData.push({ name:key, value:data[key] })
    });
    return (
        Object.keys(data).length
        ?
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    show:true,
                    trigger:'axis'
                },
                legend:{
                    data:pieData.map(i=>i.name),
                    left:'center',
                    top:10
                },
                title:{
                    text:'终端状态',
                    textStyle:{
                        fontSize:14
                    },
                    left:20,
                    top:10
                },
                color:['#62a3ff','#1fc48d','#f5a60a','#f53f2e'],
                series:[
                    {
                        type:'pie',
                        center:['50%','50%'],
                        radius:['48%', '60%'],
                        avoidLabelOverlap:false,  
                        labelLine:{
                            show:false,
                        },
                        label:{
                            show:true,
                            position:'inside',
                            formatter:(params)=>{
                                if ( params.data.value ){
                                    return params.data.value;
                                } else {
                                    return ''
                                }
                            }
                        },
                        data:pieData
                    }
                ]
            }}
        />
        :
        <div style={{ fontWeight:'bold' }}>该设备暂无告警信息</div>
    )
}

export default PieChart;