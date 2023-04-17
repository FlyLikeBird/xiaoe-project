import React, { useState } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import style from '../../../IndexPage.css';

function BaseCostTable({ data, forAdjust }){
    let dateColumns = []; 
    let columns;
    if ( forAdjust ){
        columns = [
            {
                title:'时间',
                dataIndex:'date'
            },
            {
                title:'总有功电量',
                dataIndex:'useEnergy'
            },
            {
                title:'总无功电量',
                dataIndex:'uselessEnergy'
            },
            {
                title:'实际功率因素',
                dataIndex:'factor'
            },
            {
                title:'功率因素考核值',
                dataIndex:'factorRef'
            },
            {
                title:'(  基本电费',
                dataIndex:'baseCost'
            },
            {
                title:'+',
                dataIndex:'plus',
                render:(value)=>{return ''}
            },
            {
                title:'电度电费  )',
                dataIndex:'eleCost'
            },
            {
                title:'*',
                dataIndex:'multiply',
                render:(value)=>{return ''}
            },
            {
                title:'力调系数',
                dataIndex:'ratio'
            },
            {
                title:'=',
                dataIndex:'equal',
                render:(value)=>{return ''}
            },
            {
                title:'力调电费',
                dataIndex:'adjustcost'
            }
        ];
    } else {
        columns = [
            {
                title:'时间',
                dataIndex:'date'
            },
            {
                title:'监控点',
                dataIndex:'mach_name'
            },
            {
                title:'按容量计算',
                children:[
                    {
                        title:'容量(kva)',
                        dataIndex:'total_kva'
                    },
                    {
                        title:'单价(元/kva·月)',
                        dataIndex:'kva_price'
                    },
                    {
                        title:'电费(元)',
                        dataIndex:'kva_amount'
                    }
                ]
            },
            {
                title:'按需量计算',
                children:[
                    {
                        title:'本月最大需量(kva)',
                        dataIndex:'maxDemand'
                    },
                    {
                        title:'单价(元/kva·月)',
                        dataIndex:'demand_price'
                    },
                    {
                        title:'电费(元)',
                        dataIndex:'demand_amount'
                    }
                ]
            },
            {
                title:'差价(元)',
                dataIndex:'d_value',
                render:(value)=>(<a>{(+value).toFixed(2)}</a>)
            }
        ];
    }
    
    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey={(text,record)=>text.date}
            className={style['self-table-container']}
            bordered={true}
            pagination={false}
            title={()=>{
                return (
                    <div>
                        <span>{ forAdjust ? '力调电费(无功罚款)统计表':'需量/容量计费分析'}</span>
                    </div>
                );
            }} 
        />
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(BaseCostTable, areEqual);