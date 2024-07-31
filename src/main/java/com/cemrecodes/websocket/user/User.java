package com.cemrecodes.websocket.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document
@Builder
public class User {
  @Id
  private String username;
  private String fullName;
  private String password;
  private Status status;
}
