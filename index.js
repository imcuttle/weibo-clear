/**
 * Created by Moyu on 16/10/4.
 */
var spider  = require('./spider');
var url     = require('url');
var qs      = require('querystring');
var cheerio = require('cheerio');

function makeIncArray(low, high) {
    let arr = [];
    for (let i = low; i <= high; i++) {
        arr.push(i);
    }
    return arr;
}

function arrRemoveDuplicate(arr) {
    let map = {}
    return arr.reduce((p, n) => {
        if(!!map[n]) {
            return p;
        } else {
            map[n] = true;
            return p.concat(n);
        }
    }, [])
}


function unlikeWeibo(low, high) {
    const arr = makeIncArray(low, high);
    return spider
        .getLoc()
        .then(location => {
            location = location.replace(/\/[^\/]*$/, '/like').replace(/^\/[^\/]*/, '')
            let obj = url.parse(location, true);
            let path = obj.pathname + '?';
            return Promise.all(
                arr.map(
                    page => {
                        const tPath =  path + qs.stringify(Object.assign( {page: page}, obj.query) );
                        console.log(tPath)
                        return Promise.all([
                            spider.getHtml(tPath + '&mod=like'),
                            spider.getHtml(`/p/aj/v6/mblog/mbloglist?domain=100505&pagebar=0&tab=like&id=1005052848472365&feed_type=0&page=${page}&pre_page=${page}`),
                            spider.getHtml(`/p/aj/v6/mblog/mbloglist?domain=100505&pagebar=1&tab=like&id=1005052848472365&feed_type=0&page=${page}&pre_page=${page}`)
                        ])
                    }
                )
            )
        })
        .then(htmls => {
            // let $ = cheerio.load(htmls[0]);
            // console.log($('.WB_cardwrap').length)
            htmls.forEach(html => {
                html = html.reduce((p, n) => p+n, '')
                arrRemoveDuplicate(html.match(/ mid=\\".+?\\"/g)
                    .map(x => {
                        x=x.substring(x.indexOf('rm')+1);
                        return x.replace(/[^\d]*/g, '')
                    })
                ).forEach(mid => {
                    unlikeWeibo.queue = unlikeWeibo.queue || []
                    unlikeWeibo.queue.push(mid);
                    if(unlikeWeibo.lock) {
                        return;
                    }
                    unlikeWeibo.lock = setTimeout(function() {
                        var fn = arguments.callee;
                        if(unlikeWeibo.queue==null || unlikeWeibo.queue.length<=0) {
                            clearTimeout(unlikeWeibo.lock);
                            delete unlikeWeibo.queue;
                            delete unlikeWeibo.lock;
                        }
                        var mid = unlikeWeibo.queue.shift();
                        console.log('will unlike:', mid);
                        spider.unlike(mid)
                            .then(x => {
                                console.log(x, mid);
                                setTimeout(fn, 3000);
                            })
                            .catch(err => console.error)
                    }, 5000)
                })
            })
        }).catch(err => console.error)
}


function delWeibo(low, high) {
    const arr = makeIncArray(low, high);
    spider
        .getLoc()
        .then(location => {
            location = location.replace(/\/[^\/]*$/, '/profile').replace(/^\/[^\/]*/, '')
            let obj = url.parse(location, true);
            let path = obj.pathname + '?';
            return Promise.all(
                arr.map(
                    page => {
                        const tPath =  path + qs.stringify(Object.assign( {page: page}, obj.query) );
                        console.log(tPath)
                        return Promise.all([
                            spider.getHtml(tPath),
                            spider.getHtml(`/p/aj/v6/mblog/mbloglist?domain=100505&pagebar=0&id=1005052848472365&feed_type=0&page=${page}&pre_page=${page}`),
                            spider.getHtml(`/p/aj/v6/mblog/mbloglist?domain=100505&pagebar=1&id=1005052848472365&feed_type=0&page=${page}&pre_page=${page}`)
                        ])
                    }
                )
            )
        })
        .then(htmls => {
            // let $ = cheerio.load(htmls[0]);
            // console.log($('.WB_cardwrap').length)
            htmls.forEach(html => {
                html = html.reduce((p, n) => p+n, '')
                arrRemoveDuplicate(html.match(/ mid=\\".+?\\"/g)
                    .map(x => {
                        x=x.substring(x.indexOf('rm')+1);
                        return x.replace(/[^\d]*/g, '')
                    })
                ).forEach(mid => {
                    console.log('will delete:', mid);
                    // setTimeout
                    spider.del(mid)
                        .then(x => console.log(x, mid))
                        .catch(err => console.error)
                })
            })
        }).catch(err => console.error)
}


function unfollowWeibo(low, high) {
    const arr = makeIncArray(low, high);
    spider
        .getLoc()
        .then(location => {
            location = location.replace(/\/[^\/]*$/, '/follow').replace(/^\/[^\/]*/, '')
            let obj = url.parse(location, true);
            let path = obj.pathname + '?';
            path = '/p/1005052848472365/myfollow?t=1&'
            return Promise.all(
                arr.map(
                    page => {
                        const tPath =  path + qs.stringify(Object.assign( {Pl_Official_RelationMyfollow__98_page: page}, obj.query) );
                        console.log(tPath)
                        return Promise.all([
                            spider.getHtml(tPath)
                        ])
                    }
                )
            )
        })
        .then(htmls => {
            // let $ = cheerio.load(htmls[0]);
            // console.log($('.WB_cardwrap').length)
            htmls.forEach(html => {
                html = html.reduce((p, n) => p+n, '')
                var arr = arrRemoveDuplicate(html.match(/ action-data=\\"uid=.+?\\"/g)
                    .map(x => {
                        x=x.substring(x.indexOf('uid')+1, x.indexOf('&'));
                        return x.replace(/[^\d]*/g, '')
                    })
                )

                arr = arr.map(x => Number(x))
                var arr2 = arr.splice(0, arr.length >> 1)
                // setTimeout
                spider.unfollow(arr)
                    .then(x => console.log(x))
                    .catch(err => console.error)

                spider.unfollow(arr2)
                    .then(x => console.log(x))
                    .catch(err => console.error)
            })
        }).catch(err => console.error)
}


// delWeibo(1, 20)
unlikeWeibo(1, 1)
// unfollowWeibo(1, 11)