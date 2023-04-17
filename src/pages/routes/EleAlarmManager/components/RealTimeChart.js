import React, { useEffect, useState, useRef } from 'react';
import echarts from 'echarts';
import { Radio, Spin, Tooltip } from 'antd';
import { BarChartOutlined, LineChartOutlined, DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import style from '../attrAlarmManager.css';
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
import moment from 'moment';
let timer = null;

const typeMap = {
    TC:{ text:'温度', unit:'℃'},
    IR:{ text:'剩余电流', unit:'mA' },
    ele_exceed:{ text:'电流', unit:'A'},
    vol_exceed:{ text:'电压', unit:'V'},
    power_factor:{ text:'功率因素', unit:'cosΦ'}
};

const timeMap = {
    '5':1,
    '4':5,
    '3':15,
    '2':30,
    '1':60
}
let excelData = [];
let myChart = null;
function RealTimeChart({ data, dispatch, dayTimeType, typeCode, activeKey, currentField, currentAttr }){
    const echartsRef = useRef();
    useEffect(()=>{
        myChart = echarts.init(echartsRef.current);
        let handleResize = ()=>{
            if ( myChart ) myChart.resize();
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            clearInterval(timer);
            timer = null;
            excelData = [];
            myChart = null;
        }
    },[]);
    useEffect(()=>{
        if ( myChart ){
            myChart.resize();
        }
    },[activeKey])
    useEffect(()=>{
        let seriesData = [];
        if ( typeCode === 'IR'){
            seriesData.push({
                type:'line',
                name:'剩余电流',
                symbol:'none',
                data:data.energy,
                itemStyle:{ color:'#3f8fff'},
                markPoint:{
                    data:[
                        { symbol:'circle', symbolSize:14, itemStyle:{ color:'#3f8fff'}, xAxis:data.energy.length ? data.energy.length - 1 : 0, yAxis:data.energy[data.energy.length ? data.energy.length-1 : 0]},
                        { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:data.energy.length ? data.energy.length - 1 : 0, yAxis:data.energy[data.energy.length ? data.energy.length-1 : 0]}
                    ]
                },
            })
        } else {
            let isVol = typeCode === 'vol_exceed' ? true : false;
            let energyA = isVol ? data.energyAB || [] : data.energyA;
            let energyB = isVol ? data.energyBC || [] : data.energyB;
            let energyC = isVol ? data.energyCA || []: data.energyC;

            seriesData.push({
                type:'line',
                name: isVol ? 'AB线' : 'A相' + typeMap[typeCode].text,
                symbol:'none',
                data: energyA,
                itemStyle:{ color:'#3f8fff'},
                markPoint:{
                    data:[
                        { symbol:'circle', symbolSize:14, itemStyle:{ color:'#3f8fff'}, xAxis:energyA.length ? energyA.length - 1 : 0, yAxis:energyA[energyA.length ? energyA.length-1 : 0]},
                        { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyA.length ? energyA.length - 1 : 0, yAxis:energyA[energyA.length ? energyA.length-1 : 0]}
                    ]
                },
            });
            seriesData.push({
                type:'line',
                name: isVol ? 'BC线' : 'B相' + typeMap[typeCode].text,
                symbol:'none',
                data:energyB,
                itemStyle:{ color:'#f5a60a'},
                markPoint:{
                    data:[
                        { symbol:'circle', symbolSize:14, itemStyle:{ color:'#f5a60a'}, xAxis:energyB.length ? energyB.length - 1 : 0, yAxis:energyB[energyB.length ? energyB.length-1 : 0]},
                        { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyB.length ? energyB.length - 1 : 0, yAxis:energyB[energyB.length ? energyB.length-1 : 0]}
                    ]
                },
            });
            seriesData.push({
                type:'line',
                name: isVol ? 'CA线' : 'C相' + typeMap[typeCode].text,
                symbol:'none',
                data:energyC,
                itemStyle:{ color:'#1fc48d'},
                markPoint:{
                    data:[
                        { symbol:'circle', symbolSize:14, itemStyle:{ color:'#1fc48d'}, xAxis:energyC.length ? energyC.length - 1 : 0, yAxis:energyC[energyC.length ? energyC.length-1 : 0]},
                        { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyC.length ? energyC.length - 1 : 0, yAxis:energyC[energyC.length ? energyC.length-1 : 0]}
                    ]
                },
            });  
        };
        if ( data.warning_min ){
            let index = data.date.length ? data.date.length - 1 : 0;
            let temp = data.date.map(i=>+data.warning_min);
            seriesData.push({
                type:'line',
                data:temp,
                name:'最小值基准线',
                symbol:'none',
                itemStyle:{ color:'#f53f2e'},
                lineStyle:{
                    type:'dashed'
                },
                markPoint:{
                    data:[
                        { symbol:'rect', symbolSize:[80,20], xAxis:index, yAxis:temp[index], value:'最小值基准线' }
                    ]
                }
            })
        }
        if ( data.warning_max ){
            let index = data.date.length ? data.date.length - 1 : 0;
            let temp = data.date.map(i=>+data.warning_max);
            seriesData.push({
                type:'line',
                data:temp,
                symbol:'none',
                name:'最大值基准线',
                itemStyle:{ color:'#f53f2e'},
                lineStyle:{
                    type:'dashed'
                },
                markPoint:{
                    data:[
                        { symbol:'rect', symbolSize:[80,20], xAxis:index, yAxis:temp[index], value:'最大值基准线' }
                    ]
                }
            })
        }
        excelData = seriesData;
        let option = {
            tooltip: { trigger:'axis'},
            title:{
                text:'今日实时趋势图',
                left:20,
                top:10,
                textStyle:{
                    color:'#404040', 
                    fontWeight:'bold', 
                    fontSize:16
                }
            },
            grid:{
                top:100,
                bottom:40,
                left:20,
                right:40,
                containLabel:true
            },    
            legend: {
                left:'150px',
                top:10,
                data:seriesData.map(i=>i.name)
            },
            xAxis: {
                show: true,
                // name: timeType === '1' ? '小时' : timeType === '2' ? '日' : '月',
                // nameTextStyle:{ color:'#404040'},
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
                    formatter:(value)=>{
                        let strArr = value.split(' ');
                        let result = strArr[1];
                        return result;
                    }
                },
                axisTick:{ show:false }
            },
            yAxis:{
                show:true,
                type:'value',
                axisLine:{
                    show:false,
                },
                axisTick:{ show:false },
                splitLine:{
                    lineStyle : { color:'#f0f0f0' }
                },
                name:`(单位:${typeMap[typeCode].unit})`
            },
            series:seriesData
        };
        if ( dayTimeType === '4'){
            option['dataZoom'] = [
                {
                    show:true,
                    xAxisIndex:0,
                    // startValue:data.date.length ? data.date.length - 50: 0,
                    // endValue: data.date.length ? data.date.length - 1 : 0,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                }
            ]
        };
        myChart.setOption(option);
        clearInterval(timer);
        timer = setInterval(()=>{
            dispatch({ type:'eleAlarm/fetchRealTimeAlarm', payload:{ nofresh:true }});
        },timeMap[dayTimeType] * 60 * 1000)
    },[data])
   
    return (
       
        <div style={{ position:'relative', width:'100%', height:'100%', borderRadius:'6px', backgroundColor:'#fff' }}>
            <Radio.Group size='small' buttonStyle='solid' style={{ position:'absolute', left:'40px', top:'40px', zIndex:'2' }} value={typeCode} onChange={e=>{
                dispatch({ type:'eleAlarm/toggleTypeCode', payload:{ typeCode:e.target.value }});
                dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});
            }}>
                <Radio.Button value='ele_exceed'>电流</Radio.Button>
                <Radio.Button value='vol_exceed'>电压</Radio.Button>
                <Radio.Button value='TC'>温度</Radio.Button>
                <Radio.Button value='IR'>剩余电流</Radio.Button>
                <Radio.Button value='power_factor'>功率因素</Radio.Button>
            </Radio.Group>
            <div style={{ position:'absolute', right:'10px', top:'10px', zIndex:'2' }} >
                <Radio.Group size='small' style={{ marginRight:'10px' }} value={dayTimeType} onChange={e=>{
                    dispatch({ type:'eleAlarm/toggleDayTimeType', payload:{ dayTimeType:e.target.value }});
                    dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});
                }}>
                    <Radio.Button value='4'>5分钟</Radio.Button>
                    <Radio.Button value='3'>15分钟</Radio.Button>
                    <Radio.Button value='2'>30分钟</Radio.Button>
                    <Radio.Button value='1'>1小时</Radio.Button>
                </Radio.Group>
                <Radio.Group size='small' value='data' onChange={e=>{
                    let value = e.target.value;
                    let todayDate = moment(new Date());
                    let fileTitle =  `${todayDate.format('YYYY-MM-DD')}${typeMap[typeCode].text}实时趋势图`
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
                            let obj = {
                                '维度':currentField.field_name,
                                '属性':currentAttr.title,
                                '时间':time,
                                '单位':typeMap[typeCode].unit
                            };
                            excelData.forEach(item=>{
                                obj[item.name] = item.data[index] || '-- --';                            
                            });
                            return obj;
                        });
                        downloadExcel(rows, fileTitle + '.xlsx');
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                    <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>                
                </Radio.Group>
            </div>
            
            <div style={{ height:'100%' }} ref={echartsRef}></div>
        </div>
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.activeKey !== nextProps.activeKey ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(RealTimeChart, areEqual);