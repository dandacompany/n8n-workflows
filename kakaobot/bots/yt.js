function findYouTubeLinks(message) {
  const urlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(?:[&?][^\s]*)?)/g;
  let matches = [];
  let match;
  while ((match = urlPattern.exec(message)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function isYouTubeLink(url) {
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}(?:[&?][^\s]*)?$/;
  return ytRegex.test(url);
}

function extractYouTubeVideoID(url) {
  const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    var url = "https://n8n.example.com/webhook/summarize-yt";
    var token = "xxxxxxxxxxxxxxxx";

    // 메시지 내 모든 유튜브 링크 추출
    var links = findYouTubeLinks(msg);
    if (links.length === 0) {
        return;
    }

    links.forEach(function(link) {
        var videoID = extractYouTubeVideoID(link);
        if (!videoID) return; // videoID가 없으면 무시

        replier.reply("🤖 요청을 처리 중입니다...");

        try {
            var conn = org.jsoup.Jsoup.connect(url)
                .ignoreContentType(true)
                .timeout(60000)
                .followRedirects(true)
                .header("User-Agent", "Mozilla/5.0 MessengerBotR Jsoup")
                .header("Accept", "application/json, text/plain, */*")
                .header("Content-Type", "application/json")
                .header("Connection", "close")
                .method(org.jsoup.Connection.Method.POST)
                .header('Authorization', token);

            var payload = JSON.stringify({
                videoID: videoID, 
                timestamp: new Date().toISOString(), 
                sender: sender, 
                room: room, 
                isGroupChat: isGroupChat
            });

            conn.requestBody(payload);
            var resp = conn.execute();
            var code = resp.statusCode();
            var body = JSON.parse(resp.body());
            if (code === 200) {
                replier.reply(body);
            } else {
                replier.reply("❌ 서버 오류: HTTP " + code + "\n" + String(resp.body).slice(0, 300));
            }
        } catch (e) {
            replier.reply("❌ 네트워크 연결 실패 : " + String(e));
        }
    });
}
