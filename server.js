setInterval(async () => {
  try {
    await youtube.liveChatMessages.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          liveChatId: LIVE_CHAT_ID,
          type: "textMessageEvent",
          textMessageDetails: {
            messageText: "베베픽봇 테스트 ⏱️"
          }
        }
      }
    });
    console.log("채팅 전송 성공");
  } catch (e) {
    console.error("채팅 전송 실패", e.message);
  }
}, 10000);
