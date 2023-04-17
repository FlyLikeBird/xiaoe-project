import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import Loading from '@/pages/components/Loading';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

let linearColor = {
    color: {
        type: 'linear',
        x: 0,                 // 左上角x
        y: 0,                 // 左上角y
        x2: 0,                // 右下角x
        y2: 1,                // 右下角y
        colorStops: [{
            offset: 0, color:'#7446fe' // 0% 处的颜色
        }, {
            offset: 1, color: '#0b9dff' // 100% 处的颜色
        }],
    },
    barBorderRadius:6
}
function RangeBarChart({ data, timeType, energyInfo, showType, onDispatch, isLoading, theme, forWater, forReport }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let showTitle = showType === '0' ? '成本' :'能耗';    
    let seriesData = 
        //  如果是总能源 ，显示正常柱状图
        energyInfo.type_id === 0 
        ?
        [ { type:'bar', barMaxWidth:10, data: data.valueData ? data.valueData[showType] : [], name:`总能源${showTitle}`, itemStyle:linearColor }] 
        :
        // 如果是电能源且是日时间维度/成本维度下， 显示分段折线图来表示峰、平、谷时段的成本
        energyInfo.type_id === 1 && timeType === '3' && showType === '0'
        ?
        [
            { type:'line', symbol:'none', itemStyle:{ color:'#7a7ab3' }, areaStyle: { opacity:0.2 }, data:data.tipCost ? data.tipCost.map(item=>item?item:null) : [], name:'尖' },
            { type:'line', symbol:'none', itemStyle:{ color:'#57e29f' }, areaStyle: { opacity:0.2 }, data:data.topCost ? data.topCost.map(item=>item?item:null) : [], name:'峰' },
            { type:'line', symbol:'none', itemStyle:{ color:'#7446fe' }, areaStyle: { opacity:0.2 }, data:data.middleCost ? data.middleCost.map(item=>item?item:null) : [], name:'平' },
            { type:'line', symbol:'none', itemStyle:{ color:'#65cae3' }, areaStyle: { opacity:0.2 }, data:data.bottomCost ? data.bottomCost.map(item=>item?item:null) : [], name:'谷' },
        ] 
        :
        // 如果是电能源且是年和月时间维度，显示堆叠柱状图
        energyInfo.type_id === 1 && timeType !== '3' && showType === '0'
        ?
        [ 
            { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#7a7ab3'}, stack:'电费年度统计', name:'尖', data:data.tipCost },
            { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#62a4e2'}, stack:'电费年度统计', name:'峰', data:data.topCost },
            { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#7446fe'}, stack:'电费年度统计', name:'平', data:data.middleCost },
            { type:'bar', barMaxWidth:'10', itemStyle:{ color:'#f7b645'}, stack:'电费年度统计', name:'谷', data:data.bottomCost },
        ]
        :
        [ 
            { type:'bar', barMaxWidth:'10', name:`${energyInfo.type_name}能源${showTitle}`, data: showType === '0' ? data.cost : data.energy, itemStyle:linearColor }
        ];
        
    // 设置环比参考线
    if ( data.lastValueData && !(energyInfo.type_id === 1 && timeType !== '3' && showType === '0')) {
        seriesData.push({
            type:'line',
            symbol:'none',
            name:'环比',
            itemStyle : { color:'#6fcc17' },
            data: data.lastValueData ? data.lastValueData[showType] : [],
        });
    }
    // 设置同比参考线
    if ( data.sameValueData && !(energyInfo.type_id === 1 && timeType !== '3' && showType === '0' )){
        seriesData.push({
            type:'line',
            symbol:'none',
            name:'同比',
            itemStyle : { color:'#fcc767' },
            data: data.sameValueData ? data.sameValueData[showType] : [],
        });
    }
    // 设置目标参考线
    // if ( timeType !== 'hour' ) {
        // let category = data.categoryData.map(i=>)
        // seriesData.push({
        //     type:'line',
        //     itemStyle:{ opacity:0, color:'#e83320' },
        //     data:category,
        //     markPoint:{
        //         symbol:'rect',
        //         symbolSize:[100,20],
        //         data:[ { value:'目标参考线', xAxis:}]
        //     }
        // });
    // };
    // console.log(seriesData);
    const option = {
        title: {
            text: energyInfo.type_id === 0 ? `总能源${showTitle}趋势图` : `${energyInfo.type_name}${showTitle}趋势图`,
            left: 'center',
            top:4,
            textStyle:{ color:textColor }
        },
        legend:{
            top:4,
            right:160,
            data:[`${energyInfo.type_id === 0 ? '总' : energyInfo.type_name }能源${showTitle}`,'环比','同比'],
            textStyle:{ color:textColor }
        },
        tooltip: {
            trigger: 'axis',
            // formatter: '{a}:{b}: {c}',
        },
        color:['#65cae3','#2c3b4d','#62a4e2','#57e29f','#f7b645'],                 
        grid: {
            top: 70,
            left: 20,
            right: 40,
            bottom:20,
            containLabel: true
        },
        // dataZoom: [
        //     {
        //         show:true,
        //         bottom:10,
        //         handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        //         handleSize: '80%',
        //         handleStyle: {
        //             color: '#fff',
        //             shadowBlur: 3,
        //             shadowColor: 'rgba(0, 0, 0, 0.6)',
        //             shadowOffsetX: 2,
        //             shadowOffsetY: 2
        //         },
        //         startValue: data.categoryData ? data.categoryData.length-1-( timeType === '3' ? 24 : timeType ==='2' ? 30 : timeType === '1' ? 12 :0) : 0,
        //         endValue: data.categoryData ? data.categoryData.length-1 : 0
        //     }
        // ],
        xAxis: {
            type:'category',
            name: timeType === '1' ? '月' : timeType === '2' ? '日' : timeType === '3' ? '时' : '',
            nameTextStyle:{ color:textColor },
            data: data.date,
            silent: false,
            splitLine: {
                show: false
            },
            axisTick:{ show:false },
            axisLine:{ show:false },
            splitArea: {
                show: false
            },
            axisLabel:{
                show:true,
                color:textColor,
                formatter:(value)=>{
                    let temp = value.split(' ');
                    if ( temp && temp.length > 1){
                        return temp[1] + '\n' + temp[0];
                    } else {
                        return temp[0];
                    }
                }
            }
        },
        yAxis: {
            name: showType === '0' ? '(单位:元)' : `(单位:${data.unit})`,
            nameTextStyle:{ color:textColor },
            type:'value',
            splitArea: {
                show: false
            },
            axisLine:{ show:false },
            axisTick:{ show:false },
            axisLabel:{ color:textColor },
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }
        },
        series: seriesData 
    };
    // 如果是电能源，添加图例
    if ( energyInfo.type_id === 1 ){
        option['legend'].data.push(
            '峰','平','谷','基'
        ) ;
    }
    // 如果是电能源，日维度下，多维度折线图对tooltip做特殊处理
    if ( timeType === '3' && energyInfo.type_id === 1) {
        option.tooltip = {
            trigger:'axis',
            formatter:(params)=>{
                let categoryName = params[0].name;
                let html = '';
                html += categoryName;
                params.forEach((item,index)=>{
                    if ( !item.data || item.data.newAdd ) return;
                    html += (`<br/>${item.marker + item.seriesName}: ${item.data}`);
                })
                return html;
            }
        }
    }
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            {
                forWater
                ?
                null
                :
                <Radio.Group style={{ top:'0', right:'unset', left:'0' }} className={style['float-button-group'] + ' ' + style['custom-radio']} size="small" value={timeType} onChange={e=>{
                    let value = e.target.value;
                    onDispatch({ type:'energy/toggleTimeType', payload:value } );        
                    onDispatch({ type:'energy/fetchCostByTime'});              
                }}>
                    <Radio.Button key='1' value='1'>12M</Radio.Button>
                    <Radio.Button key='2' value='2'>30D</Radio.Button>
                    <Radio.Button key='3' value='3'>24H</Radio.Button>
                </Radio.Group>
            }
            
            {
                forWater, forReport 
                ?
                null
                :         
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '总能源成本趋势图';
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
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
                    if ( value === 'excel' ) {
                        var aoa = [], thead = ['对比项'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    }
                }}>
                    <Radio.Button key='download' value='download'><IconFont style={{ fontSize:'1.2rem'}} type='icontupian'/></Radio.Button>
                    <Radio.Button key='excel' value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
                </Radio.Group>
            }
            <ReactEcharts ref={echartsRef} notMerge={true} style={{ width:'100%', height:'100%'}} option={option} />
        </div>    
    );
}

function areEqual(prevProps, nextProps){
    if ( 
        prevProps.data !== nextProps.data 
        ||
        prevProps.isLoading !== nextProps.isLoading 
        ||
        prevProps.showType !== nextProps.showType 
        ||
        prevProps.theme !== nextProps.tehme
        
    ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RangeBarChart, areEqual);
