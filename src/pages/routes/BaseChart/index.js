import React ,{ useEffect, useState, useRef} from 'react';
import { Radio } from 'antd';

function BaseChart({ option, activeKey, innerActiveKey }){
    const echartsRef = useRef();
    const activeKeyRef = useRef();
    
    return (
        <div style={{ height:'100%' }} ref={echartsRef}></div>
    )
}

export default BaseChart;