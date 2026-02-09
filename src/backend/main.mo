import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type UserProfile = {
    displayName : Text;
  };

  public type ChatMessage = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Int;
    isRead : Bool;
  };

  module ChatMessage {
    public func compare(msg1 : ChatMessage, msg2 : ChatMessage) : Order.Order {
      switch (Int.compare(msg1.timestamp, msg2.timestamp)) {
        case (#equal) { Nat.compare(msg1.id, msg2.id) };
        case (order) { order };
      };
    };
  };

  public type ChatThread = {
    participants : (Principal, Principal);
    messages : List.List<ChatMessage>;
    lastActivity : Int;
  };

  module ThreadParticipant {
    public func compare(p1 : (Principal, Principal), p2 : (Principal, Principal)) : Order.Order {
      switch (Principal.compare(p1.0, p2.0)) {
        case (#equal) { Principal.compare(p1.1, p2.1) };
        case (order) { order };
      };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let chatThreads = Map.empty<(Principal, Principal), ChatThread>();
  var nextMessageId = 1;
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func setUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getChatList() : async [{ participants : (Principal, Principal); lastActivity : Int }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat list");
    };

    let chatList = List.empty<{ participants : (Principal, Principal); lastActivity : Int }>();

    for ((participants, thread) in chatThreads.entries()) {
      if (participants.0 == caller or participants.1 == caller) {
        chatList.add({ participants; lastActivity = thread.lastActivity });
      };
    };

    chatList.toArray();
  };

  public query ({ caller }) func getMessages(withUser : Principal) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };

    let participants = switch (Principal.compare(caller, withUser)) {
      case (#less) { (caller, withUser) };
      case (_) { (withUser, caller) };
    };

    if (participants.0 != caller and participants.1 != caller) {
      Runtime.trap("Unauthorized: Can only access messages in your own threads");
    };

    switch (chatThreads.get(participants)) {
      case (null) { [] };
      case (?thread) { thread.messages.toArray().sort() };
    };
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (content.size() > 1000) {
      Runtime.trap("Message content exceeds 1000 character limit");
    };

    let participants = switch (Principal.compare(caller, receiver)) {
      case (#less) { (caller, receiver) };
      case (_) { (receiver, caller) };
    };

    if (participants.0 == participants.1) {
      Runtime.trap("Cannot send messages to yourself");
    };

    let message : ChatMessage = {
      id = nextMessageId;
      sender = caller;
      receiver;
      content;
      timestamp = Time.now();
      isRead = false;
    };

    nextMessageId += 1;

    switch (chatThreads.get(participants)) {
      case (null) {
        let messages = List.empty<ChatMessage>();
        messages.add(message);
        chatThreads.add(
          participants,
          {
            participants;
            messages;
            lastActivity = message.timestamp;
          },
        );
      };
      case (?thread) {
        thread.messages.add(message);
        chatThreads.add(
          participants,
          {
            participants;
            messages = thread.messages;
            lastActivity = message.timestamp;
          },
        );
      };
    };
  };

  public shared ({ caller }) func markMessagesAsRead(withUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    let participants = switch (Principal.compare(caller, withUser)) {
      case (#less) { (caller, withUser) };
      case (_) { (withUser, caller) };
    };

    if (participants.0 != caller and participants.1 != caller) {
      Runtime.trap("Unauthorized: Can only mark messages as read in your own threads");
    };

    switch (chatThreads.get(participants)) {
      case (null) { Runtime.trap("Chat thread does not exist") };
      case (?thread) {
        let updatedMessages = thread.messages.map<ChatMessage, ChatMessage>(
          func(msg) {
            if (msg.receiver == caller) { { msg with isRead = true } } else {
              msg;
            };
          }
        );
        chatThreads.add(
          participants,
          {
            participants;
            messages = updatedMessages;
            lastActivity = thread.lastActivity;
          },
        );
      };
    };
  };

  public query ({ caller }) func getUnreadMessageCount(withUser : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access unread message count");
    };

    let participants = switch (Principal.compare(caller, withUser)) {
      case (#less) { (caller, withUser) };
      case (_) { (withUser, caller) };
    };

    if (participants.0 != caller and participants.1 != caller) {
      Runtime.trap("Unauthorized: Can only access unread count in your own threads");
    };

    switch (chatThreads.get(participants)) {
      case (null) { 0 };
      case (?thread) {
        var count = 0;
        let messagesIter = thread.messages.values();
        loop {
          switch (messagesIter.next()) {
            case (null) { return count };
            case (?msg) {
              if (msg.receiver == caller and not msg.isRead) { count += 1 };
            };
          };
        };
      };
    };
  };
};
