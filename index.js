const fetch = require("node-fetch")
const p1 = require('node-html-parser');
const fs = require('fs')





// --------------------------- CHANGE THESE --------------------------- //
var start_chapter = 1
var end_chapter = 2
var phpSession = "PHPSESSID=7ag0qg5iuut9l0f5ifedglqhoo;"//Example (IN THIS FORMAT)-->  PHPSESSID=7ag0qg5iuut9l0f5ifedglqhoo; <------ 
//login to https://digital.wwnorton.com to get PHPSession cookie ^^^^
// ------------------------------------------------------------------- //
var bookURL = "https://digital.wwnorton.com/ebooks/epub/givemeliberty6brv1/EPUB/content/" //Default
//Make sure you have access to the book and its in this format ^^
// ------------------------------------------------------------------- //






class Chapter {
    constructor(number) {
        this.number = number;
        this.rootURL = bookURL
        this.cookies = ""
        this.body = ""
        this.parsed = ""
        this.topicQuestions = []
        this.keyTerms = []
    }
    setCookies(cookies) {
        this.cookies = cookies
    };

    async getChapterInfo(chapter, section) {
        var headers = new fetch.Headers()
        headers.append("accept-language", "en-US,en;q=0.9");
        headers.append("cookie", this.cookies);
        headers.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36");
        var res = await fetch(this.rootURL + `${chapter}.${section}-chapter0${chapter}.xhtml`, { headers: headers })

        return await res.text()
    };
    //Getting Topic Questions in Chapter
    async getQuestions() {
        if (this.body == "") {
            var resBody = await this.getChapterInfo(this.number, 0)
            var parsedBody = p1.parse(resBody)
            for (var question of parsedBody.querySelectorAll(".focus-q-text")) {
                let topicQuestion = {
                    sectionNumber: question.querySelector("a").getAttribute("href")[2],
                    questionUrl: this.rootURL + question.querySelector("a").getAttribute("href"),
                    questionDesc: question.querySelector("i").text
                }
                this.topicQuestions.push(topicQuestion) //Gets all the sections of each chapter
            }
        }
    }
    async gatherTopics() {
        for (var tq of this.topicQuestions) {
            //Parsing titles of page
            var resBody = await this.getChapterInfo(this.number, tq.sectionNumber)
            var cq = this.topicQuestions[tq.sectionNumber - 1]
            var parsedBody = p1.parse(resBody)
            cq.title = parsedBody.querySelector("title").text
            cq.subsections = []


            //Page number attempts to grab from HTML
            var pageNum = ""
            for (var section of parsedBody.querySelectorAll(".doc-section").slice(1)) {
                if (section.querySelector(".section-subtitle") != null) {
                    if (section.querySelector("span") != null) {
                        pageNum = section.querySelector("span").id
                    }
                    var sub = {
                        subtitle: section.querySelector(".section-subtitle").text + " (" +pageNum+ ")",
                        sentences: []
                    }
                    for (var p of section.querySelectorAll(".chapter-text")) {
                        var sens = p.text.split(".")
                        sub.sentences.push(sens[0]) //Grabs each topic sentence
                    }
                }
                cq.subsections.push(sub)
            }
        }
    }
    async getTerms() {
        var resBody = await this.getChapterInfo(this.number, this.topicQuestions.length + 1)
        var parsedBody = p1.parse(resBody)
        for (var term of parsedBody.querySelectorAll(".review-terms")) {
            var keyTerm = {
                term: term.text,
                description: parsedBody.querySelector("#" + term.querySelectorAll("a")[0].id.replace("refover-", "")).text
            }
            this.keyTerms.push(keyTerm)
        }
    }
}


async function main() {
    var termList = "" //term info string
    var chapterList = "" //Chapter info string
    for (let i = start_chapter; i <= end_chapter; i++) {
        var chap = new Chapter(i)
        chap.setCookies(phpSession)
        await chap.getQuestions()
        await chap.gatherTopics()
        await chap.getTerms()

        //Formatting of Terms
        termList += "Chapter " + chap.number.toString() + "\r" + "\r"
        for (term of chap.keyTerms) {
            termList += term.term + "\r"
            termList += term.description + "\r" + "\r"
        }

        //Formatting of Chapters
        chapterList += "Chapter " + chap.number.toString() + "\r" + "\r" + "\r"
        for (var section of chap.topicQuestions) {
            chapterList += "~ " + section.title + " ~\r" + "\r"
            for (var sub of section.subsections) {
                chapterList += sub.subtitle + "\r"
                for (s of sub.sentences) {
                    chapterList += "    • " + s + "\r"
                }
                chapterList += "\r"
            }
        }
    }
    fs.writeFile('chapters.txt', chapterList, err => {
        if (err) {
            console.error(err)
            return
        }
    })
    fs.writeFile('terms.txt', termList, err => {
        if (err) {
            console.error(err)
            return
        }
    })
}


main()