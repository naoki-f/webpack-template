const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const jsBasePath = path.resolve(__dirname, 'src/');

const targets = glob.sync(`${jsBasePath}/**/*.*`, {
  ignore: ['**/_*','**/*.{pug,jpg,png,gif,svg}']
});

const entries = {};
targets.forEach(value => {
  const re = new RegExp(`${jsBasePath}/`);
  const keyTarget = value.replace(re, '');
  const key = keyTarget.replace(/\.(js|scss)$/g, '');
  entries[key] = value;
});


module.exports =  ( env, argv ) => (
  {
    entry: entries,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
    },

    // 最適化オプションを上書き
    optimization: {
      minimizer: [
        new TerserPlugin({}),
        new OptimizeCssAssetsPlugin({})
      ]
    },

    devtool: 'inline-source-map',

    module: {
      rules: [
        {
            enforce: "pre",
            test: /\.js$/,
            exclude: /(node_modules|dist)/,
            loader: "eslint-loader",
            options: {
                fix: true
            }
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          ],
          exclude: /(node_modules|dist)/,
        },
        // css/sass-loaderの設定
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true //ソースマップを有効
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true, //ソースマップを有効
                plugins: [
                    require('autoprefixer')({
                      grid: true
                  })
                ]
              }
            },
            {
              //sassをcssに変換
              loader: 'sass-loader',
              options: {
                sourceMap: true //ソースマップを有効
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
      }),
      new FixStyleOnlyEntriesPlugin()
    ]
  }
);
