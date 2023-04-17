import React, { useEffect, useRef } from 'react';
import { Radio, Tooltip } from 'antd';
import { DownloadOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

function BarChart({ dispatch, data, showType, timeType }){
    const echartsRef = useRef();
    let seriesData = [];
    let title = `${ timeType === '3' ? '今日' : timeType === '2' ? '本月' : '本年'}${ showType === '0' ? '成本' : '能耗'}`;
    seriesData.push({
        type:'bar',
        name:title,
        itemStyle:{
            color:'#4593ff'
        },
        barWidth:20,
        data:data.valueData[showType]
    });
    // 设置环比参考线
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'环比',
        itemStyle : { color:'#6fcc17' },
        data:data.lastValueData[showType]
    });
    
    // 设置同比参考线
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'同比',
        itemStyle : { color:'#fcc767' },
        data:data.sameValueData[showType]
    });
    
       
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group']} style={{ right:'unset', left:'6px' }} value={timeType} onChange={e=>{
                dispatch({ type:'eleCost/toggleTimeType', payload:e.target.value });
                dispatch({ type:'eleCost/fetchCostByTime'});
            }}>
                <Radio.Button value='3'>日</Radio.Button>
                <Radio.Button value='2'>月</Radio.Button>
                <Radio.Button value='1'>年</Radio.Button>

            </Radio.Group>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let date = new Date();
                let fileTitle = `电费成本趋势图`;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false })
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
                if ( value === 'excel' ){
                    let aoa = [], thead = ['对比项','单位'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(item=>{
                        let temp = [];
                        temp.push(item.name);
                        temp.push(showType === '0' ? '元' : data.unit );
                        temp.push(...item.data);
                        aoa.push(temp);
                    })
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
            </Radio.Group>
            <ReactEcharts 
                notMerge={true}
                ref={echartsRef}
                style={{ height:'100%'}}
                option={{
                    legend:{
                        top:10,
                        left:'center',
                        data:[title,'环比','同比']
                    },
                    tooltip: {
                        trigger: 'axis',
                       
                    },
                    color:['#65cae3','#2c3b4d','#62a4e2','#57e29f','#f7b645'],                 
                    grid: {
                        top: 60,
                        left: 20,
                        right: 40,
                        bottom:20,
                        containLabel: true
                    },
                    xAxis: {
                        type:'category',
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        splitArea: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{
                            show:true,
                            // formatter:(value)=>{
                            //     let temp = value.split(' ');
                            //     return temp[1] || '';
                            // }
                        }
                    },
                    yAxis: {
                        type:'value',
                        splitArea: {
                            show: false
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color:'#f7f7f7'
                            }
                        },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        name:`(单位:${ showType === '0' ? '元': data.unit})`
                    },
                    series: seriesData 
                }}
            />
        </div> 
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType ) {
        return false ;
    } else {
        return true;
    }
}
export default React.memo(BarChart, areEqual);