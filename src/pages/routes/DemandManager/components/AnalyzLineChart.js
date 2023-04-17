import React, { useState, useRef, useEffect } from 'react';
import { Button, Radio, Tooltip } from 'antd';
import { DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

let myChart = null;
function AnalyzLineChart({ data, activeKey, innerActiveKey, currentMach, timeType, beginTime, endTime }) {
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
        let seriesData = [];
        seriesData.push({
            type:'line',
            name:'需量',
            symbol:'none',
            smooth:true,
            data:data.demand,
            connectNulls:true
        });
        let option = {
            color:colors,
            tooltip:{
                trigger:'axis'
            },
            legend:{
                top:10,
                data:['需量','月申报需量','温度']
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
                    }
                }
            ],
            grid:{
                left:40,
                right:60,
                top:60,
                bottom:60,
                containLabel:true
            },
            
            xAxis: {
                type:'category',
                name: '分钟',
                data: data.date,
                silent: false,
                splitLine: {
                    show: false
                },
                axisLabel:{
                    show:true,
                    formatter:(value)=>{
                        let temp = value.split(' ');
                        return temp[1] + '\n' + temp[0];
                    }
                },
                splitArea: {
                    show: false
                }
            },
            // 日当前需量和月申报需量差值过大，采用log模式
            yAxis:{
                name: '(单位:kw)',
                nameTextStyle:{
                    fontSize:14,
                    fontWeigth:'bold'
                },
                type:'value',
                splitArea: {
                    show: false
                },
                splitLine:{
                    show:true,
                    lineStyle:{
                        color:'#f7f7f7'
                    }
                } 
            },
            series: seriesData 
        }
        myChart.setOption(option);
    },[data])
    
    return (  
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <Radio.Group size='small' style={{ position:'absolute', right:'10px', top:'10px', zIndex:'2' }} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = timeType === '1' ? `${beginTime.format('YYYY-MM-DD')}需量分析数据` : `${beginTime.format('YYYY-MM-DD')}至${endTime.format('YYYY-MM-DD')}需量分析数据`;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current, { allowTaint:false, useCORS:false })
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
                    let rows = data.date.map((time,index)=>{
                        return {
                            '设备名称':currentMach.title,
                            '单位':'kw',
                            '时间':time,
                            '需量值':data.demand[index] || '-- --'
                        }
                    })
                    downloadExcel(rows, fileTitle + '.xlsx');
                    return ;
                }
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>                
            </Radio.Group>
            
            <div style={{ height:'100%'}} ref={echartsRef}></div>
        </div>  
    );
}

export default AnalyzLineChart;
