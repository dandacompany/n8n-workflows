function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    // "/help" 또는 "/도움말"로 시작하지 않으면 함수 종료
    if(!msg.startsWith("/help") && !msg.startsWith("/도움말")) {    
        return;
    }

    try {
        // 도움말 메시지 작성
        var helpMessage = "🤖 카카오봇 사용 가이드\n\n";
        helpMessage += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        helpMessage += "📝 AI 챗봇\n";
        helpMessage += "• /gem [질문]\n";
        helpMessage += "  → Gemini AI와 대화하기\n";
        helpMessage += "  예시: /gem 안녕하세요\n\n";
        
        helpMessage += "🎨 이미지 생성\n";
        helpMessage += "• /nano [이미지 URL] [설명]\n";
        helpMessage += "  → 나노바나나 이미지 생성\n";
        helpMessage += "  예시: /nano 귀여운 고양이\n\n";
        
        helpMessage += "🎬 동영상 생성\n";
        helpMessage += "• /sd [이미지 URL] [설명]\n";
        helpMessage += "  → Seedance 동영상 생성 (1-2분 소요)\n";
        helpMessage += "  예시: /sd 춤추는 로봇\n\n";
        
        helpMessage += "• /sora [이미지 URL] [설명]\n";
        helpMessage += "  → Sora 동영상 생성 (3-4분 소요)\n";
        helpMessage += "  예시: /sora 바다를 날아가는 새\n\n";
        
        helpMessage += "📺 유튜브 요약\n";
        helpMessage += "• 유튜브 링크 전송\n";
        helpMessage += "  → 자동으로 영상 내용 요약\n";
        
        helpMessage += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
        helpMessage += "❓ 도움이 필요하시면\n";
        helpMessage += "/help 또는 /도움말 입력\n";
        
        // 도움말 메시지 전송
        replier.reply(helpMessage);
        
    } catch (e) {
        // 예외 발생 시 에러 메시지 전송
        var errorMsg = String(e);
        replier.reply("❌ 도움말 표시 실패: " + errorMsg);
        return;
    }
}

