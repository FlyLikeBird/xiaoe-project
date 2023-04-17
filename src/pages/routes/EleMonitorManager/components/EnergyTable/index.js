import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '@/pages/IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function getTimePeriod(arr){
    return arr.map((date,index)=>{
        let obj = {};
        let prevTime = arr[index].split(' ')[1];
        let nextTime;
        if ( prevTime ){
            obj.width = '120px';
            obj.dataIndex = date;
            obj.render = (text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>);
            if ( index === arr.length - 1) {
                if ( prevTime === '23:00') {
                    nextTime = '00:00';
                } else {
                    let temp = +prevTime.split(':')[0];
                    ++temp;
                    nextTime = temp < 10 ? '0'+temp+':00' : temp+':00';
                }
            } else {
                nextTime = arr[index+1].split(' ')[1]
            }   
            obj.title = (<span>
                { `${prevTime} - ${nextTime}` }
            </span>);   
            return obj;
        }
        
    });
}

function EnergyTable({ dispatch, data, dataType, energyInfo, isLoading, timeType, pagesize, companyName }){
    const [currentPage, setCurrentPage] = useState(1);
    let dateColumns = [];
    // console.log(energyInfo);
    // 获取不同时间维度下的列数据
    if ( !isLoading && data && data.date ){
        if ( timeType === '1'){
            dateColumns = data.date.map(time=>{
                let temp = time.split(' ');
                let prefix = Number(temp[1].split(':')[0]);
                return {
                    title:`${prefix < 10 ? '0' + prefix : prefix }:00-${ prefix+1 < 10 ? '0' + (prefix + 1 ) : prefix + 1 }:00`,
                    width:'120px',
                    render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>),
                    dataIndex:time
                }
            })
        } else if ( timeType === '2') {
            dateColumns = data.date.map(time=>{
                return {
                    title:time,
                    width:'120px',
                    render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>),
                    dataIndex:time
                    
                }
            })
        } else if ( timeType === '3') {
            dateColumns = data.date.map(time=>{
                return {
                    title:time,
                    width:'120px',
                    render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>),
                    dataIndex:time                
                }
            })
        }
    };
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * pagesize + index + 1}`;
            }
        },
        {
            title:'属性',
            key:'attr_name',
            width:'180px',
            fixed:'left',
            dataIndex:'attr_name',
            ellipsis: true,
        },
        {
            title:'能源类型',
            width:'80px',
            key:'energy_name',
            dataIndex:'energy_name'
        },
        {
            title:'能源单位',
            width:'80px',
            key:'unit',
            render:(row)=>{
                return <span>{ dataType === '1' ? '元' : energyInfo.unit }</span>;
            }
        },
        {
            title:'注册码',
            width:'120px',
            key:'regcode',
            dataIndex:'regcode',
            ellipsis:true
        },
        energyInfo.type_code === 'ele'
        ?
        {
            title:'配电房',
            width:'120px',
            key:'ele_room',
            dataIndex:'ele_room'
        }
        :
        {}
        ,
        {
            title:'相关属性',
            key:'related',
            width:'120px',
            dataIndex:'other_attr',
            ellipsis: true,
        },
        {
            title:'相关属性2',
            key:'related',
            width:'120px',
            dataIndex:'other_attr2',
            ellipsis: true
        },
        {
            title: dataType === '1' ? '费用汇总' : '能耗汇总',
            key:'total',
            width:'100px',
            dataIndex:'total',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>)
        },
        // {
        //     title:'尖',
        //     key:'tip',
        //     width:'100px',
        //     dataIndex:'tip',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)

        // },
        // {
        //     title:'峰',
        //     key:'top',
        //     width:'100px',
        //     dataIndex:'top',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        // {
        //     title:'平',
        //     key:'middle',
        //     width:'100px',
        //     dataIndex:'middle',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        // {
        //     title:'谷',
        //     key:'bottom',
        //     width:'100px',
        //     dataIndex:'bottom',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        
        ...dateColumns
    ];
    useEffect(()=>{
        setCurrentPage(1);
    },[data, pagesize])
    return (
        isLoading
        ?
        <Skeleton active className={style['skeleton']} />
        :
        <Table
            columns={columns}
            dataSource={data.value}
            rowKey={(text,record)=>text.attr_name}
            className={style['self-table-container']}
            bordered={true}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}能源${ dataType === '1' ? '成本' : '能耗' }报表`}</div>
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.value.length ){
                                    message.info('数据源为空');
                                } else {
                                    let fileTitle = `统计报表-${ dataType === '1' ? '成本' : '能耗' }报表`;
                                    let aoa = [];
                                    let thead = [];
                                    let colsStyle = [];
                                    columns.forEach(col=>{
                                        thead.push(col.title);
                                        colsStyle.push({ wch:16 });
                                    });
                                    aoa.push(thead);
                                    data.value.forEach((item,index)=>{
                                        let temp = [];
                                        temp.push(index + 1);
                                        columns.forEach((col,j)=>{
                                            if ( col.dataIndex ){
                                                temp.push(item[col.dataIndex] || '-- --');
                                            } else if ( col.key === 'unit') {
                                                temp.push(dataType === '1' ? '元' : energyInfo.unit )
                                            }
                                        })
                                        aoa.push(temp);
                                    });
                                    // console.log(aoa);
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = colsStyle;
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                }
                               
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
            scroll={ { x:1000 }}
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={{ 
                total:data.value ? data.value.length : 0, 
                current:currentPage,
                pageSize:pagesize,
                showSizeChanger:false                
            }}
        />
    )
};

EnergyTable.propTypes = {
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.isLoading !== nextProps.isLoading || prevProps.pagesize !== nextProps.pagesize ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EnergyTable, areEqual);