import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, Spin, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

function filterArr(arr){
    return arr.map(i=>{
        if ( i.cost >= i.quota ) {
            let obj = {};
            obj.value = Math.floor(i.cost);
            obj.itemStyle = { color:'#f35444'};
            return obj;
        } else {
            return Math.floor(i.cost);
        }
    })
}

function filterRatio(arr){
    return arr.map(i=>{
        if ( i.output_ratio >= i.ratio_target ) {
            let obj = {};
            obj.value = i.output_ratio;
            obj.itemStyle = { color:'#f35444'};
            return obj;
        } else {
            return i.output_ratio;
        }
    })
}

function filterMulti(arr){
    let population = { name:'人效', data:[]}, mach_num = { name:'台效', data:[]}, area={ name:'坪效', data:[]};
    arr.map(attr=>{
        attr.info_type.forEach(type=>{
            if ( type.type_code === 'population') {
                population.data.push(type.per_value);
            } else if ( type.type_code === 'mach_num') {
                mach_num.data.push(type.per_value);
            } else if ( type.type_code ==='area') {
                area.data.push(type.per_value);
            }
        })
    });
    return [population, mach_num, area];
}

function RegionQuotaChart({ data, energyInfo, showType, onLink, multi, theme, isLoading, forReport }) {
    theme = forReport ? 'light' : theme;
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const [sort, toggleSort] = useState('default');
    let resultData = sort === 'default' ? data : data.concat().sort((a,b)=>showType ? a.cost-b.cost : a.output_ratio - b.output_ratio );
    let categoryData = [], quotaData = [];
    resultData.forEach(i=>{
        categoryData.push(i.attr_name);
        quotaData.push( showType ? showType === '0' ?  i.quota : '' : i.ratio_target);
    });
    let showTitle = showType ? showType === '0' ? '成本' : '能耗' : '能效产值比';
    let cardTitle = multi ? 
            '责任区域综合能效对比' :
            showType ?
            `本月区域${showTitle}排行(${ showType === '0' ? '元' : energyInfo.unit})`:
            '责任区域能效产值比(元/万元产值)';
    const onEvents = {
        'click':(params)=>{
            if(params.componentType === 'markPoint' && params.type === 'click'){
                onLink(routerRedux.push('/energy/info_manage_menu/quota_manage'));
            }
        }
    };
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            // formatter:(params)=>{
            //     let str = '';
            //     let item = params.map((param,index)=>{
            //         str += `<div>
            //                 <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color}"></span>
            //                 ${param.seriesName}:
            //                 ${param.value}
            //                 </div>`;
            //     });
            //     return '<div>'+'<div>'+params[0].name+'</div>'+str+'</div>'
            // }
        },
        grid: {
            top:40,
            left:100,
            right:80,
            bottom:40,
            // containLabel: true
        },
        dataZoom:[
            {
                show:true,
                yAxisIndex:0,
                startValue:0,
                endValue: multi ? 5 : 10
            }
        ],
        xAxis: {
            type: 'value',
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            },
            axisTick:{ show:false },
            axisLabel:{ color:textColor },
            position:'top'
        },
        yAxis: {
            type: 'category',
            inverse:true,
            data: categoryData,
            splitLine:{
                show:false
            },
            axisTick:{
                show:false
            },
            axisLabel:{
                color:textColor,
                formatter:value=>{
                    if ( value.length &&  value.length > 8) {
                        let temp = value.substring(0, 6) + '...';
                        return temp;
                    } else {
                        return value;
                    }
                }
            }
        },
        color:['#1890ff'],
        series:[]
    };
    if ( multi ) {
        // 显示堆叠柱状图（人效、台效、坪效）
        filterMulti(resultData).forEach(item=>{
            option.series.push({
                type:'bar',
                barWidth:8,
                barGap:'0%',
                name:item.name,
                label: {
                    show: true,
                    formatter:(params)=>{
                        if(params.value) {
                            return params.value;
                        } else {
                            return '';
                            
                        }
                    },
                    position: 'right',
                },
                data:item.data
            })
        });
        option.color = ['#66ff66', '#42a3ea', '#45d5fd'];
        option.legend = {
            data:['人效','台效','坪效'],
            textStyle:{ color:textColor }
        }
    } else {
        option.series.push({               
            type: 'bar',
            barWidth: forReport ? 10 : 6, 
            // barCategoryGap:'100%',
            // barGap:'100%',
            name: showTitle, 
            itemStyle:{
                color:'#1890ff'
            },
            
            label: {
                show: true,
                formatter:(params)=>{
                    if(params.value) {
                        return params.value;
                    } else {
                        return '';
                    }
                },
                position: 'right',
            },
            data: showType ? showType === '0' ? filterArr(resultData) : resultData.map(i=>i.energy) : filterRatio(resultData)            
        });
        // 添加定额线
        option.series.push({            
            type:'line',
            name:'定额',
            step:'end',
            data:quotaData,
            symbol:'none',
            itemStyle:{                               
                color:'#f8b238',
            },
            lineStyle:{
                type:'dotted'
            },
            markPoint:{
                emphasis:{
                    itemStyle:{
                        borderWidth:10,
                    }
                },
                data:[
                    { value:'定额值', yAxis:categoryData.length-1, xAxis:quotaData[quotaData.length-1] }
                ]               
            }                 
        });
    }
    
    const echartsRef = useRef();
    return (
        <div className={style['card-container-wrapper']} style={ forReport ? { width:'100%'} : { width:'50%'}}>
            <div className={style['card-container']} style={ forReport ? { backgroundColor:'#f0f0f0', boxShadow:'none' } : {}}>
                <div className={style['card-title']} style={ forReport ? { borderBottom:'1px solid #f1f1f1'} : {}}>
                    <div>{ cardTitle }</div>
                    <div>
                        {
                            multi
                            ?
                            forReport 
                            ?
                            null
                            :
                            <Radio.Group size='small' style={{ top:'2px' }} className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                                if ( !data.length ){
                                    message.info('数据加载中，请稍后...');
                                    return ;
                                }
                                let value = e.target.value;
                                let fileTitle = '责任区域综合能效对比';
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
                                    var aoa = [], thead = ['属性','人效','台效','坪效'];                                  
                                    aoa.push(thead);
                                    categoryData.forEach((attr,index)=>{
                                        let temp = [];
                                        temp.push(attr);
                                        if ( option.series[0] ) {
                                            temp.push(option.series[0].data[index]);
                                        } 
                                        if ( option.series[1]){
                                            temp.push(option.series[1].data[index] || '-- --');
                                        }
                                        if ( option.series[2]) {
                                            temp.push(option.series[2].data[index]);
                                        }
                                        aoa.push(temp);
                                    })
                                   
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                    return ;
                                }
                            }}>
                                <Radio.Button key='download' value='download'><IconFont style={{ fontSize:'1.2rem'}} type='icontupian'/></Radio.Button>
                                <Radio.Button key='excel' value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
                            </Radio.Group>
                            :
                            <div style={{ top:'2px' }} className={style['float-button-group']}>
                                <Radio.Group size='small' className={style['custom-radio']} value={sort} onChange={e=>{
                                    toggleSort(e.target.value);
                                }}>
                                    <Radio.Button value="default">升序</Radio.Button>
                                    <Radio.Button value="upAndDown">降序</Radio.Button>
                                </Radio.Group>
                                {
                                    forReport 
                                    ?
                                    null
                                    :                         
                                    <Radio.Group size='small' style={{ marginLeft:'20px'}} className={style['custom-button']} value='data' onChange={e=>{
                                        if ( !data.length ){
                                            message.info('数据加载中，请稍后...');
                                            return ;
                                        }
                                        let value = e.target.value;
                                        let fileTitle = showType ?
                                                `本月区域${showTitle}排行`:
                                                '责任区域能效产值比';
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
                                            var aoa = [], thead = ['属性','单位', showTitle,'定额'];                                    
                                            aoa.push(thead);
                                            let unit = showTitle === '成本' ? '元' : showTitle === '能耗' ? energyInfo.unit : showTitle === '能效产值比' ? '元/万元产值' : '';
                                            categoryData.forEach((attr,index)=>{
                                                let temp = [];
                                                temp.push(attr);
                                                temp.push(unit);
                                                temp.push(option.series[0].data[index].value);
                                                if ( option.series[1]) {
                                                    temp.push(option.series[1].data[index]);
                                                }
                                                aoa.push(temp);
                                            })
                                        
                                            var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                            sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                            downloadExcel(sheet, fileTitle + '.xlsx' );
                                            return ;
                                        }
                                    }}>
                                        <Radio.Button key='download' value='download'><IconFont style={{ fontSize:'1.2rem'}} type='icontupian'/></Radio.Button>
                                        <Radio.Button key='excel' value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
                                    </Radio.Group>
                                }
                            </div>
                        }                  
                    </div>
                </div>
                <div className={style['card-content']} style={{ padding:'0' }}>
                    {
                        isLoading 
                        ?
                        <Spin size='large' className={style['spin']} /> 
                        :
                        <ReactEcharts
                            notMerge={true}
                            style={{ width:'100%', height:'100%' }}
                            ref={echartsRef}
                            onEvents={onEvents}
                            option={option}
                        /> 
                        
                    }
                </div>
            </div>
        </div>
        
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.isLoading !== nextProps.isLoading || prevProps.showType !== nextProps.showType || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RegionQuotaChart, areEqual);
