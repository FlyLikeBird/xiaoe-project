import React, { useState, useRef, useEffect } from 'react';
import { Radio, Tooltip } from 'antd';
import { DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
import echarts from 'echarts';
import moment from 'moment';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

let myChart = null;
function DemandLineChart({ data, currentMach, referTime, activeKey, innerActiveKey }) {
    const echartsRef = useRef();
    const activeKeyRef = useRef();
    activeKeyRef.current = { activeKey, innerActiveKey };
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
        const seriesData = [];
        seriesData.push({
            type:'line',
            name:'当前需量',
            symbol:'none',
            areaStyle:{
                opacity:0.3
            },
            data:data.view.today
        });
        seriesData.push({
            type:'line',
            name:'参考需量',
            symbol:'none',
            areaStyle:{
                opacity:0.3
            },
            data:data.view.refer
        });
        // seriesData.push({
        //     type:'line',
        //     name:'月申报需量',
        //     data:data.view.date.map(i=>data.info.demand_declare),
        //     itemStyle:{
        //         opacity:1
        //     },
        //     markPoint:{
        //         symbol:'rect',
        //         symbolSize:[100,20],
        //         data:[ { value:'申报需量: '+data.info.demand_declare, xAxis:data.view.date.length-1, yAxis:data.info.demand_declare} ],
        //     }
        // });
        seriesData.push({
            type:'line',
            name:'盈亏平衡',
            symbol:'none',
            animation:true,
            animationDuration:5,
            animationDelay:5,
            data:data.view.date.map(i=>data.view.refer_demand),
            itemStyle:{
                opacity:1
            },
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'盈亏平衡: '+data.view.refer_demand, xAxis:data.view.date.length-1, yAxis:data.view.refer_demand} ],
            }
        });
        let option = {
            color:colors,
            tooltip:{
                trigger:'axis'
            },
            legend:{
                data:['当前需量','参考需量','盈亏平衡'],
                top:20
            },
            grid:{
                top:60,
                left:40,
                right:60,
                bottom:60,
                containLabel:true
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
            xAxis: {
                type:'category',
                data: data.view.date,
                silent: false,
                splitLine: {
                    show: false
                },
                axisLabel:{
                    show:true,
                    
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
        };
        myChart.setOption(option);
    },[data])
    
    return (  
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <Radio.Group size='small' style={{ position:'absolute', right:'10px', top:'10px', zIndex:'2' }} value='data' onChange={e=>{
                let value = e.target.value;
                let date = new Date();
                let todayDate = moment(date);
                let fileTitle = `${todayDate.format('YYYY-MM-DD')}实时需量数据`;
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
                    let rows = data.view.date.map((time,index)=>{
                        let obj = {};
                        obj['时间'] = time;
                        obj['设备名称'] = currentMach.title;
                        obj['单位'] = 'kw';
                        obj['盈亏平衡'] = data.view.refer_demand;
                        obj[todayDate.format('YYYY-MM-DD')] = data.view.today[index] || '-- --';
                        obj[referTime.format('YYYY-MM-DD')] = data.view.refer[index] || '-- --';
                        return obj;
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

export default DemandLineChart;
