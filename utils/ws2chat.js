const ws = require("ws");
const uuid = require("uuid");

class Chat {
  constructor() {
    // socket服务
    this.socketServer = ws.Server;
    // 服务实例
    this.wss = new this.socketServer({ port: 443 });
    // 连接用户
    this.clients = [];
    // 用户数量
    this.clientIndex = 0;

    this.wss.on("connection", this.connect.bind(this));
  }

  // 广播
  broadcastSend({ type, content, nickName, color, uuid }) {
    this.clients.forEach((client, index) => {
      if (client.ws.readyState === ws.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: type,
            nickName: nickName,
            content,
            visitedNum: this.clientIndex,
            color,
            uuid,
          })
        );
      }
    });
  }

  // 用户关闭socket
  closeSocket(uuid, nickName) {
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].id == uuid) {
        let disconnectMsg = `${nickName} quit the room`;
        this.broadcastSend({
          type: "system",
          content: disconnectMsg,
          nickName,
          uuid,
        });
        this.clients.splice(i, 1);
        this.clientIndex--;
      }
    }
  }

  // 用户连接
  connect(ws) {
    let client_uuid = uuid.v4();
    let nickName = `陌生人${++this.clientIndex}`;
    let color = this.rgb();

    // send info to user
    ws.send(
      JSON.stringify({
        type: "createRole",
        uuid: client_uuid,
        nickName,
      })
    );

    // 用户列表+1
    this.clients.push({
      id: client_uuid,
      ws: ws,
      nickName,
      color,
    });

    // 广播加入群聊消息
    this.broadcastSend({
      type: "system",
      content: "join the room",
      nickName,
      uuid: client_uuid,
    });

    // 监听消息事件
    ws.on("message", (message) => {
      console.log("这是监听消息的msg来源", message);
      //   if (message.indexOf("/nick") === 0) {
      //     let nickname_array = message.split(" ");
      //     if (nickname_array.length >= 2) {
      //       let old_nickname = nickName;
      //       nickName = nickname_array[1];
      //       let nickname_message = `visitor change ${old_nickname} to ${nickName}`;
      //       this.broadcastSend("system", nickname_message, nickName);
      //     }
      //   } else {
      //     this.broadcastSend({
      //       type: "message",
      //       content: message,
      //       uuid: client_uuid,
      //       nickName,
      //     });
      //   }

      // 广播信息
      this.broadcastSend({
        type: "message",
        content: message,
        uuid: client_uuid,
        nickName,
        color,
      });
    });

    // 监听关闭事件
    ws.on("close", () => {
      this.closeSocket(client_uuid, nickName);
    });
  }

  // 生成颜色
  rgb() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var rgb = "rgb(" + r + "," + g + "," + b + ")";
    return rgb;
  }
}

module.exports = Chat;
