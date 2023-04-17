import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '@/pages/routes/IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function EnergyTable({ dispatch, data, energyInfo, timeType, startDate, endDate, dataType, companyName, pagesize }){
    const [currentPage, setCurrentPage] = useState(1);
    const columns = [
       
        {
            title:'属性',
            key:'attr_name',
            width:'180px',
            fixed:'left',
            dataIndex:'attr_name',
            ellipsis: true,
        },
        {
            title:'单位',
            width:'80px',
            key:'unit',
            render:(row)=>{
                return <span>{ dataType === '1' ? '元' : energyInfo.unit }</span>;
            }
        },
        {
            title: dataType === '1' ? '成本汇总' : '能耗汇总',
            key:'total',
            width:'100px',
            dataIndex:'total',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>)
        },
        {
            title:'尖',
            key:'tip',
            width:'100px',
            dataIndex:'tip',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)

        },
        {
            title:'峰',
            key:'top',
            width:'100px',
            dataIndex:'top',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        },
        {
            title:'平',
            key:'middle',
            width:'100px',
            dataIndex:'middle',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        },
        {
            title:'谷',
            key:'bottom',
            width:'100px',
            dataIndex:'bottom',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        }
    ];
    useEffect(()=>{
        setCurrentPage(1);
    },[data, pagesize]);
    return (
       
        <Table
            columns={columns}
            dataSource={data}
            rowKey='attr_id'
            className={style['self-table-container']}
            bordered={true}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}复合计费${ dataType === '1' ? '成本' : '能耗' }报表`}</div>
                        <div>
                        <Button size="small" type="primary" style={{ marginRight:'6px' }} onClick={()=>{                           
                                if ( !data.length ){
                                    message.info('数据源为空');
                                } else {
                                    let dateStr =  
                                        timeType === '1' 
                                        ?
                                        `${startDate.format('YYYY-MM-DD')}`
                                        :
                                        `${startDate.format('YYYY-MM-DD')}-${endDate.format('YYYY-MM-DD')}`;
                                    
                                    // console.log(dateStr);
                                    let fileTitle = dateStr + `复合计费`;
                                    let aoa = [];
                                    let thead = [];
                                    let colsStyle = [];
                                    thead.push('属性','单位', '对比项', dataType === '1' ? '成本' : '能耗');
                                    thead.forEach(col=>{
                                        colsStyle.push({ wch:16 });
                                    });
                                    aoa.push(thead);
                                    let timePeriod = [{ title:'汇总', dataIndex:'total' }, { title:'尖', dataIndex:'tip' }, { title:'峰', dataIndex:'top'}, { title:'平', dataIndex:'middle'}, { title:'谷', dataIndex:'bottom'}]
                                    data.forEach((item,index)=>{
                                        timePeriod.forEach((time,j)=>{
                                            let row = [];
                                            if ( j === 0 ){
                                                row.push(item.attr_name);
                                                row.push(dataType === '1' ? '元' : energyInfo.unit );
                                                row.push(time.title);
                                                row.push(item[time['dataIndex']]);
                                            } else {
                                                row.push(null);
                                                row.push(null);
                                                row.push(null);
                                                row.push(time.title);
                                                row.push(item[time['dataIndex']]);
                                            }
                                            aoa.push(row);
                                        })                                  
                                    });
                                    // console.log(aoa);
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = colsStyle;
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                }
                               
                            
                        }}>导出竖版</Button>
                        <Button size="small" type="primary" onClick={()=>{                           
                                if ( !data.length ){
                                    message.info('数据源为空');
                                } else {
                                    let dateStr =  
                                        timeType === '1' 
                                        ?
                                        `${startDate.format('YYYY-MM-DD')}`
                                        :
                                        `${startDate.format('YYYY-MM-DD')}-${endDate.format('YYYY-MM-DD')}`;
                                    
                                    // console.log(dateStr);
                                    let fileTitle = dateStr + `复合计费`;
                                    let aoa = [];
                                    let thead = [];
                                    let colsStyle = [];
                                    columns.forEach(col=>{
                                        thead.push(col.title);
                                        colsStyle.push({ wch:16 });
                                    });
                                    aoa.push(thead);
                                    data.forEach((item,index)=>{
                                        let row = [];
                                        row.push(index + 1);
                                        columns.forEach(col=>{
                                            if ( col.dataIndex ){
                                                row.push(item[col.dataIndex]);
                                            } else if ( col.key === 'unit' ){
                                                row.push(dataType === '1' ? '元' : energyInfo.unit );
                                            }
                                        });
                                        aoa.push(row);                    
                                    });
                                    // console.log(aoa);
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = colsStyle;
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                }
                               
                            
                        }}>导出横版</Button>
                        </div>
                    </div>
                )
            }} 
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={{ 
                total:data ? data.length : 0, 
                current:currentPage,
                pageSize:pagesize,
                showSizeChanger:false                
            }}
        />
    )
};

EnergyTable.propTypes = {
};

export default EnergyTable;