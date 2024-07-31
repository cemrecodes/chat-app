package com.cemrecodes.websocket.user;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

  private final UserRepository userRepository;

  public void connect(User user){

  }

  public void saveUser(User user){
    user.setStatus(Status.ONLINE);
    userRepository.save(user);
  }

  public void disconnect(User user){
    var storedUser = userRepository.findById(user.getUsername())
        .orElse(null);
    if(storedUser != null){
      storedUser.setStatus(Status.OFFLINE);
      userRepository.save(storedUser);
    }
  }

  public List<User> findConnectedUsers(){
    return userRepository.findAllByStatus(Status.ONLINE);
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    Optional<User> user = userRepository.findById(username);
    if(user.isEmpty()){
      throw new UsernameNotFoundException("User not found");
    }
    var userObj = user.get();
    return org.springframework.security.core.userdetails.User.builder()
        .username(userObj.getUsername())
        .password(userObj.getPassword())
        .build();
  }
}
