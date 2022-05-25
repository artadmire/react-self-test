const livereload = require('rollup-plugin-livereload');
const serve = require('rollup-plugin-serve');

module.exports = {
    input: './react/index.js',
    output: {
        file: './dist/bundle.js',
        format: "iife" // es, umd, amd, cjs
    },
    plugins: [
        livereload(),
        serve({
            openPage: "/public/index.html",
            port: 3020,
            contentBase:'./'
        })
    ]
}

// rollup -c // 我默认去找根目录下的 rollup.config.js    -w 监听文件变化，重新编译。