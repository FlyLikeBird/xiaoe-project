import React, { useRef } from 'react';
import { Radio, Tooltip } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import style from '../IndexPage.css';
import html2canvas from 'html2canvas';
function getNodesDeep(node, nodes, links, parentNode, deep = 0){
    let obj = {
        name:node.attr_name,
        key:node.attr_id,
        depth:deep,
        ele_cost:Math.floor(node.cost),
        ele_energy:Math.floor(node.energy)
    }
    nodes.push(obj);
    if ( parentNode ){
        links.push({ source:parentNode.name, target:node.attr_name, value:Math.floor(node.cost), ele_cost:Math.floor(node.cost), ele_energy:Math.floor(node.energy) })
    }
    parentNode = obj;
    if ( node.children && node.children.length ){
        node.children.forEach(item=>{
            let temp = deep;
            ++temp;
            getNodesDeep(item, nodes, links, parentNode, temp)
        })
    }
}

let levels = [{
    depth: 0,
    itemStyle: {
        color: '#219afa'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#219afa' // 0% 处的颜色
            }, {
                offset: 1, color: '#e24466' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 1,
    itemStyle: {
        color: '#e24466'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#e24466' // 0% 处的颜色
            }, {
                offset: 1, color: '#693be7' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 2,
    itemStyle: {
        color: '#693be7'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#693be7' // 0% 处的颜色
            }, {
                offset: 1, color: '#45e46b' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}, {
    depth: 3,
    itemStyle: {
        color: '#45e46b'
    },
    lineStyle: {
        color: {
            type: 'linear',
            x: 0,                 // 左上角x
            y: 0,                 // 左上角y
            x2: 1,                // 右下角x
            y2: 0,                // 右下角y
            colorStops: [{
                offset: 0, color: '#45e46b' // 0% 处的颜色
            }, {
                offset: 1, color: '#decbe4' // 100% 处的颜色
            }],
        },
        opacity: 0.2
    }
}];

function FlowChart({ data, energyInfo, theme,  dispatch }){
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#fff' : '#000';
    let nodes = [], links = [];
    getNodesDeep(data, nodes, links);
    // console.log(JSON.stringify(nodes));
    // console.log(JSON.stringify(links));
    const onEvents = {
        'click':(params)=>{
            // console.log(params);
            if(params.dataType === 'node' && params.type === 'click'){
                dispatch({ type:'efficiency/fetchFlowChart', payload:{ clickNode:{ title:params.data.name, key:params.data.key, depth:params.data.depth } }});
            }
        }
    };

    return (
        <div style={{ height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = '能源流向图';
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
                
            }}>
                <Radio.Button value='download'><Tooltip title='导出图片'><PictureOutlined /></Tooltip></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                onEvents={onEvents}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        trigger:'item',
                        triggerOn:'mousemove',
                        formatter:(params)=>{
                            if ( params.data.source && params.data.target ) {
                                return `${params.data.source} -- ${params.data.target}:<br/>能耗值:${params.data.ele_energy}kwh<br/>成本:${params.data.ele_cost}元`;
                            } else if ( params.data.name ){
                                return `${params.data.name}:<br/>能耗值:${params.data.ele_energy}kwh<br/>成本:${params.data.ele_cost}元`;
                            }
                        }
                    },
                    series:[
                        {
                            type:'sankey',
                            top:40,
                            nodeWidth:24,
                            nodeGap:12,
                            layoutIterations:0,
                            focusNodeAdjacency: true,
                            itemStyle: {
                                borderWidth: 0,
                                borderColor: '#fff',
                                color: '#2c3b4d'
                            },
                            lineStyle: {
                                show: true,
                                width: 1,
                                opacity: 0.8,
                                curveness: 0.7, //桑基图边的曲度
                                type: 'solid',
                                color: '#57e29f'
                            },
                            label:{
                                color:textColor,
                                padding:[10,0,10,0],
                                formatter:params=>{
                                    return `${params.data.name}(${params.data.ele_energy}${energyInfo.unit})`
                                }
                            },
                            data:nodes,
                            links:links,
                            levels:levels,
                            lineStyle: {
                                curveness: 0.5
                            }
                        }
                    ]
                }}
            />
        </div>
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(FlowChart, areEqual);