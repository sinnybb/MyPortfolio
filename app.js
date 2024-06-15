require('dotenv').config();  // .env 파일의 환경 변수를 로드

const express = require('express');
const ejs = require('ejs');
const app = express();
const mysql = require('mysql2');
const port = process.env.PORT || 3000; // 포트 설정
const bodyParser = require('body-parser');
const session = require('express-session')

// 데이터베이스 연결 설정
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.set('view engine', 'ejs');
app.set('views', './views');


// 미들웨어
app.use(bodyParser.urlencoded({ extended: false })); // 바디
app.use(session({ secret: 'Believe1003!', cookie:{maxAge:60000}, resave:true, saveUninitialized:true})) //쿠키 처리 // secret: 고유의 문자열로 지정
app.use(function (req, res, next) {

    res.locals.user_id = "";
    res.locals.name = "";

    if(req.session.member){
        res.locals.user_id = req.session.member.user_id
        res.locals.name = req.session.member.name
    }
    next()
  })



// 라우팅
app.get('/', (req, res) => {
    console.log(req.session.member)
    res.render('index');    // ./views/index.ejs으로 랜더링
});

app.get('/profile', (req, res) => {
    res.render('profile');    // ./views/profile.ejs으로 랜더링
});

app.get('/project', (req, res) => {
    res.render('project');
});

app.get('/activity', (req, res) => {
    res.render('activity');
});

app.get('/habit', (req, res) => {
    res.render('habit');
});

app.get('/inquiry', (req, res) => {
    res.render('inquiry');
});

// 뷰어의 값을 받아 데이터베이스에 저장
app.post('/contactProc', (req, res) => {
    const { name, phone, email, content } = req.body;

    // 특수문자 처리를 위해 값을 ?로 대체
    const sql = `INSERT INTO inquiry(name, phone, email, content, regdate)
                 VALUES (?,?,?,?, NOW())`;

    const values = [name, phone, email,content]

    connection.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log('Data inserted');
        res.send("<script> alert('Successfully Registered Your Inquiry'); location.href = '/' </script>");
    });
});


// 문의리스트 확인(관리자>노출x)
app.get('/inquiryList', (req, res) => {
    const sql = `select * from inquiry order by idx desc`
    connection.query(sql, function(err, results, fields){
        if(err) throw err;
        res.render('inquiryList', {lists:results});  // results 값을 lists 형태로 inquiryList.ejs에 렌더링
    });
});

// 문의 사항 삭제 처리
app.get('/inquiryDelete', (req,res) => {
    const idx = req.query.idx
    const sql = `delete from inquiry where idx = ${idx}`
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log('Data Deleted');
        res.send("<script> alert('Successfully Deleted Inquiry'); location.href = '/inquiryList' </script>");
    });
})

// 로그인 폼 부분
app.get('/login', (req,res) => {
    res.render('login')
})

// 로그인 프록시
app.post('/loginProc', (req, res) => {
    const user_id = req.body.user_id;
    const pw = req.body.pw;

    const sql = `select * from member where user_id=? and pw=?`
    const values = [user_id, pw];

    connection.query(sql, values, function (err, result) {
        if (result.length == 0 ){  // 해당 값(아이디, 비번)이 있는지를 출력 값의 존재 유무(길이)로 파악
            res.send("<script> alert('ID or PW does not exist.'); location.href = '/login' </script>");
        } else{
            console.log(result[0]);

            req.session.member = result[0]
            res.send("<script> alert('You are successfully logged in.'); location.href = '/' </script>");
        }  
    });
});


// 로그아웃
app.get('/logout', (req, res) => {

    req.session.member = null;
    res.send("<script> alert('You have been logged out.'); location.href = '/' </script>");

});


app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속 주소 : http://localhost:${port}`);
});
