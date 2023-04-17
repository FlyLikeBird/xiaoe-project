import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

function PieChart({ data, energyInfo, showType, theme, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';   
    let legendData = [];
    let total = 0;
    // 获取到能源饼图的数据
    const valueArr = Object.keys(data).map(key=>{
        let obj = {};
        obj.name = key === 'base' ? '基' :
            key === 'tip' ? '尖' :
            key === 'top' ? '峰' :
            key === 'middle' ? '平' : 
            key === 'bottom' ? '谷' :
            key === 'ele' ? '电' :
            key === 'water' ? '水' :
            key === 'gas' ? '气' :
            key === 'hot' ? '热' : '';
        obj.value = showType === '0' ? ( data[key].cost || 0 ) : ( data[key].energy || 0);
        obj.labelLine = {
            show:obj.value === 0 ? false : true,
            length:10,
            length2:20
        };
        if ( obj.name ){
            total += +obj.value;
            legendData.push(obj.name);
        }
        return obj;
    });
    const echartsRef = useRef();
    let title = energyInfo.type_id === 0 ? `本月总${ showType === '0' ? '费用' : '能耗'}分解分析` : `本月${ energyInfo.type_name}${ showType === '0' ? '费用':'能耗'}分解分析`;
   
    return (   
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = title;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#191932' })
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
                        var aoa = [], thead = ['对比项','单位','数值','占比'];
                        aoa.push(thead);
                        valueArr.filter(i=>i.name).forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push(energyInfo.unit);
                            temp.push(i.value);
                            temp.push(`${total ? Math.round(i.value/total*100) : 0 }%`);
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
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: {
                        trigger: 'item',
                        formatter: `{b}: {c}${showType === '0' ? '元' : energyInfo.unit }({d}%)`
                    },
                    title:{
                        text:title,
                        top:10,
                        left:'20%',
                        textStyle:{ color:textColor }
                       
                    },                   
                    legend: {
                        itemWidth:10,
                        itemHeight:10,
                        icon:'circle',
                        right:'10%',
                        top:'middle',
                        orient:'vertical',
                        data:legendData,
                        textStyle:{ color:textColor },
                        formatter:(name)=>{
                            let temp = valueArr.filter(i=>i.name === name)[0];
                            return `{title|本月${name}占比}\n{value|${total ? Math.round((temp.value / total) * 100) : 0 }%}`
                        },
                        textStyle:{
                            rich: {
                                title: {
                                    fontSize: 12,
                                    lineHeight: 20,
                                    color: '#9a9a9a'
                                },
                                value: {
                                    fontSize: 16,
                                    fontWeight:'bold',
                                    lineHeight: 20,
                                    color:textColor
                                }
                            }
                        }
                    },
                    color:['#4ccdef','#a61dfb','#ffba58','#7a7ab3','#57e29f'],  
                        
                    series: [
                        {
                            type: 'pie',
                            center:['40%','55%'],
                            radius: ['40%', '55%'],
                            avoidLabelOverlap: true,
                            itemStyle:{
                                borderColor: theme === 'dark' ? '#191932' : '#fff',
                                borderWidth:4,
                            },
                            label:{
                                // position:'inside',
                                formatter:(params)=>{
                                    
                                    return params.data.value ? `${params.data.name} ${total ? Math.round(params.data.value/total*100) : 0 }%` : '';
                                },
                                fontSize:14,
                                // color:'#000',
                                fontWeight:'bold'
                            },
                            
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: 14,
                                    fontWeight: 'bold'
                                }
                            },
                            data:valueArr
                        }
                    ]
                }}
            /> 
        </div> 
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(PieChart, areEqual);
