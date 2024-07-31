package com.cemrecodes.websocket.chatroom;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
  private final ChatRoomRepository chatRoomRepository;

  public Optional<String> getChatRoomId(
      String senderId,
      String recipientId,
      boolean createNewRoomIfNotExists
  ){
    return chatRoomRepository.findBySenderIdAndRecipientId(senderId, recipientId)
        .map(ChatRoom::getChatId)
        .or(() -> {
          if(createNewRoomIfNotExists){
            var chatId = createChat(senderId, recipientId);
            return Optional.of(chatId);
          }
          return  Optional.empty();
        });
  }

  private String createChat(String senderId, String recipientId) {
    var chatId = String.format("%s_%s", senderId, recipientId);

    ChatRoom senderRecipient = ChatRoom.builder()
        .senderId(senderId)
        .recipientId(recipientId)
        .chatId(chatId)
        .build();

    ChatRoom recipientSender = ChatRoom.builder()
        .senderId(recipientId)
        .recipientId(senderId)
        .chatId(chatId)
        .build();

    chatRoomRepository.save(senderRecipient);
    chatRoomRepository.save(recipientSender);

    return chatId;
  }
}
