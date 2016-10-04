/**
 * Created by Moyu on 16/10/4.
 */
var http = require('http');
var qs   = require('querystring');
var config = require('../config.json');

var httpOption = {
    hostname: 'www.weibo.com',
    headers: {
        'Cookie': config.cookie
    }
}

module.exports = {
    getLoc() {
        return new Promise((resolve, reject) => {
            http.request(httpOption, (income) => {
                if(income.statusCode === 302) {
                    resolve(income.headers.location)
                }
            }).on('error', err => reject(err))
            .end()
        })
    },

    getHtml(path) {
        return new Promise((resolve, reject) => {
            http.request(Object.assign({}, httpOption, {path: path}), (income) => {
                var html = '';
                income.setEncoding(null);
                income.on('data', data => html+=data)
                    .on('end', () => resolve(html));
            }).on('error', err => reject(err))
            .end()
        })
    },

    del(mid) {
        return new Promise((resolve, reject) => {
            let ops = Object.assign({}, httpOption, {method: 'POST', path: "/aj/mblog/del"});
            ops.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            ops.headers['Referer'] = 'http://weibo.com/';
            http.request(
                ops,
                income => {
                    var html = '';
                    income.setEncoding(null);
                    income.on('data', data => html+=data)
                        .on('end', () => resolve(html));
                }
            ).on('error', err => reject(err))
            .end('mid='+mid)
        })
    },

    unlike(mid) {
        return new Promise((resolve, reject) => {
            let ops = Object.assign({}, httpOption, {method: 'POST', path: "/aj/v6/like/add"});
            ops.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            ops.headers['Referer'] = 'http://weibo.com/';
            http.request(
                ops,
                income => {
                    var html = '';
                    income.setEncoding(null);
                    income.on('data', data => html+=data)
                        .on('end', () => resolve(html));
                }
            ).on('error', err => reject(err))
                .end(qs.stringify({
                    mid: mid,
                    qid: 'heart',
                    location: 'page_100505_like',
                    loc: 'profile'
                }))
        })
    },

    unfollow(uids) {
        return new Promise((resolve, reject) => {
            let ops = Object.assign({}, httpOption, {method: 'POST', path: "/aj/f/unfollow"});
            ops.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            ops.headers['Referer'] = 'http://weibo.com/';
            http.request(
                ops,
                income => {
                    var html = '';
                    income.setEncoding(null);
                    income.on('data', data => html+=data)
                        .on('end', () => resolve(html));
                }
            ).on('error', err => reject(err))
                .end(qs.stringify({
                    uid: uids.join(','),
                    refer_flag: 'unfollow_all'
                }))
        })
    }
}
