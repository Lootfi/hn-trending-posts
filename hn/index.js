var request = require('request');
var cheerio = require('cheerio');

module.exports = async function (context) {

    function req(url) {
        return new Promise(function (resolve, reject) {
            request(url, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
    }

    let news = []
    let body = await req("https://news.ycombinator.com/");

    var $ = cheerio.load(body);

    $('tr.athing:has(td.votelinks)').each(function () {
        const title = $(this).find('td.title > a').text().trim();
        const link = $(this).find('td.title > a').attr('href');
        const score = parseInt($(this).next().find('td.subtext > span.score').text().trim().split(" points")[0]);

        if (!/^Ask HN|Tell HN|Show HN/.test(title)) {
            news = [
                ...news,
                {
                    title,
                    link,
                    score
                }
            ];
        }

    });

    context.res.body = news.sort(function (a, b) {
        return b.score - a.score;
    })
}