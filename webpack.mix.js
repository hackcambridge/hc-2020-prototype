const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */


mix
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: { node: true } } ],
                            '@babel/typescript',
                            '@babel/react'
                        ],
                    },
                    exclude: /node_modules/,
                },
                {
                    test:/\.less$/,
                    loader: "less-loader",
                    options: {
                        javascriptEnabled: true
                    }
                },
            ],
        },
        resolve: {
            extensions: ['*', '.js', '.jsx', '.vue', '.ts', '.tsx'],
        },
    })
    .ts('resources/js/scenes/dashboard.tsx', 'assets/js')
    .ts('resources/js/scenes/sponsors.tsx', 'assets/js')
    .ts('resources/js/scenes/committee.tsx', 'assets/js')
    .sass('resources/sass/app.scss', 'assets/css')
    .sass('resources/sass/home.scss', 'assets/css');

if (mix.inProduction()) {
    mix.version();
}
