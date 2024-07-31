package com.cemrecodes.websocket.chat;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class ChatMessage {
  @Id
  private String id;
  private String chatId;
  private String senderId;
  private String recipientId;
  private String content;
  private Date timestamp;
}
