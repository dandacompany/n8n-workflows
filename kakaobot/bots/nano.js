function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // 요청을 보낼 URL과 인증 토큰 설정
    var url = "https://n8n.dante-datalab.com/webhook/nanobanana";
    var token = "C8yic4maVrBqqk941KKct";

    // "/nano"로 시작하지 않으면 함수 종료
    if(!msg.startsWith("/nano")) {    
        return;
    }

    // 처리 중임을 사용자에게 알림
    replier.reply("🤖 요청을 처리 중입니다...");

    try {
      // Jsoup을 이용해 POST 요청 준비
      var conn = org.jsoup.Jsoup.connect(url)
        .ignoreContentType(true)
        .timeout(60000)
        .followRedirects(true)
        .header("User-Agent", "Mozilla/5.0 MessengerBotR Jsoup")
        .header("Accept", "application/json, text/plain, */*")
        .header("Content-Type", "application/json")
        .header("Connection", "close")
        .method(org.jsoup.Connection.Method.POST);

      // 인증 토큰 헤더 추가
      conn.header('Authorization', token);

      // 전송할 데이터 페이로드 생성
      var payload = JSON.stringify({
        text: msg, 
        timestamp: new Date().toISOString(), 
        sender: sender, 
        room: room, 
        isGroupChat: isGroupChat
      });

      // 요청 본문에 페이로드 추가
      conn.requestBody(payload);

      // 요청 실행 및 응답 수신
      var resp = conn.execute();
      var code = resp.statusCode();
      var body = JSON.parse(resp.body());
      
      // 정상 응답(200)일 때 결과 전송
      if (code === 200) {
        replier.reply(body.page);
        replier.reply('이미지 링크 : ' + body.image);
      } else {
        // 서버 오류 응답 처리
        replier.reply("❌ 서버 오류: HTTP " + resp.code + "\n" + String(resp.body).slice(0, 300));
        return;
      } 
      
    }  catch (e) {
      // 네트워크 또는 기타 예외 발생 시 처리
      var errorMsg = String(e);
      replier.reply("❌ 네트워크 연결 실패 : " + errorMsg);
      replier.reply(body);
      return;
    }
  }