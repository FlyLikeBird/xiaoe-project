import React from 'react';
import { Redirect } from 'dva/router';
import style from './LoginPage.css';
import bgImg from '../../../../public/bg1.png';
import LoginContainer from './LoginContainer';

function LoginPage(){
    return (
        localStorage.getItem('user_id')
        ?
        <Redirect to='/' />
        :
        <div className={style['container']}>
            <div className={style['bg-container']} style={{ backgroundImage:`url(${bgImg})` }}></div>
            <div className={style['content-container']}>
                <LoginContainer />
            </div>
        </div>
    )
}

export default LoginPage;