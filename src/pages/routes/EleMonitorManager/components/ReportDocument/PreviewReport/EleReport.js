import React, { useState, useRef } from 'react';
import { Button } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import style from './PreviewReport.css';

const colors = ['#65cae3','#2c3b4d','#62a4e2','#57e29f'];

function getBase64(dom){
    return html2canvas(dom, { background:'#f7f7f7'})
        .then(canvas=>{
            let MIME_TYPE = "image/png";
            return canvas.toDataURL(MIME_TYPE);
        })
}

function PreviewReport({ documentInfo, companyInfo, currentField, currentAttr, date, costMode, onCancel, onTranslateImg, onCreateDocument  }) {
    const containerRef = useRef(null);
    const multiRefs = useRef([]);
    const dateStr = date.format('YYYY-MM').split('-');
    const columns = [
        { merged:true, title:'设备', dataIndex:'meter_name' },
        { merged:true, title:'表编', dataIndex:'register_code'},
        { merged:true, title:'期初表码', dataIndex:'minEnergy'},
        { merged:true, title:'期末表码', dataIndex:'maxEnergy'},
        { title:'计价阶段', dataIndex:'count_time' },
        { title:'本月用量(kwh)', dataIndex:'count_energy'},
        { title:'计量电费阶段单价(元)', dataIndex:'count_price'},
        { title:'阶段金额(元)', dataIndex:'count_cost'},
        { merged:true, title:'本月总用量(kwh)', dataIndex:'energy' },
        { merged:true, title:'本月总金额(元)', dataIndex:'totalCost'}
    ];
    const mergeColumns = [
        { title:'计价阶段', dataIndex:'count_time' },
        { title:'本月用量(kwh)', dataIndex:'count_energy'},
        { title:'计量电费阶段单价(元)', dataIndex:'count_price'},
        { title:'阶段金额(元)', dataIndex:'count_cost'},
    ];
    const personColumns = [
        { title:'设备', dataIndex:'meter_name' },
        { title:'表编', dataIndex:'register_code'},
        { title:'期初表码', dataIndex:'minEnergy'},
        { title:'期末表码', dataIndex:'maxEnergy'},
        { title:'本月总用量(kwh)', dataIndex:'energy' },
        { title:'本月总金额(元)', dataIndex:'totalCost'}
    ];
    
    let tableData = [];
    const finalColumns = costMode === 'company' ? columns : personColumns;
    if ( costMode === 'company') {
        // 工业用电计费模式
        documentInfo.table.machs.forEach(mach=>{
            let timeArr = [ mach.height, mach.middle, mach.bottom ];
            timeArr.forEach((item,index)=>{
                let temp = [];
                let obj = { ...mach };
                obj['energy'] = Math.floor(obj['energy']);
                obj['totalCost'] = Math.floor(obj['totalCost']);
                obj['count_time'] = index === 0 ? '峰' : index === 1 ? '平' : '谷';
                obj['count_energy'] = Math.floor(item.energy);
                obj['count_price'] = item.price;
                obj['count_cost'] = Math.floor(item.cost);
                if ( index === 0 ){
                    temp = columns.map(i=>{
                        let td = {};
                        td.data = obj[i.dataIndex];
                        td.merged = i.merged ;
                        return td;
                    });
                } else {
                    temp = mergeColumns.map(i=>{
                        let td = {};
                        td.data = obj[i.dataIndex];
                        td.merged = i.merged ;
                        return td;
                    });
                }            
                tableData.push(temp);
            })
        });
    } else {
        // 民用用电计费模式
        tableData = documentInfo.table.machs.map(mach=>{
            return personColumns.map(item=>{
                let obj = {};
                obj['data'] = mach[item.dataIndex];
                return obj;
            });
        })
    }
    const view1 = documentInfo.view1;
    const view2 = documentInfo.view2;
    const view3 = documentInfo.view3;
    const { companyCost, companyEleCost, totalCost, baseCost, adjustCost, companyEnergy, attrBaseCost, ratio, allTotalCost, allEnergyCost } = documentInfo.table;
    view3['base'] = view3.date.map(i=>Math.floor(documentInfo.table.baseCost/30));
    const view2Series = [], view3Series = [];
    view2Series.push({ name:'电', type:'bar', stack:'本月用电量', data:view2['eleCost'], barWidth:20 });
    // view2Series.push({ name:'水', type:'bar', stack:'本月用电量', data:view2['waterCost'], barWidth:20});
    // view2Series.push({ name:'气', type:'bar', stack:'本月用电量', data:view2['gasCost'], barWidth:20});
    if ( costMode === 'company'){
        view3Series.push({ name:'基', type:'bar', stack:'本月用电量', data:view3['base'], barWidth:14 });
        if ( view3['tip'].filter(i=>+i).length ) {
            view3Series.push({ name:'尖', type:'bar', stack:'本月用电量', data:view3['tip'], barWidth:14});
        }
        view3Series.push({ name:'峰', type:'bar', stack:'本月用电量', data:view3['height'], barWidth:14});
        view3Series.push({ name:'平', type:'bar', stack:'本月用电量', data:view3['middle'], barWidth:14});
        view3Series.push({ name:'谷', type:'bar', stack:'本月用电量', data:view3['bottom'], barWidth:14});
    } else {
        view3Series.push({ name:'用电量', type:'bar', data:view3['totalCost'], barWidth:14});
    }
    
    const handleTranslateImg = ()=>{
        if ( multiRefs.current && multiRefs.current.length ){
            Promise.all(multiRefs.current.map((item)=>getBase64(item)))
                //将文档中的canvas转换成base64位字符串; 
            .then((imgArr)=>{
                    new Promise((resolve)=>{
                        // 将转换后的base64字符串提交到服务器然后替换文档中的图片路径
                        onTranslateImg({ data:imgArr, resolve });
                    })
                    .then((imagesPath)=>{
                        let finalStr = '', tableStr = '';
                        let contentStr = containerRef.current.innerHTML;
                        let pattern = /<table.*<\/table>/;
                        let result = contentStr.match(pattern);
                        if ( result ) {
                            tableStr = result[0];
                        }
                        for(let i=0,len=imagesPath.length;i<len-1;i++){
                            finalStr += `<img src='${imagesPath[i]}'/>`;
                        }
                        finalStr += tableStr + `<img src='${imagesPath[imagesPath.length-1]}'/>`;
                        onCreateDocument( finalStr );
                        onCancel();
                    })
                })
        }
    };
    // console.log(tableData);
    return ( 
        <div className={style['container']}>      
        <div ref={containerRef} >            
            <div ref={el=>multiRefs.current[0] = el} className={style['title-container']} style={{ 
                textAlign:'center', 
                position:'relative', 
                marginBottom:'20px', 
                height:'120px', 
                backgroundColor:'rgb(101 202 227)',
                color:'#fff'
            }} 
            >
                {/* <div className={style['info-container']} style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-end', paddingRight:'10px' }}>
                    <div className={style['attr']}>{ `${currentField.field_name} - ${currentAttr.title}`}</div>
                    <div className={style['year']}>{dateStr[0]}</div>
                    <div>{`${dateStr[1]}月能源成本`}</div>
                    <div>内部结算单据</div>
                </div> */}
                {/* <div style={{backgroundImage:`url(${documentInfo.bgData})`, minWidth:'400px', backgroundRepeat:'no-repeat', backgroundSize:'contain'}}>
                </div> */}
                    <span style={{ fontSize:'1rem', position:'absolute', top:'0', left:'0', backgroundColor:'#85d1e4', padding:'4px 10px'}}>{ `计量点 : ${currentField.field_name} - ${currentAttr.title}`}</span>
                    <span style={{ fontSize:'2rem', lineHeight:'120px'}}>{`${companyInfo ? companyInfo.company_name : ''}${dateStr[0]}年${dateStr[1]}月电成本内部结算单据`}</span>
                   
            </div>
            <div ref={el=>multiRefs.current[1] = el} className={style['chart-container']} style={{ marginBottom:'20px'}}>
                {/* chart1 */}
                <div>
                    <div className={style['head']}>本月应缴电费用</div>
                    <div className={style['chart-item']}>
                        <div style={{ display:'inline-block', width:'50%'}}>
                            <ReactEcharts
                                notMerge={true}
                                option={{
                                    legend:{
                                        top:20,
                                        orient:'horizontal',
                                        data:['电']
                                    },
                                    color:colors,
                                    series:{
                                        type:'pie',
                                        radius: ['50%','70%'],
                                        center: ['50%', '50%'],
                                        data:[ { value:view1.eleCost, name:'电'}]
                                    }
                                }}
                            />
                        </div>
                        <div style={{ width:'50%', display:'flex', flexDirection:'column' }}>
                            <div className={style['info-item']} >
                                <div>电费成本</div>
                                <div className={style['num']}>{`￥${Math.floor(view1.eleCost)}元`}</div>
                            </div>
                            <div className={style['info-item']} >                         
                                <div>
                                    <div>
                                        <span style={{ width:'40%'}}>同比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: view1.sameRatio <=0 ? '#6fcc17' : 'red' }}>{ view1.sameRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ Math.abs(view1.sameRatio).toFixed(1) + '%' } </span>
                                    </div>
                                    <div>
                                        <span style={{ width:'40%'}}>环比:</span>
                                        <span style={{ marginLeft:'10px', fontSize:'20px', color: view1.lastRatio <=0 ? '#6fcc17' : 'red' }}>{ view1.lastRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }{ Math.abs(view1.lastRatio).toFixed(1) + '%' } </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* chart2 */}
                <div>
                    <div className={style['head']}>过去12个月电成本变化趋势</div>
                    <div className={style['chart-item']}>
                        <ReactEcharts                       
                            notMerge={true}
                            option={{
                                legend: {
                                    top:20,
                                    orient:'horizontal',
                                    data: ['电']
                                },
                                grid:{
                                    top:60,
                                    left:20,
                                    right:20,
                                    bottom:20,
                                    containLabel:true
                                },
                                label:{
                                    position:'inside',
                                },
                                tooltip:{ trigger:'axis' },
                                xAxis:{
                                    type:'category',
                                    data:view2.date,
                                    axisTick:{ show:false }
                                },
                                color:colors,
                                yAxis:{ type:'value', name:'(单位:元)', axisTick:{ show:false } },
                                series:view2Series
                            }}
                        />
                    </div>       
                </div>
            </div>
            {/* chart3 */}
            <div className={style['chart-container']} ref={el=>multiRefs.current[2] = el} style={{ marginBottom:'20px' }}>
                <div>
                    <div className={style['head']}>本月用电量变化趋势图</div>
                    <div style={{backgroundColor:'#f7f7f7'}}>
                        <ReactEcharts                       
                            notMerge={true}
                            option={{
                                legend: {
                                    top:20,
                                    show: costMode === 'company' ? true : false,
                                    orient:'horizontal',
                                    data: costMode === 'company' ? view3Series.map(i=>i.name) : []
                                },
                                tooltip:{ trigger:'axis' },
                                label:{
                                    position:'inside',

                                },
                                grid:{
                                    top:60,
                                    left:20,
                                    right:40,
                                    bottom:20,
                                    containLabel:true
                                },
                                color:colors,
                                xAxis:{
                                    name:'天',
                                    type:'category',
                                    data:view3.date
                                },
                                yAxis:{ type:'value', name:'(kwh)' },
                                series:view3Series
                            }}
                        />
                    </div>
                </div>               
            </div>
            <table style={{ width:'1152px', margin:'20px 0'}}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                    {
                        finalColumns.map((column,i)=>(
                            <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}} key={i}>{column.title}</th>
                        ))
                    }
                    </tr>
                </thead>
                <tbody>
                    {
                        tableData.map((mach,i)=>{
                            return (
                                <tr key={i}>
                                    {
                                        mach.map((item,j)=>{
                                            return (
                                                <td key={`${i}-${j}`} style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} rowSpan={ i%3 ===0 && item.merged ? '3' : null }>{item.data ? item.data : 0}</td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                            
                        })
                    }
                </tbody>
            </table>
            <table style={{ width:'1152px', margin:'20px 0'}}>
                <thead style={{ backgroundColor:'#f7f7f7' }}>
                    <tr>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>总账户计量电费(元)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>电表计量汇总(kwh)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>总电费占比</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>本月基本电费(元)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>力调电费(元)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>基本电费分摊(元)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>总电费分摊后(元)</th>
                        <th style={{ border:'1px solid rgb(212, 212, 212)', padding:'4px 10px'}}>本月费用汇总(元)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+companyEleCost).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+companyEnergy).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+ratio*100).toFixed(1) + '%' } </td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+baseCost).toFixed(0) } </td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+adjustCost).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+attrBaseCost).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+allTotalCost).toFixed(0) }</td>
                        <td style={{ border:'1px solid rgb(232, 232, 232)', padding:'4px 10px'}} >{ (+allEnergyCost).toFixed(0)  }</td>
                    </tr>
                </tbody>
            </table>
            <div className={style['bottom-container']} ref={el=>multiRefs.current[3] = el}>
                <div>制表:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>复核:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
                <div>接收:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</div>
            </div>
        </div>
        <div style={{textAlign:'center'}}>
            <Button type="primary" onClick={handleTranslateImg} style={{marginRight:'10px'}}>下载报告</Button>
            <Button onClick={()=>onCancel()}>取消</Button>
        </div>  
        </div>
    );
}

export default PreviewReport;
