import path from "node:path";
import CopyPlugin from "copy-webpack-plugin";
import HtmlMinimizerPlugin from "html-minimizer-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

export default {
    entry: "./src/index.ts",
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/
        }, {
            test: /\.css$/i,
            include: path.resolve(new URL(".", import.meta.url).pathname, "src"),
            use: ["style-loader", "css-loader", "postcss-loader"]
        }]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: "src/*.html",
                to: "[name][ext]"
            }]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            '...',
            new HtmlMinimizerPlugin(),
            new CssMinimizerPlugin(),
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(new URL(".", import.meta.url).pathname, "dist"),
        clean: true
    },
};
