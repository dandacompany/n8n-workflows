function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  replier.reply("안녕하세요! " + sender + "님. 반갑습니다.");
  replier.reply("채팅방 : " + room);
  replier.reply("보내신 메세지 : " + msg);
  return;
}
