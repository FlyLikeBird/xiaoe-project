import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
      type: 'none',
    },
    routes: [
      { path:'/login', component:'@/pages/routes/LoginPage'},
      { path: '/', component: '@/pages/routes/IndexPage' },
    ],
    fastRefresh: {},
    hash:true,
    // chainWebpack(config){
    //     config.optimization.splitChunks({
    //         chunks: 'all',
    //         minSize: 30000,
    //         minChunks: 1,
    //         automaticNameDelimiter: '.',
    //         cacheGroups: {
    //             vendors: {
    //               name: 'vendors',
    //               test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|redux-saga|dva)[\\/]/,
    //               priority: 10,
    //               enforce:true
    //             },
    //             echarts: { 
    //                 name: "echarts",
    //                 test: /[\\/]node_modules[\\/](echarts)[\\/]/,
    //                 priority: 10,
    //                 enforce: true,
    //             },
    //             utils: { 
    //                 name: "utils",
    //                 test: /[\\/]node_modules[\\/](moment|html2canvas)[\\/]/,
    //                 priority: 10,
    //                 enforce: true,
    //             },
    //         }
    //     })
    // }
});
