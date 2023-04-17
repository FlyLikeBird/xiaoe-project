import React, { useRef, useEffect } from 'react';
import { Radio, Tooltip, Skeleton } from 'antd';
import { DownloadOutlined, FileExcelOutlined, PictureOutlined } from '@ant-design/icons'
import html2canvas from 'html2canvas';
import { downloadExcel } from '../../../utils/array';
import ReactEcharts from 'echarts-for-react';
import style from '@/pages/routes/IndexPage.css';
import XLSX from 'xlsx';

function BarChart({ data, showType, year, month, day, energyInfo, isLoading }){
    const echartsRef = useRef();
    let title = showType === '0' ? '成本' : '能耗';
    let seriesData = [];
    if ( data.attr && data.attr.length ){
        data.attr.forEach((item)=>{
            seriesData.push({
                type:'bar',
                barMaxWidth:10,
                stack:data.key,
                name:item.attr_name,
                data: showType === '0' ? item.cost.map(i=>(+i).toFixed(2)) : item.energy.map(i=>(+i).toFixed(2))
            })
        });
    }
    
    return (
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = data.key === 'month' ? `${year}年${title}趋势` : data.key === 'day' ? `${year}年${month}月${title}趋势` : `${year}年${month}月${day}日${title}趋势`;
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
                    var aoa = [], thead = ['属性','单位','时间周期'];                                      
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(`${ showType ? showType === '0' ? '元' : energyInfo.unit : '元/万元产值' }`);
                        temp.push( data.key === 'month' ? '月' : data.key === 'day' ? '日' : data.key === 'hour' ? '时' : '');
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
                <Radio.Button value='excel'><Tooltip title='导出Excel文档'><DownloadOutlined /></Tooltip></Radio.Button>
            </Radio.Group>
            {
                isLoading 
                ?
                <Skeleton active className={style['skeleton']} />
                :
                <ReactEcharts 
                    ref={echartsRef}
                    style={{ height:'100%' }}
                    notMerge={true}
                    option={{
                        title: {
                            text: data.key === 'month' ? `${year}年${title}趋势` : data.key === 'day' ? `${month}月${title}趋势` : `${day}日${title}趋势`,
                            left: 'center',
                            top:10,
                            textStyle:{
                                fontSize:14
                            }
                        },
                        legend:{
                            type:'scroll',
                            top:30,
                            left:20,
                            right:20,
                            itemWidth:14,
                            itemHeight:6,
                            data:seriesData.map(i=>i.name)
                        },
                        tooltip: {
                            trigger: 'axis',
                            
                        },
                        color:['#65cae3','#2c3b4d','#62a4e2','#57e29f','#f7b645'],                 
                        grid: {
                            top: 80,
                            left: 20,
                            right: 40,
                            bottom:20,
                            containLabel: true
                        },
                        xAxis: {
                            type:'category',
                            name:data.key === 'month' ? '月' : data.key === 'day' ? '日' : '时', 
                            data: data.date,
                            silent: false,
                            splitLine: {
                                show: false
                            },
                            splitArea: {
                                show: false
                            },
                            axisLabel:{
                                show:true
                            },
                            axisTick:{ show:false }
                        },
                        yAxis: {
                            type:'value',
                            splitArea: {
                                show: false
                            },
                            axisLine:{ show:false },
                            axisTick:{ show:false },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    color:'#e8e8e8'
                                }
                            },
                            name:`(单位:${ showType === '0' ? '元' : energyInfo.unit })`
                        },
                        series: seriesData 
                    }}
                />
            }
            
        </div> 
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showType !== nextProps.showType || prevProps.isLoading !== nextProps.isLoading  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(BarChart, areEqual);