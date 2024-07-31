package com.cemrecodes.websocket.chat;

import com.cemrecodes.websocket.chatroom.ChatRoomService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

  private final ChatMessageRepository chatMessageRepository;
  private final ChatRoomService chatRoomService;

  public ChatMessage save(ChatMessage chatMessage){
    var chatId = chatRoomService.getChatRoomId(
        chatMessage.getSenderId(),
        chatMessage.getRecipientId(),
        true
    ).orElseThrow();
    chatMessage.setChatId(chatId);
    return chatMessageRepository.save(chatMessage);
  }

  public List<ChatMessage> findChatMessages(
      String senderId, String recipientId
  ){
    var chatId = chatRoomService.getChatRoomId(
        senderId,
        recipientId,
        false
    );
    return chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
  }
}
