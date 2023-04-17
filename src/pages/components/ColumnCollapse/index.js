import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Radio, Form, Upload, message } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import style from './ColumnCollapse.css';

let canDrag = false;
let startX = 0;
let moveX = 0;

function ColumnCollapse({ sidebar, content, global, activeKey }){
    const pointerRef = useRef();
   
    const [width, setWidth] = useState(250); 
    let contentWidth = global.contentWidth;
    let offsetLeft = global.containerWidth - global.contentWidth;
    let hidden = width <= 20 ? true : false;
    let padding = global.containerWidth < 1440 ? 10 : 14;
    useEffect(()=>{
        let dom = pointerRef.current;
        if ( dom ){
            const handleMouseDown = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                startX = e.clientX;
                canDrag = true;
            };
            const handleMouseOver = e=>{
                // console.log('mouseover');
                e.stopPropagation();
                e.preventDefault();
                if ( !canDrag ) return;
                moveX = e.clientX - startX ;
                startX = e.clientX;
                setWidth((width)=>{
                    let result = width + moveX;
                    if ( result >= contentWidth/2 ) {
                        return contentWidth/2;
                    } else if ( result <= 20 ) {
                        return 0;
                    }
                    return result;
                });
                
            }
            const handleMouseUp = e=>{
                e.stopPropagation();
                e.preventDefault();
                canDrag = false;        
            }
            dom.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseOver);
            return ()=>{
                dom.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('mousemove', handleMouseOver);
            }
        }
    },[]);
    return (
        <div className={style['container']}>
            <div style={{ width: width + 'px', marginRight: hidden ? '0' : padding + 'px', left:padding + 'px' }} className={style['sidebar-container']} >
                {  sidebar }
                <div className={style['flex-pointer']} ref={pointerRef} style={{ left:`${offsetLeft + padding + width - 6 }px` }}></div>             
            </div>
            
            <div className={style['content-container']} style={{ left: padding + width + ( hidden ? 0 : padding ) + 'px', width:`calc( 100% - ${width + padding * 2 + ( hidden ? 0 : padding )}px)` }}>
                { content }
                {
                    hidden
                    ?
                    <div 
                        className={style['collapse-button']} 
                        onClick={()=>setWidth(250)} 
                    >
                        <DoubleRightOutlined />
                    </div>
                    :
                    null
                }              
            </div>
        </div>
               
    )
};

ColumnCollapse.propTypes = {
};

export default connect(({ global })=>({ global }))(ColumnCollapse);