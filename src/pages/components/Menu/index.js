import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Link } from 'dva/router';
import { Menu, Button } from 'antd';
import { 
    PayCircleOutlined, 
    MailOutlined, 
    UserOutlined, 
    BarsOutlined, 
    SettingOutlined, 
    SearchOutlined, 
    FormOutlined, 
    FileTextOutlined,
    BarChartOutlined,
    ThunderboltOutlined,
    PieChartOutlined,
    AlertOutlined,
    DesktopOutlined 
} from '@ant-design/icons';
import style from './Menu.css';

const { SubMenu } = Menu;
const IconsObj = {
    'home':<DesktopOutlined style={{ fontSize:'1.2rem' }}/>,
    'cost_monitor':<PayCircleOutlined style={{ fontSize:'1.2rem' }}/>,
    'energy_monitor':<BarChartOutlined style={{ fontSize:'1.2rem' }}/>,
    'ele_quality':<ThunderboltOutlined style={{ fontSize:'1.2rem' }}/>,
    'analyze_manage':<PieChartOutlined style={{ fontSize:'1.2rem' }}/>,
    'stat_report':<FileTextOutlined style={{ fontSize:'1.2rem' }} />,
    'warning_manage':<AlertOutlined style={{ fontSize:'1.2rem' }}/>,
    'user_manage':<UserOutlined style={{ fontSize:'1.2rem' }}/>
}

const MenuComponent = ({ global, dispatch})=>{
    const { currentMenu, userMenu, containerWidth, activeKey, tabPaneList, collapsed } = global;
    const [openKeys, setOpenKeys] = useState([]);
    // console.log(currentMenu, currentPath);
    // let selectedKeys = currentMenu.children ? [currentMenu.children[0]+''] : [currentMenu.menu_id+''];
    // let openKeys = currentMenu.children ? [currentMenu.menu_id+''] : [currentMenu.parent+''];
    let option = {
        mode:'inline',
        className:style['container'],
        selectedKeys:[activeKey],
        inlineCollapsed:collapsed
    }
    if ( !collapsed ){
        option.openKeys = openKeys;
    }
    useEffect(()=>{
        setOpenKeys([currentMenu.menu_code]);
    },[currentMenu])
    return (
            <Menu
                {...option}
            >                
                {
                    userMenu.map(item => (
                        <SubMenu 
                            key={item.menu_code}
                            onTitleClick={()=>{
            
                                if ( item.menu_code === 'home' ){
                                    dispatch({ type:'global/setActiveKey', payload:{ activeKey:item.menu_code , tabPaneList:null }});
                                }
                                if ( openKeys.filter(i=>i === item.menu_code).length ) {
                                    setOpenKeys([]);
                                } else {
                                    setOpenKeys([item.menu_code]);   
                                }
                            }} 
                            onClick={({ item, key })=>{
                                let temp = null;
                                if ( tabPaneList.filter(i=>i.key === key).length) {
                                    // 该标签页已经存在
                                    dispatch({ type:'global/setActiveKey', payload:{ activeKey:key, tabPaneList:null }});
                                } else {
                                    let { menu_code, menu_id, menu_name } = item.props.data || {};
                                    temp = [...tabPaneList, { title:menu_name, key:menu_code, collapsed:true } ];
                                    dispatch({ type:'global/setActiveKey', payload:{ activeKey:key, tabPaneList:temp  }});
                                }
                            }}
                            title={
                            <div>
                                { IconsObj[item.menu_code] }
                                <span className={style['menu-name']}>{ item.menu_name }</span>
                                <span className={style['arrow-button']}></span>
                            </div>
                        } >                      
                            {
                                item.child && item.child.length 
                                ?
                                item.child.map(sub => (
                                    <Menu.Item key={sub.menu_code} data={sub}>{ sub.menu_name }</Menu.Item>
                                ))
                                :
                                null
                            }
                        </SubMenu>
                       
                    ))
                }   
            </Menu>
    )
}

export default connect(({ global })=>({ global }))(MenuComponent);