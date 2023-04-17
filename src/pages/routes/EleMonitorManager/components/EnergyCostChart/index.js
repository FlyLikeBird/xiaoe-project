import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, DatePicker, Popover, Skeleton, Spin, message } from 'antd';
import { BarsOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
import style from '../../../IndexPage.css';
import { globalColors } from './colors';
import { IconFont } from '@/pages/components/IconFont';
let colorArr = [];
// 14为一组色系，隔一个色系
for(var i=0;i<globalColors.length;i++){
    colorArr.push(globalColors[i]);
}
// for(var i = 0;i<100;i++){
//     // rgb色彩模式
//     // globalColors.push(
//     //     'rgb(' + [
//     //         Math.round(Math.random() * 150 + 125),
//     //         Math.round(Math.random() * 150 + 125),
//     //         Math.round(Math.random() * 150 + 125)
//     //     ].join(',') + ')'
//     // )
//     // hsl色彩模式
//     globalColors.push(
//         'hsl(' + [
//             Math.random()*180 + 180 + 'deg',
//             Math.random()*50 + 50 + '%',
//             Math.random()*50 + 50 + '%'
//         ].join(',') + ')'
//     )
// }

function splitLegend(arr){
    let result = [];
    arr.forEach((item,index)=>{
        if ( index !== 0 && index % 5 === 0 ) {
            let temp = index;
            result.push('');
            result.push(item);
        } else {
            result.push(item);
        }
    })
    return result;
}

function EnergyCostChart({ data, energyInfo, showType, year, month, day, isLoading, onLink, theme, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let { key, attr, date, quota } = data;
    attr = attr || [];
    const echartsRef = useRef();
    let title =  `${ key === 'month' ? year + '年' : key==='day' ? month + '月' : day + '日'}${ showType ? showType === '0' ? '成本':'能耗' : '产效'}详情(${ showType ? showType === '0' ? '元' : energyInfo.unit : '元/万元产值' })` ;
    let adjoinRate = key === 'month' ? '去年同期' : key === 'day' ? '上月同期' : key === 'hour' ? '昨日同期' : '';
    const [chartType, toggleChartType] = useState('bar');
    let seriesData = [];
    if ( chartType === 'pie'){
        seriesData.push({
            name:title,
            type:'pie',
            center:['40%','50%'],
            radius:'80%',
            label:{ show:false},
            labelLine:{ show:false },
            data:attr.map(item=>{
                return {
                    name:item.attr_name,
                    value: showType ? showType === '0' ? Math.round(item.cost.reduce((sum,cur)=>sum+=+cur, 0)) : Math.round(item.energy.reduce((sum,cur)=>sum+=+cur, 0)) : Math.round(item.ratio.reduce((sum,cur)=>sum+=+cur, 0))
                }
            })
        });
    } else {
        //  柱状图/折线图  系列数据
        if ( attr && attr.length ){
            seriesData = attr.map(item=>{
                let obj = {
                    type:chartType,
                    smooth:true,
                    symbol:'none',
                    barWidth:10,
                    // showType为undefined时，显示万元产值比
                    data: showType ? showType === '0' ? item.cost : item.energy : item.ratio,
                    name:item.attr_name,
                };
                if ( chartType === 'bar') obj['stack'] = title; 
                return obj;
            });
        }
       
         // 设置同比线
        // seriesData.push({
        //     type:'line',
        //     name: adjoinRate,
        //     itemStyle:{
        //         color:'#e54a5c'
        //     },
        //     data: date.map((time,index)=>{
        //         let sum = 0;
        //         attr.map(item=>{
        //             sum += showType ? showType === '0' ? item.lastCost[index] : item.lastEnergy[index] : item.lastRatio[index];
        //         });
        //         return sum;
        //     })
        // });
        
        if ( quota && quota.length && showType === '0' ){
            // 设置定额线
            seriesData.push({
                type:'line',
                name:'定额值',
                data:quota,
                symbol:'none',
                itemStyle:{                               
                    color:'#e83320',
                },
                lineStyle:{
                    type:'dotted'
                },
                markPoint:{
                    data:[ { value:'定额值', xAxis:date.length-1, yAxis:quota[quota.length-1]} ]
                }
            });
        }
    }
    const onEvents = {
        'click':(params)=>{
            if(params.componentType === 'markPoint' && params.type === 'click'){
                onLink(routerRedux.push('/energy/info_manage_menu/quota_manage'));
            }
        }
    };
    return (  
        <div className={style['card-container-wrapper']} style={ forReport ? { width:'100%', paddingRight: data.key === 'hour' ? '0' : '1rem'} : { width:'33.3%', paddingRight: data.key === 'hour' ? '0' : '1rem' }}>
            <div className={style['card-container']} style={ forReport ? { backgroundColor:'#f0f0f0', boxShadow:'none' } : {}}>
                <div className={style['card-title']} style={ forReport ? { borderBottom:'1px solid #f1f1f1'} : {}}>
                    <div>{ title }</div>
                    {
                        forReport 
                        ?
                        <Popover content={(                         
                                <Radio.Group size="small" value={chartType} onChange={e=>{
                                    if ( isLoading ){
                                        message.info('数据加载中，请稍后...');
                                        return ;
                                    }
                                    if ( e.target.value === 'download') {
                                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:true})
                                        .then(canvas=>{
                                            let MIME_TYPE = "image/png";
                                            let url = canvas.toDataURL(MIME_TYPE);
                                            let linkBtn = document.createElement('a');
                                            linkBtn.download = title;
                                            linkBtn.href = url;
                                            linkBtn.dataset.downloadurl = [MIME_TYPE, linkBtn.download, linkBtn.href].join(':');
                                            document.body.appendChild(linkBtn);
                                            linkBtn.click();
                                            document.body.removeChild(linkBtn);
                                        });
                                        return ;
                                    }
                                    toggleChartType(e.target.value);
                                }}>
                                    <Radio.Button key='download' value='download'><DownloadOutlined /></Radio.Button>
                                    <Radio.Button key='line' value="line"><LineChartOutlined /></Radio.Button>
                                    <Radio.Button key='bar' value="bar"><BarChartOutlined /></Radio.Button>
                                    <Radio.Button key='pie' value="pie"><PieChartOutlined /></Radio.Button>
                                </Radio.Group>
                        )} >
                            <Button size='small' icon={<BarsOutlined /> }></Button>
                        </Popover>
                        :
                        <div className={style['float-button-group']} style={{ top:'2px' }}>
                            <Radio.Group size='small' style={{ marginRight:'20px' }} className={style['custom-radio']} value={chartType} onChange={e=>{
                                toggleChartType(e.target.value);
                            }}>
                                <Radio.Button key='line' value="line"><LineChartOutlined /></Radio.Button>
                                <Radio.Button key='bar' value="bar"><BarChartOutlined /></Radio.Button>
                                <Radio.Button key='pie' value="pie"><PieChartOutlined /></Radio.Button>
                            </Radio.Group>
                            <Radio.Group size='small' className={style['custom-button']} value='data' onChange={e=>{
                                let value = e.target.value;
                                let fileTitle = '能源效率-能效趋势';
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
                                    if ( chartType === 'pie' ) {
                                        message.info('请先切换成折线图或柱状图再导出excel');
                                        return ;
                                    }
                                    var aoa = [], thead = ['属性','单位','时间周期'];                                      
                                    date.forEach(i=>{
                                        thead.push(i);
                                    });
                                    aoa.push(thead);
                                    seriesData.forEach(i=>{
                                        let temp = [];
                                        temp.push(i.name);
                                        temp.push(`${ showType ? showType === '0' ? '元' : energyInfo.unit : '元/万元产值' }`);
                                        temp.push( key === 'month' ? '月' : key === 'day' ? '日' : key === 'hour' ? '时' : '');
                                        temp.push(...i.data);
                                        aoa.push(temp);
                                    });
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                    return ;
                                }
                            }}>

                                <Radio.Button value='download'><IconFont style={{ fontSize:'1.2rem'}} type='icontupian'/></Radio.Button>
                                <Radio.Button value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
                            </Radio.Group>
                        </div>
                    }
                </div>
                <div className={style['card-content']} style={{ padding:'0' }}>
                    {
                        isLoading
                        
                        ?
                        <Spin size='large' className={style['spin']} />
                        :
                        <ReactEcharts
                            ref={echartsRef}
                            notMerge={true}
                            onEvents={onEvents}
                            style={{ width:'100%', height:'100%' }}
                            option={{
                                tooltip: chartType === 'pie' ? 
                                    { trigger:'item', formatter:`${ showType ? showType === '0' ? '成本' : '能耗' : '万元产值'}占比:<br/>{b}:{c} ({d})%`}
                                    :
                                    chartType === 'bar'
                                    ?
                                    { trigger:'item' }
                                    :
                                    {}
                                ,
                                color:colorArr,
                                legend: {
                                    type:'scroll',
                                    orient: chartType === 'pie' ? 'vertical' :  'horizontal',
                                    data: chartType === 'pie' ? splitLegend(attr.map(i=>i.attr_name)) : splitLegend(attr.map(i=>i.attr_name).concat('定额值',adjoinRate)),
                                    left: chartType === 'pie' ? 'right': 20,
                                    top: chartType === 'pie' ? 'middle':10,
                                    right:20,
                                    itemWidth: 10,
                                    itemHeight: 10,
                                    pageTextStyle:{ color:textColor },
                                    textStyle:{
                                        color:textColor,
                                        fontSize: forReport ? 10 : 12
                                    }
                                },
                                grid:{
                                    top:50,
                                    left:20,
                                    right:30,
                                    bottom:20,
                                    containLabel:true
                                },
                                xAxis: {
                                    show: chartType === 'pie' ? false : true,
                                    type:'category',
                                    data:date,
                                    name:key==='month' ? '月' : key === 'day' ? '日' : key === 'hour' ? '时' : '',
                                    nameTextStyle:{ color:textColor },
                                    axisTick:{ show:false },
                                    axisLabel:{ color:textColor }
                                },
                                yAxis:{
                                    show:chartType === 'pie' ? false : true,
                                    type:'value',
                                    axisLine:{
                                        show:false
                                    },
                                    axisTick:{
                                        show:false
                                    },
                                    splitLine:{
                                        lineStyle:{
                                            color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                        }
                                    },
                                    axisLabel:{ color:textColor },

                                },
                                series:seriesData
                            }}
                        /> 
                    }
                </div>
            </div>
        </div>
        
        
       
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.isLoading !== nextProps.isLoading || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(EnergyCostChart, areEqual);
